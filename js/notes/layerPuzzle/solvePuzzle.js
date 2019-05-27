import { isWithinXGrid, isWithinYGrid } from './gridDimensions.js'
import { OBSTACLE, TARGET, EMPTY } from './blockTypes.js'
import { slideBlock } from './gridMovement.js'
import { generateKey, getValuesFromKey } from './generateKey.js'
import { createLines } from './createLinesOnGrid.js'
import {
  arrayCopy,
  isObjectEmpty,
  getOtherDirection,
  getAllSubsets,
  convertLineDeltaToDirection,
} from './helpers.js'
import { debugDraw } from './draw.js'

let iterations
let largestSequenceToWin
let partialWinGrid
let partialWinResults

const ITERATIONS_COUNT = 20000

const LEFT = { x: -1, y: 0 }
const RIGHT = { x: 1, y: 0 }
const UP = { x: 0, y: -1 }
const DOWN = { x: 0, y: 1 }

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

const findIsolatedBlocks = (results, currentGrid) => {
  return currentGrid.reduce((acc, row, rowIndex) => {
    const isolatedBlocks = row.reduce((isolatedBlockAccumulator, block, colIndex) => {
      if (block === OBSTACLE) {
        const currentKey = generateKey(colIndex, rowIndex)
        if (results[currentKey]) {
          return isolatedBlockAccumulator
        } else {
          const hasEmptyHorizontalNeighbors = neighborIndex =>
            !isWithinXGrid(neighborIndex) ||
            (isWithinXGrid(neighborIndex) &&
              (currentGrid[rowIndex][neighborIndex] === EMPTY ||
                !!results[generateKey(neighborIndex, rowIndex)]))

          const hasEmptyVerticalNeighbors = neighborIndex =>
            !isWithinYGrid(neighborIndex) ||
            (isWithinYGrid(neighborIndex) &&
              (currentGrid[neighborIndex][colIndex] === EMPTY ||
                !!results[generateKey(colIndex, neighborIndex)]))

          const leftIsEmpty = hasEmptyHorizontalNeighbors(colIndex - 1)
          const rightIsEmpty = hasEmptyHorizontalNeighbors(colIndex + 1)
          const topIsEmpty = hasEmptyVerticalNeighbors(rowIndex - 1)
          const bottomIsEmpty = hasEmptyVerticalNeighbors(rowIndex + 1)

          if (leftIsEmpty && rightIsEmpty && topIsEmpty && bottomIsEmpty) {
            return isolatedBlockAccumulator.concat([generateKey(colIndex, rowIndex)])
          }
        }
      }
      return isolatedBlockAccumulator
    }, [])

    return acc.concat(isolatedBlocks)
  }, [])
}

// Solitary block (no possible lines around it) that another line in the result set has indicated that it will be handled
// This is a broken case
const checkForIsolatedBlocksInRequiredLines = (results, currentGrid) => {
  const isolatedBlocks = findIsolatedBlocks(results, currentGrid)

  const needsIsolatedBlock = block => isolatedBlocks.includes(block)
  const neededBlockIsNotIsolated = result =>
    result.blocksHandledByOthers.some(needsIsolatedBlock) === false

  return !Object.values(results).every(neededBlockIsNotIsolated)
}

const checkIfStateIsBroken = (results, currentGrid) => {
  const target = findTargetInGrid(currentGrid)
  const hasIsolatedBlocks = checkForIsolatedBlocksInRequiredLines(results, currentGrid)
  return canReachTargetByOverlappingSingleRow(results, target) || hasIsolatedBlocks
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

const isBlockHandledByAnotherLine = (totalBlocksWithHints, currentBlockKey, currentResult) => {
  let isHandled = false
  totalBlocksWithHints.forEach(result => {
    if (result.key !== currentResult.key) {
      if (result.blocksHandledByLine.includes(currentBlockKey)) {
        isHandled = true
      }
    }
  })
  return isHandled
}

const checkIsPartialWin = (results, currentGrid, totalBlocksWithHintsByOrder) => {
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
        const keyToValidate = generateKey(currentCol, currentRow)
        if (newBlock === TARGET) {
          isPartialWin = true
          totalCheckDistance--
          return true
        } else if (newBlock === EMPTY) {
          const isHandledByAnotherLine = isBlockHandledByAnotherLine(
            totalBlocksWithHintsByOrder,
            keyToValidate,
            result
          )

          if (!isHandledByAnotherLine) {
            totalCheckDistance--
          }
        } else if (newBlock === OBSTACLE) {
          if (!results[keyToValidate]) {
            isPartialWin = false
          }
        }
      }
    }
  })

  return isPartialWin
}

// A partial win is a collection of blocks with hints that lead to the goal, with no blocks without hints in between
const checkGridForPartialWin = (results, currentGrid) => {
  // debugDraw(results, currentGrid)
  const totalBlocksWithHintsByOrder = Object.keys(results)
    .map(key => Object.assign(results[key], { key }))
    .sort((a, b) => b.sortingOrderNumber - a.sortingOrderNumber)
    .reverse()

  const isPartialWin = checkIsPartialWin(results, currentGrid, totalBlocksWithHintsByOrder)

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
  if (iterations++ > ITERATIONS_COUNT) {
    if (isObjectEmpty(partialWinGrid) && isObjectEmpty(partialWinResults)) {
      console.log('we are past iteration count')
      // throw new Error('was not able to solve')
    }
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
  const targetBlock = currentLineInfo.line[removalFunc]()

  const lineOriginBlock = getLineOriginBlock(currentLineInfo.line, targetIndex)

  if (
    !lineOriginBlock ||
    isLineOriginBlockEmpty(lineOriginBlock, currentGrid) ||
    isLineOriginBlockAlreadyUsed(lineOriginBlock, results)
  ) {
    // check to see if the directions match and adjust - should never get in here
    return { results, currentGrid }
  }

  const listOfPossibleCases = getAllPossibleLineCases({
    currentLine: arrayCopy(currentLineInfo.line),
    currentDirection,
    lineOriginBlock,
    targetBlock,
    gridLineInfo,
    currentGrid,
    currentResults: arrayCopy(results),
    currentIntersectionPoints: arrayCopy(intersectionPoints),
  })

  if (!listOfPossibleCases.length) {
    return { results, currentGrid }
  }

  const caseRemovalFunc = 'shift'

  let currentCase = listOfPossibleCases[caseRemovalFunc]()

  currentCase = modifyGridWithCurrentLine({
    currentCase,
    removalFunc,
    target,
    lineIndex: currentLineInfo.index,
    solutionOrderNumber,
  })

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

    if (!currentCase.intersectionPoints.length && listOfPossibleCases.length) {
      currentCase = listOfPossibleCases[caseRemovalFunc]()

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

const convertRemovalToMovementDirection = (direction, removalFunc) => {
  if (direction === 'horizontal') {
    if (removalFunc === 'shift') {
      return LEFT
    } else if (removalFunc === 'pop') {
      return RIGHT
    }
  } else if (direction === 'vertical') {
    if (removalFunc === 'shift') {
      return UP
    } else if (removalFunc === 'pop') {
      return DOWN
    }
  }
  return removalFunc
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
    blocksHandledByLine,
    blocksHandledByOthers,
  } = currentCase

  const newCurrentLine = arrayCopy(currentLine)

  while (newCurrentLine.length) {
    const currentEntry = newCurrentLine[removalFunc]()
    if (!newCurrentLine.length) {
      if (currentGrid[target.targetRow][target.targetCol] !== TARGET) {
        currentGrid[target.targetRow][target.targetCol] = EMPTY
      }

      currentResults[currentEntry] = {
        value: blockValue,
        blocksHandledByLine,
        blocksHandledByOthers,
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
    } else if (blocksHandledByLine.includes(currentEntry)) {
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
  lineOriginBlock,
  targetBlock,
  gridLineInfo,
  currentGrid,
  currentResults,
  currentIntersectionPoints,
}) => {
  const currentLineLength = currentLine.length

  const createLineCase = ({
    blockValue,
    intersectionPoints,
    blocksHandledByLine,
    blocksHandledByOthers,
  }) => ({
    currentLine: arrayCopy(currentLine),
    blockValue,
    blocksHandledByLine,
    blocksHandledByOthers,
    direction: currentDirection,
    intersectionPoints,
    currentGrid: arrayCopy(currentGrid),
    currentResults: arrayCopy(currentResults),
    gridLineInfo: arrayCopy(gridLineInfo),
  })

  const intersectingBlocks = currentLine.filter(
    point => doesPointIntersect(gridLineInfo, point) && point !== lineOriginBlock
  )

  const possibleCases = getAllSubsets(intersectingBlocks)

  const sortingCalculator = possibleCase => {
    return (
      possibleCase.blocksHandledByLine.length * possibleCase.blocksHandledByLine.length +
      possibleCase.blocksHandledByOthers.length * possibleCase.blocksHandledByOthers.length
    )
  }

  const allCases = possibleCases
    .map(intersectingCase => {
      const newBlocksHandledByLine = currentLine.filter(
        point => point !== lineOriginBlock && !intersectingCase.includes(point)
      )

      return createLineCase({
        blockValue: currentLineLength - intersectingCase.length,
        intersectionPoints: currentIntersectionPoints.concat(intersectingCase),
        blocksHandledByLine: newBlocksHandledByLine.concat([targetBlock]),
        blocksHandledByOthers: intersectingCase,
      })
    })
    .filter(newLineCase => newLineCase.blockValue > 0)
    .sort((a, b) => {
      return sortingCalculator(b) - sortingCalculator(a)
    })
    .reverse()

  return allCases
}

const doesPointIntersect = (gridLineInfo, currentEntry) => {
  return Object.keys(gridLineInfo).every(direction => {
    return gridLineInfo[direction].some(row => row.some(block => block === currentEntry))
  })
}

const isLineOriginBlockEmpty = (lineOriginBlock, currentGrid) => {
  const [column, row] = getValuesFromKey(lineOriginBlock)
  return currentGrid[row][column] === EMPTY
}

const isLineOriginBlockAlreadyUsed = (lineOriginBlock, results) => {
  return !!results[lineOriginBlock]
}

const getLineOriginBlock = (currentLine, index) =>
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

const distanceFromTarget = (target, point) => {
  const [col, row] = getValuesFromKey(point)
  const sqr = item => item * item
  return Math.sqrt(sqr(col - target.targetCol) + sqr(row - target.targetRow))
}

const resultKeyWithDistance = (blockKey, depth) => [
  { blockKey, depth, direction: RIGHT },
  { blockKey, depth, direction: UP },
  { blockKey, depth, direction: LEFT },
  { blockKey, depth, direction: DOWN },
]

const recursiveSolver = (results, currentGrid, sortedResultsClosestToTarget, depth) => {
  if (depth >= 6 || !sortedResultsClosestToTarget[depth]) {
    return { results, currentGrid }
  }

  const searchSpace = resultKeyWithDistance(sortedResultsClosestToTarget[depth], depth)
  while (searchSpace.length) {
    const currentSlideInfo = searchSpace.pop()

    let slideResults = slideBlock(
      arrayCopy(results),
      arrayCopy(currentGrid),
      currentSlideInfo.blockKey,
      currentSlideInfo.direction
    )

    if (slideResults.foundTarget) {
      return Object.assign(slideResults, { slideInfo: [currentSlideInfo] })
    }

    slideResults = recursiveSolver(
      slideResults.results,
      slideResults.currentGrid,
      sortedResultsClosestToTarget,
      depth + 1
    )

    if (slideResults.foundTarget) {
      slideResults.slideInfo.push(currentSlideInfo)
      return slideResults
    }
  }
  return { results, currentGrid }
}

const bruteForceSolver = (results, currentGrid, target) => {
  const resultPoints = Object.keys(results)
  const sortedResultsClosestToTarget = resultPoints.sort(
    (a, b) => distanceFromTarget(target, a) - distanceFromTarget(target, b)
  )

  let currentIndex = 0

  const bruteForce = recursiveSolver(
    arrayCopy(results),
    arrayCopy(currentGrid),
    sortedResultsClosestToTarget,
    currentIndex
  )

  if (bruteForce.foundTarget) {
    console.log('using a simpler result')
    const newResults = {}
    const newResultInfo = {}
    bruteForce.slideInfo.forEach(
      item =>
        (newResultInfo[item.blockKey] = {
          lineDelta: item.direction,
          direction: convertLineDeltaToDirection(item.direction),
          solutionOrderNumber: item.depth,
        })
    )

    Object.keys(bruteForce.results)
      .filter(key => bruteForce.results[key].value === 0)
      .forEach(key => {
        newResults[key] = Object.assign(results[key], newResultInfo[key])
      })

    return { results: newResults, currentGrid: cleanPartialWinGrid(newResults, currentGrid) }
  }

  return { results, currentGrid }
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

  const { currentGrid: myGrid, results: myResults } = bruteForceSolver(
    results,
    createdGrid,
    mainTarget
  )

  return {
    grid: myGrid,
    results: myResults,
    target: mainTarget,
  }
}
