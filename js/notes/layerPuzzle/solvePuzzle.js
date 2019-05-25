import { isWithinXGrid, isWithinYGrid } from './gridDimensions.js'
import { OBSTACLE, TARGET, EMPTY } from './blockTypes.js'
import { generateKey, getValuesFromKey } from './generateKey.js'
import { createLines } from './createLinesOnGrid.js'
import { arrayCopy, isObjectEmpty, getOtherDirection, getAllSubsets } from './helpers.js'
import { debugDraw } from './draw.js'

let iterations
let largestSequenceToWin
let partialWinGrid
let partialWinResults

const findTargetInGrid = currentGrid => {
  let targetRow = currentGrid.findIndex(row => row.some(block => block === TARGET))
  let targetCol = currentGrid[targetRow].findIndex(block => block === TARGET)
  return {
    targetRow,
    targetCol,
  }
}

const canReachTargetByOverlappingSingleRow = (results, target) => {
  const { targetRow, targetCol } = target

  const row = 1
  const col = 0

  const initialReachState = {
    totalSum: 0,
    withinReach: false,
  }

  const isWithinReach = (target, axis) => (accumulator, key) => {
    const distanceToMatch = Math.abs(getValuesFromKey(key)[axis] - target)
    if (results[key].value + accumulator.totalSum >= distanceToMatch) {
      return { totalSum: accumulator.totalSum, withinReach: true }
    } else {
      return {
        totalSum: accumulator.totalSum + results[key].value + 1, // 1 for the block itself
        withinReach: accumulator.withinReach,
      }
    }
  }

  const sortBy = index => (a, b) => getValuesFromKey(a)[index] - getValuesFromKey(b)[index]

  const keysMatchingRow = Object.keys(results)
    .filter(key => getValuesFromKey(key)[row] === targetRow)
    .sort(sortBy(col))

  const keysMatchingCol = Object.keys(results)
    .filter(key => getValuesFromKey(key)[col] === targetCol)
    .sort(sortBy(row))

  const leftRowResults = keysMatchingRow
    .filter(key => getValuesFromKey(key)[col] < targetCol)
    .reverse()
    .reduce(isWithinReach(targetCol, col), initialReachState)

  const rightRowResults = keysMatchingRow
    .filter(key => getValuesFromKey(key)[col] > targetCol)
    .reduce(isWithinReach(targetCol, col), initialReachState)

  const topColResults = keysMatchingCol
    .filter(key => getValuesFromKey(key)[row] < targetRow)
    .reverse()
    .reduce(isWithinReach(targetRow, row), initialReachState)

  const bottomColResults = keysMatchingCol
    .filter(key => getValuesFromKey(key)[row] > targetRow)
    .reduce(isWithinReach(targetRow, row), initialReachState)

  return (
    leftRowResults.withinReach ||
    rightRowResults.withinReach ||
    topColResults.withinReach ||
    bottomColResults.withinReach
  )
}

const checkIfStateIsBroken = (results, currentGrid) => {
  const target = findTargetInGrid(currentGrid)
  return canReachTargetByOverlappingSingleRow(results, target)
}

const checkGridForWin = (results, currentGrid) => {
  const totalRemainingBlocks = currentGrid.reduce((acc, current, rowIndex) => {
    const results = current
      .map((item, index) => (item === OBSTACLE ? index : -1))
      .filter(colIndex => colIndex !== -1)
      .map(colIndex => generateKey(colIndex, rowIndex))
    return acc.concat(results)
  }, [])

  const totalBlocksWithHints = Object.keys(results)

  const allRemainingBlocksHaveHints = totalRemainingBlocks.every(item =>
    totalBlocksWithHints.includes(item)
  )
  const allHintsHaveBlocks = totalBlocksWithHints.every(item => totalRemainingBlocks.includes(item))

  return allRemainingBlocksHaveHints && allHintsHaveBlocks
}

// const isSpaceCoveredByAnotherResult

// A partial win is a collection of blocks with hints that lead to the goal, with no blocks without hints in between
const checkGridForPartialWin = (results, currentGrid) => {
  // debugDraw(results, currentGrid)
  const totalBlocksWithHintsByOrder = Object.keys(results)
    .map(key => Object.assign(results[key], { key }))
    .sort((a, b) => b.sortingOrderNumber - a.sortingOrderNumber)
    .reverse()

  let isPartialWin = true
  totalBlocksWithHintsByOrder.forEach(result => {
    if (isPartialWin === false) return
    const { x, y } = result.lineDelta

    const [resultCol, resultRow] = getValuesFromKey(result.key)

    let currentCol = resultCol
    let currentRow = resultRow
    let totalCheckDistance = result.value

    while (totalCheckDistance > 0 && isPartialWin) {
      currentRow += y
      currentCol += x
      if (!isWithinXGrid(currentCol)) {
        isPartialWin = false
      }
      if (!isWithinYGrid(currentRow)) {
        isPartialWin = false
      }

      if (isPartialWin) {
        const newBlock = currentGrid[currentRow][currentCol]
        if (newBlock === EMPTY) {
          totalCheckDistance--
        } else if (newBlock === OBSTACLE) {
          const keyToValidate = generateKey(currentCol, currentRow)
          if (!results[keyToValidate]) {
            isPartialWin = false
          }
        }
      }
    }
  })

  if (isPartialWin && totalBlocksWithHintsByOrder.length > largestSequenceToWin) {
    largestSequenceToWin = totalBlocksWithHintsByOrder.length
    console.log('setting a partial result', largestSequenceToWin, iterations)
    partialWinGrid = currentGrid
    partialWinResults = results
  }
}

const cleanPartialWinGrid = (results, currentGrid) => {
  const newGrid = arrayCopy(currentGrid)
  return newGrid.map((row, rowIndex) => {
    return row.map((block, colIndex) => {
      if (block === OBSTACLE && !results[generateKey(colIndex, rowIndex)]) {
        return EMPTY
      }
      return block
    })
  })
}

const backtrackingUnzip = (
  results,
  currentGrid,
  intersectionPoints,
  gridLineInfo,
  target,
  randomizer,
  solutionOrderNumber
) => {
  if (iterations++ > 20000) {
    console.log('too many iterations')
    return { results, currentGrid }
  }

  const isBroken = checkIfStateIsBroken(results, currentGrid)
  if (isBroken) {
    return { results, currentGrid }
  }
  let isWinner = checkGridForWin(results, currentGrid)
  if (isWinner) {
    return { results, currentGrid }
  }

  let { targetRow, targetCol } = target
  // drawTarget = target
  const key = generateKey(targetCol, targetRow)

  let currentLineInfo = {
    direction: undefined,
    index: undefined,
    line: undefined,
  }

  // Assert there is only one direction this could have come from
  const validDirections = Object.keys(gridLineInfo).filter(direction => {
    return (
      gridLineInfo[direction].filter((line, index) => {
        const containsTarget = line.includes(key)
        if (containsTarget) {
          currentLineInfo.line = arrayCopy(line)
          currentLineInfo.direction = direction
          currentLineInfo.index = index
        }
        return containsTarget
      }).length === 1
    )
  })

  if (validDirections.length > 1 || currentLineInfo.line === undefined) {
    return { results, currentGrid }
  }

  let targetIndex = currentLineInfo.line.indexOf(key)

  const { line: currentLine, direction: currentDirection } = currentLineInfo

  // Assert that the target is at the beginning/end of a line
  if (targetIndex !== 0 && targetIndex !== currentLine.length - 1) {
    // If not, we need to split the current line into multiple sections
    const shiftValue = randomizer() > 0.5 ? 0 : 1

    const firstChunk = currentLine.slice(0, targetIndex + shiftValue)
    const secondChunk = currentLine.slice(targetIndex + shiftValue)

    // remove the current troublesome line
    gridLineInfo[currentDirection].splice(currentLineInfo.index, 1)

    // replace with two new lines
    gridLineInfo[currentDirection].push(firstChunk)
    gridLineInfo[currentDirection].push(secondChunk)

    const chunkToUse = firstChunk.indexOf(key) !== -1 ? firstChunk : secondChunk

    // Update our details to use the target
    currentLineInfo.line = arrayCopy(chunkToUse)
    currentLineInfo.index = gridLineInfo[currentDirection].indexOf(chunkToUse)
    targetIndex = chunkToUse.indexOf(key)
  }

  const removalFunc = targetIndex === 0 ? 'shift' : 'pop'

  // Remove targetblock that we used to come in here
  currentLineInfo.line[removalFunc]()

  const endBlock = getEndBlock(currentLineInfo.line, targetIndex)

  if (
    !endBlock ||
    isEndBlockEmpty(endBlock, currentGrid) ||
    isEndBlockAlreadyUsed(endBlock, results)
  ) {
    // check to see if the directions match and adjust - should never get in here
    return { results, currentGrid }
  }

  const listOfPossibleStates = getAllPossibleLineCases({
    currentLine: arrayCopy(currentLineInfo.line),
    currentDirection,
    endBlock,
    gridLineInfo,
    currentGrid,
    currentResults: arrayCopy(results),
    currentIntersectionPoints: arrayCopy(intersectionPoints),
  })

  if (!listOfPossibleStates.length) {
    return { results, currentGrid }
  }

  let currentCase = listOfPossibleStates.shift()
  currentCase = modifyGridWithCurrentLine({
    currentCase,
    removalFunc,
    target,
    lineIndex: currentLineInfo.index,
    solutionOrderNumber,
  })

  // debugDraw(results, currentGrid)

  if (
    checkGridForWin(currentCase.currentResults, currentCase.currentGrid) ||
    checkIfStateIsBroken(currentCase.currentResults, currentCase.currentGrid)
  ) {
    return { results: currentCase.currentResults, currentGrid: currentCase.currentGrid }
  }

  checkGridForPartialWin(currentCase.currentResults, currentCase.currentGrid)

  while (currentCase.intersectionPoints.length) {
    const currentPoint = currentCase.intersectionPoints.pop()
    const splitPoint = currentPoint.split(',')
    const newTarget = { targetCol: splitPoint[0], targetRow: splitPoint[1] }

    const response = backtrackingUnzip(
      currentCase.currentResults,
      arrayCopy(currentCase.currentGrid),
      arrayCopy(currentCase.intersectionPoints),
      arrayCopy(currentCase.gridLineInfo),
      newTarget,
      randomizer,
      solutionOrderNumber + 1
    )

    if (checkGridForWin(response.results, response.currentGrid)) {
      return response
    }

    if (!currentCase.intersectionPoints.length && listOfPossibleStates.length) {
      currentCase = listOfPossibleStates.shift()
      currentCase = modifyGridWithCurrentLine({
        currentCase,
        removalFunc,
        target,
        lineIndex: currentLineInfo.index,
        solutionOrderNumber,
      })
      checkGridForPartialWin(currentCase.currentResults, currentCase.currentGrid)
      currentGrid = currentCase.currentGrid
      results = currentCase.currentResults
    }
  }

  return { results, currentGrid }
}

const modifyGridWithCurrentLine = ({
  currentCase,
  removalFunc,
  target,
  lineIndex,
  solutionOrderNumber,
}) => {
  let {
    intersectionPoints,
    gridLineInfo,
    currentLine,
    direction,
    blockValue,
    currentResults,
    currentGrid,
  } = currentCase

  const convertRemovalToMovementDirection = (direction, removalFunc) => {
    if (direction === 'horizontal') {
      if (removalFunc === 'shift') {
        return { x: -1, y: 0 }
      } else if (removalFunc === 'pop') {
        return { x: 1, y: 0 }
      }
    } else if (direction === 'vertical') {
      if (removalFunc === 'shift') {
        return { x: 0, y: -1 }
      } else if (removalFunc === 'pop') {
        return { x: 0, y: 1 }
      }
    }
    return removalFunc
  }

  const newCurrentLine = arrayCopy(currentLine)

  while (newCurrentLine.length) {
    const currentEntry = newCurrentLine[removalFunc]()
    if (!newCurrentLine.length) {
      if (currentGrid[target.targetRow][target.targetCol] !== TARGET) {
        currentGrid[target.targetRow][target.targetCol] = EMPTY
      }

      currentResults[currentEntry] = {
        value: blockValue,
        direction,
        lineDelta: convertRemovalToMovementDirection(direction, removalFunc),
        solutionOrderNumber,
      }

      // Remove lines that cannot be used due to being added in this particular direction
      const otherDirection = getOtherDirection(direction)
      const otherLinesToCheck = gridLineInfo[otherDirection]

      if (otherLinesToCheck.some(line => line.includes(currentEntry))) {
        const linesWithCurrentEntryRemoved = otherLinesToCheck
          .map(adjustLinesWithCurrentBlock(currentEntry))
          .filter(lines => lines.length > 0)
        gridLineInfo[otherDirection] = linesWithCurrentEntryRemoved
      }
    } else if (!doesPointIntersect(gridLineInfo, currentEntry)) {
      if (!Object.keys(currentResults).includes(currentEntry)) {
        const [removalCol, removalRow] = currentEntry.split(',')
        currentGrid[removalRow][removalCol] = EMPTY
      }
    }
  }
  gridLineInfo[direction].splice(lineIndex, 1)

  // Remove 'lines' that are only length one or zero due to the splitting
  Object.keys(gridLineInfo).forEach(direction => {
    gridLineInfo[direction] = gridLineInfo[direction].filter(line => line.length > 1)
  })

  return Object.assign(currentCase, {
    currentGrid,
    currentResults,
    gridLineInfo,
    intersectionPoints,
  })
}

const getAllPossibleLineCases = ({
  currentLine,
  currentDirection,
  endBlock,
  gridLineInfo,
  currentGrid,
  currentResults,
  currentIntersectionPoints,
}) => {
  const currentLineLength = currentLine.length

  const createLineCase = ({ blockValue, intersectionPoints }) => ({
    currentLine: arrayCopy(currentLine),
    blockValue,
    direction: currentDirection,
    intersectionPoints,
    currentGrid: arrayCopy(currentGrid),
    currentResults: arrayCopy(currentResults),
    gridLineInfo: arrayCopy(gridLineInfo),
  })

  const intersectingBlocks = currentLine.filter(
    point => doesPointIntersect(gridLineInfo, point) && point !== endBlock
  )
  const possibleCases = getAllSubsets(intersectingBlocks)

  return possibleCases
    .reverse()
    .map(intersectingCase => {
      return createLineCase({
        blockValue: currentLineLength - intersectingCase.length,
        intersectionPoints: currentIntersectionPoints.concat(intersectingCase),
      })
    })
    .filter(newLineCase => newLineCase.blockValue > 0)
}

const doesPointIntersect = (gridLineInfo, currentEntry) => {
  return Object.keys(gridLineInfo).every(direction => {
    return gridLineInfo[direction].some(row => row.some(block => block === currentEntry))
  })
}

const isEndBlockEmpty = (endBlock, currentGrid) => {
  const [column, row] = getValuesFromKey(endBlock)
  return currentGrid[row][column] === EMPTY
}

const isEndBlockAlreadyUsed = (endBlock, results) => {
  return !!results[endBlock]
}

const getEndBlock = (currentLine, index) =>
  index === 0 ? currentLine[currentLine.length - 1] : currentLine[0]

const adjustLinesWithCurrentBlock = currentEntry => line => {
  const removeEntry = (startIndex, endIndex) => line => {
    return line.length > 2 ? line.slice(startIndex, endIndex) : []
  }

  const removeLastEntry = removeEntry(0, line.length - 1)
  const removeFirstEntry = removeEntry(1, line.length)

  if (line.includes(currentEntry)) {
    if (line.indexOf(currentEntry) === line.length - 1) {
      return removeLastEntry(line)
    } else if (line.indexOf(currentEntry) === 0) {
      return removeFirstEntry(line, 1, line.length)
    } else {
      // Third case - the offending entry is in the middle (we treat this like we will slide over it)
      // But it cannot be used in another case
      line.splice(line.indexOf(currentEntry), 1)
      return line
    }
  }
  return line
}

export const generateSolvedPuzzle = (initialGrid, randomizer) => {
  iterations = 0
  largestSequenceToWin = 0
  partialWinGrid = {}
  partialWinResults = {}

  const lineGrid = createLines(initialGrid)

  const mainTarget = findTargetInGrid(initialGrid)

  let results = {}
  const initialSolutionNumber = 1

  const recursiveResult = backtrackingUnzip(
    results,
    initialGrid,
    [],
    lineGrid,
    mainTarget,
    randomizer,
    initialSolutionNumber
  )

  results = recursiveResult.results
  let createdGrid = recursiveResult.currentGrid

  if (!isObjectEmpty(partialWinGrid) && !isObjectEmpty(partialWinResults)) {
    if (largestSequenceToWin > Object.keys(recursiveResult.results).length) {
      console.log('using a partial result')
      results = partialWinResults
      createdGrid = cleanPartialWinGrid(partialWinResults, partialWinGrid)
      const target = findTargetInGrid(createdGrid)
      canReachTargetByOverlappingSingleRow(results, target)
    }
  }

  return {
    grid: createdGrid,
    results,
  }
}
