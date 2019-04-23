import {
  getGridXLength,
  getGridYLength,
  isWithinXGrid,
  isWithinYGrid,
  pixelSize,
  getCanvasWidth,
  getCanvasHeight,
} from './gridDimensions.js'
import { OBSTACLE, TARGET, EMPTY } from './blockTypes.js'
import { generateKey } from './generateKey.js'
import { createLines } from './createLinesOnGrid.js'
import { generateNewGrid } from './generateNewGrid.js'
import { AleaRandomizer } from './AleaRandomizer.js'

const canvas = document.getElementById('myCanvas')
const canvas2 = document.getElementById('myCanvas2')
const ctx = canvas.getContext('2d')
const ctx2 = canvas2.getContext('2d')
let gridList = []

canvas.height = getCanvasHeight()
canvas.width = getCanvasWidth()

// Simple grid
// Density = 0.07471264367816093

let initialGrid = [
  // [0, 0, 3, 3, 0, 0],
  // [0, 3, 3, 3, 0, 0],
  // [3, 0, 0, 3, 0, 0],
  // [3, 3, 3, 3, 3, 0],
  // [5, 0, 0, 0, 0, 0],
]

// Crisscrossing entries
// Density = 0.09895833333333333

initialGrid = [
  // [0, 3, 0, 0, 0, 0],
  // [0, 3, 3, 0, 0, 0],
  // [3, 3, 3, 0, 0, 0],
  // [0, 3, 3, 3, 5, 0],
  // [0, 0, 3, 3, 0, 0],
  // [0, 0, 3, 3, 3, 0],
  // [0, 0, 0, 3, 3, 3],
  // [0, 0, 0, 3, 0, 0],
]

// Starting points from within grid
// Density = 0.1346153846153846

// initialGrid = [
//   [0, 0, 0, 0, 0, 3, 0, 0],
//   [0, 0, 5, 3, 3, 3, 0, 0],
//   [0, 0, 0, 3, 3, 3, 3, 3],
//   [0, 0, 0, 3, 3, 3, 3, 3],
//   [0, 0, 0, 3, 3, 0, 0, 0],
//   [0, 3, 3, 3, 3, 0, 0, 0],
//   [3, 3, 3, 3, 3, 0, 0, 0],
//   [0, 0, 0, 3, 3, 0, 0, 0],
// ]

for (let i = 0; i < getGridYLength(); i++) {
  initialGrid.push(
    Array.apply(null, Array(getGridXLength())).map(() => {
      return 0
    })
  )
}

let iterations = 0

const seed = Math.random()
console.log('seed', seed)
const randomizer = AleaRandomizer(seed)
// const distanceVisitedGraph = undefined

const shouldGenerateNew = true

const { grid, shavedGrid, distanceVisitedGraph, floodGraph } = generateNewGrid(
  initialGrid,
  randomizer
)

let otherGrid

if (shouldGenerateNew) {
  initialGrid = shavedGrid
  otherGrid = grid
}

let currentGrid = initialGrid

const arrayCopy = array => JSON.parse(JSON.stringify(array))
const isObjectEmpty = obj => Object.entries(obj).length === 0 && obj.constructor === Object

gridList.push(initialGrid)

const buttonPositions = []

function isIntersect(point, circle) {
  return (
    Math.sqrt(Math.pow(point.x - circle.x, 2) + Math.pow(point.y - circle.y, 2)) < circle.radius
  )
}

canvas.addEventListener('click', e => {
  function relMouseCoords(event) {
    let totalOffsetX = 0
    let totalOffsetY = 0
    let canvasX = 0
    let canvasY = 0
    let currentElement = canvas

    do {
      totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft
      totalOffsetY += currentElement.offsetTop - currentElement.scrollTop
      currentElement = currentElement.offsetParent
    } while (currentElement)

    canvasX = event.pageX - totalOffsetX
    canvasY = event.pageY - totalOffsetY

    return { x: canvasX, y: canvasY }
  }

  const mousePoint = relMouseCoords(e)

  buttonPositions.forEach(circle => {
    if (isIntersect(mousePoint, circle)) {
      circle.onClick()
    }
  })
})

const colorGroups = ['green', 'yellow', 'orange', 'purple', 'cyan', 'red', 'white', 'black']
const drawColors = true
let shouldDrawTarget = false
const shouldPauseOnDraw = false
const shouldPauseOnDebugDraw = true
const shouldDrawGridLines = true
const drawDistances = false

const canReachTargetWithSingleBlock = () => false
const hasResultWithoutBlock = () => false
const hasCreatedImpossibleWin = () => false

const checkIfStateIsBroken = () =>
  canReachTargetWithSingleBlock() || hasResultWithoutBlock() || hasCreatedImpossibleWin()

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

let largestSequenceToWin = 0
let partialWinGrid = {}
let partialWinResults = {}

// A partial win is a collection of blocks with hints that lead to the goal, with no blocks without hints in between
const checkGridForPartialWin = (results, currentGrid) => {
  const totalBlocksWithHintsByOrder = Object.keys(results)
    .map(key => Object.assign(results[key], { key }))
    .sort((a, b) => b.sortingOrderNumber - a.sortingOrderNumber)
    .reverse()

  let isPartialWin = true
  totalBlocksWithHintsByOrder.forEach(result => {
    if (isPartialWin === false) return
    const { x, y } = result.lineDelta

    const [resultCol, resultRow] = result.key.split(',').map(value => parseInt(value))

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
  })

  if (isPartialWin && totalBlocksWithHintsByOrder.length > largestSequenceToWin) {
    largestSequenceToWin = totalBlocksWithHintsByOrder.length
    console.log('setting a partial result', largestSequenceToWin, iterations)
    partialWinGrid = currentGrid
    partialWinResults = results
  }
}

const cleanPartialWinGrid = (currentGrid, results) => {
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

const getOtherDirection = currentDirection =>
  currentDirection === 'horizontal' ? 'vertical' : 'horizontal'

const getRemovalFunc = index => (index === 0 ? 'shift' : 'pop')

const getEndBlock = (currentLine, index) => {
  if (index === 0) {
    return currentLine[currentLine.length - 1]
  } else {
    return currentLine[0]
  }
}

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

const modifyGridWithCurrentLine = ({
  currentCase,
  removal,
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

  const convertRemovalToMovementDirection = (direction, removal) => {
    if (direction === 'horizontal') {
      if (removal === 'shift') {
        return { x: -1, y: 0 }
      } else if (removal === 'pop') {
        return { x: 1, y: 0 }
      }
    } else if (direction === 'vertical') {
      if (removal === 'shift') {
        return { x: 0, y: -1 }
      } else if (removal === 'pop') {
        return { x: 0, y: 1 }
      }
    }
    return removal
  }

  const newCurrentLine = arrayCopy(currentLine)

  while (newCurrentLine.length) {
    const currentEntry = newCurrentLine[removal]()
    if (!newCurrentLine.length) {
      if (currentGrid[target.targetRow][target.targetCol] !== TARGET) {
        currentGrid[target.targetRow][target.targetCol] = EMPTY
      }

      currentResults[currentEntry] = {
        value: blockValue,
        direction,
        lineDelta: convertRemovalToMovementDirection(direction, removal),
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

const doesPointIntersect = (gridLineInfo, currentEntry) => {
  return Object.keys(gridLineInfo).every(direction => {
    return gridLineInfo[direction].some(row => row.some(block => block === currentEntry))
  })
}

const isEndBlockEmpty = (endBlock, currentGrid) => {
  const [column, row] = endBlock.split(',').map(x => parseInt(x))
  return currentGrid[row][column] === EMPTY
}

const isEndBlockAlreadyUsed = (endBlock, results) => {
  return !!results[endBlock]
}

const getAllSubsets = arrayOfChildren =>
  arrayOfChildren.reduce((subsets, value) => subsets.concat(subsets.map(set => [value, ...set])), [
    [],
  ])

const debugDraw = (currentGrid, results, override = true) => {
  drawBricks(currentGrid, ctx, false)
  drawHints(results)
  drawGridLines()
  if (shouldPauseOnDebugDraw && override) {
     debugger // eslint-disable-line
  }
}

let drawTarget = {}

const backtrackingUnzip = (
  results,
  currentGrid,
  intersectionPoints,
  gridLineInfo,
  target,
  solutionOrderNumber
) => {
  if (iterations++ > 20000) {
    return { results, currentGrid }
  }

  const isBroken = checkIfStateIsBroken()
  if (isBroken) return {}
  let isWinner = checkGridForWin(results, currentGrid)
  if (isWinner) {
    return { results, currentGrid }
  }

  let { targetRow, targetCol } = target
  drawTarget = target
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

  const removal = getRemovalFunc(targetIndex)

  // Remove targetblock that we used to come in here
  currentLineInfo.line[removal]()

  const endBlock = getEndBlock(currentLineInfo.line, targetIndex)

  if (
    !endBlock ||
    isEndBlockEmpty(endBlock, currentGrid) ||
    isEndBlockAlreadyUsed(endBlock, results)
  ) {
    // check to see if the directions match and adjust - should never get in here
    // if (endBlockAlreadyUsed && results[endBlock].direction === currentLineInfo.direction) {}
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
    removal,
    target,
    lineIndex: currentLineInfo.index,
    solutionOrderNumber,
  })

  if (checkGridForWin(currentCase.currentResults, currentCase.currentGrid)) {
    return { results: currentCase.currentResults, currentGrid: currentCase.currentGrid }
  }

  // debugDraw(currentCase.currentGrid, currentCase.currentResults, false)

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
      solutionOrderNumber + 1
    )

    if (checkGridForWin(response.results, response.currentGrid)) {
      return response
    }

    if (!currentCase.intersectionPoints.length && listOfPossibleStates.length) {
      currentCase = listOfPossibleStates.shift()
      currentCase = modifyGridWithCurrentLine({
        currentCase,
        removal,
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

const lineGrid = createLines(initialGrid)

let targetRow = initialGrid.findIndex(row => row.some(block => block === TARGET))
let targetCol = initialGrid[targetRow].findIndex(block => block === TARGET)

const homeTarget = {
  targetRow,
  targetCol,
}

let results = {}
const initialSolutionNumber = 1
draw()

const recursiveResult = backtrackingUnzip(
  results,
  initialGrid,
  [],
  lineGrid,
  homeTarget,
  initialSolutionNumber
)

results = recursiveResult.results
currentGrid = recursiveResult.currentGrid

if (!isObjectEmpty(partialWinGrid) && !isObjectEmpty(partialWinResults)) {
  if (largestSequenceToWin > Object.keys(recursiveResult.results).length) {
    console.log('using a partial result')
    results = partialWinResults
    currentGrid = cleanPartialWinGrid(partialWinGrid, partialWinResults)
  }
}

shouldDrawTarget = false

function drawBricks(currentGrid, ctx, drawColors) {
  if (!currentGrid) return
  const drawBrick = ctx => (x, y, color) => {
    ctx.beginPath()
    ctx.rect(x, y, pixelSize, pixelSize)
    ctx.fillStyle = color
    ctx.fill()
    ctx.closePath()
  }

  const drawBrickFunc = drawBrick(ctx)
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (var row = 0; row < getGridYLength(); row++) {
    for (var column = 0; column < getGridXLength(); column++) {
      var brickX = column * pixelSize + pixelSize / 2
      var brickY = row * pixelSize + pixelSize / 2

      if (
        parseInt(drawTarget.targetRow) === row &&
        parseInt(drawTarget.targetCol) === column &&
        shouldDrawTarget
      ) {
        drawBrickFunc(brickX, brickY, 'green')
      } else if (drawColors && floodGraph[row][column].visited === true) {
        const index = floodGraph[row][column].searchGroup
        drawBrickFunc(brickX, brickY, colorGroups[index])
      } else if (currentGrid[row][column] === OBSTACLE) {
        drawBrickFunc(brickX, brickY, '#0095DD')
      } else if (currentGrid[row][column] === TARGET) {
        drawBrickFunc(brickX, brickY, 'red')
      }

      if (
        drawDistances &&
        distanceVisitedGraph &&
        distanceVisitedGraph[row][column] &&
        distanceVisitedGraph[row][column].visited === true
      ) {
        const distance = distanceVisitedGraph[row][column].distance
        ctx.beginPath()
        ctx.font = '8px Comic Sans MS'
        ctx.strokeStyle = 'black'
        ctx.strokeText(distance, column * pixelSize + (pixelSize - 3), row * pixelSize + pixelSize)
        ctx.stroke()
        ctx.closePath()
      }
    }
  }
}

function drawHints(results) {
  if (results) {
    Object.keys(results).forEach(coordinate => {
      const value = results[coordinate].value
      const [column, row] = coordinate.split(',')
      ctx.beginPath()
      ctx.font = '8px Comic Sans MS'
      ctx.strokeStyle = 'black'
      ctx.strokeText(value, column * pixelSize + (pixelSize - 3), row * pixelSize + pixelSize)
      ctx.stroke()
      ctx.closePath()
    })
  }
}

function drawGridLines() {
  for (var row = 0; row < getGridYLength(); row++) {
    for (var col = 0; col < getGridXLength(); col++) {
      if (row === 0) {
        ctx.beginPath()
        ctx.font = '8px Comic Sans MS'
        ctx.strokeStyle = 'black'
        ctx.strokeText(col, col * pixelSize + (pixelSize - 3), pixelSize / 3)
        ctx.stroke()
        ctx.closePath()
      }

      ctx.moveTo(col * pixelSize + pixelSize / 2, row * pixelSize)
      ctx.lineTo(col * pixelSize + pixelSize / 2, row * pixelSize + pixelSize)
      ctx.stroke()
    }

    ctx.beginPath()
    ctx.font = '8px Comic Sans MS'
    ctx.strokeStyle = 'black'
    ctx.strokeText(row, 0, row * pixelSize + pixelSize)
    ctx.stroke()
    ctx.moveTo(0, row * pixelSize + pixelSize / 2)
    ctx.lineTo(getGridXLength() * pixelSize, row * pixelSize + pixelSize / 2)
    ctx.stroke()
    ctx.closePath()
  }
}

function checkForWin() {}

function draw() {
  drawBricks(currentGrid, ctx, false)
  drawBricks(otherGrid, ctx2, drawColors)
  drawHints(results)
  if (shouldDrawGridLines) {
    drawGridLines()
  }
  checkForWin()
  if (shouldPauseOnDraw) {
    debugger // eslint-disable-line
  }
  requestAnimationFrame(draw)
}

draw()
