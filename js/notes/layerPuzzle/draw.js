import {
  getGridXLength,
  getGridYLength,
  pixelSize,
  pixelOffset,
  getCanvasWidth,
  getCanvasHeight,
} from './gridDimensions.js'
import { blockPositions } from './play.js'
import { OBSTACLE, TARGET, SUCCESS_TARGET } from './blockTypes.js'

const colorGroups = ['green', 'yellow', 'orange', 'purple', 'cyan', 'red', 'white', 'black']
const drawColors = true
let shouldDrawTarget = false
const shouldPauseOnDraw = false
const shouldPauseOnDebugDraw = true
const shouldDrawGridLines = true
const drawDistances = false

const canvas = document.getElementById('myCanvas')
const canvas2 = document.getElementById('myCanvas2')
const ctx = canvas.getContext('2d')
const ctx2 = canvas2.getContext('2d')

function drawText(text, column, row) {
  ctx.beginPath()
  ctx.font = '8px Comic Sans MS'
  ctx.strokeStyle = 'black'
  ctx.strokeText(text, column, row)
  ctx.stroke()
  ctx.closePath()
}

let drawTarget = {}
let distanceVisitedGraph = undefined

function drawBricks(currentGrid, ctx, drawColors, floodGraph = undefined) {
  if (!currentGrid) return
  const drawBrick = ctx => (x, y, color) => {
    ctx.beginPath()
    ctx.rect(x, y, pixelSize, pixelSize)
    ctx.fillStyle = color
    ctx.fill()
    ctx.closePath()
  }

  const drawBrickFunc = drawBrick(ctx)
  ctx.clearRect(0, 0, getCanvasWidth(), getCanvasHeight())

  let block

  for (var row = 0; row < getGridYLength(); row++) {
    for (var column = 0; column < getGridXLength(); column++) {
      var brickX = column * pixelSize + pixelOffset
      var brickY = row * pixelSize + pixelOffset

      if ((block = blockPositions.find(item => item.x === column && item.y === row))) {
        drawBrickFunc(brickX, brickY, block.color)
      }

      if (
        parseInt(drawTarget.targetRow) === row &&
        parseInt(drawTarget.targetCol) === column &&
        shouldDrawTarget
      ) {
        drawBrickFunc(brickX, brickY, 'green')
      } else if (drawColors && floodGraph && floodGraph[row][column].visited === true) {
        const index = floodGraph[row][column].searchGroup
        drawBrickFunc(brickX, brickY, colorGroups[index])
      } else if (currentGrid[row][column] === TARGET) {
        drawBrickFunc(brickX, brickY, 'red')
      } else if (currentGrid[row][column] === SUCCESS_TARGET) {
        drawBrickFunc(brickX, brickY, 'yellow')
      } else if (currentGrid[row][column] === OBSTACLE) {
        drawBrickFunc(brickX, brickY, '#0090FF')
      }

      if (
        drawDistances &&
        distanceVisitedGraph &&
        distanceVisitedGraph[row][column] &&
        distanceVisitedGraph[row][column].visited === true
      ) {
        const distance = distanceVisitedGraph[row][column].distance
        drawText(distance, column * pixelSize + (pixelSize - 3), row * pixelSize + pixelSize)
      }
    }
  }
}

function drawLine(startX, startY, endX, endY) {
  ctx.beginPath()
  ctx.moveTo(startX, startY)
  ctx.lineTo(endX, endY)
  ctx.stroke()
  ctx.closePath()
}

function drawHints(results) {
  if (results) {
    Object.keys(results).forEach(coordinate => {
      const value = results[coordinate].value
      if (value > 0) {
        const [column, row] = coordinate.split(',')
        drawText(value, column * pixelSize + (pixelSize - 3), row * pixelSize + pixelSize)
      }
    })
  }
}

function drawBlockLines() {
  blockPositions &&
    blockPositions.forEach(block => {
      if (block.hasClicked) {
        const middleOfBlockX = block.x * pixelSize + pixelSize
        const middleOfBlockY = block.y * pixelSize + pixelSize

        const spaceFromMiddle = pixelSize / 3

        // Right
        drawLine(
          middleOfBlockX + spaceFromMiddle,
          middleOfBlockY,
          middleOfBlockX + pixelSize,
          middleOfBlockY
        )

        // Left
        drawLine(
          middleOfBlockX - spaceFromMiddle,
          middleOfBlockY,
          middleOfBlockX - pixelSize,
          middleOfBlockY
        )

        // Up
        drawLine(
          middleOfBlockX,
          middleOfBlockY - spaceFromMiddle,
          middleOfBlockX,
          middleOfBlockY - pixelSize
        )

        // Down
        drawLine(
          middleOfBlockX,
          middleOfBlockY + spaceFromMiddle,
          middleOfBlockX,
          middleOfBlockY + pixelSize
        )
      }
    })
}

function checkForWin(currentGrid) {
  console.log('we are here', currentGrid.some(row => row.some(block => block === SUCCESS_TARGET)))
  if (currentGrid.some(row => row.some(block => block === SUCCESS_TARGET))) {
    drawText('You win!', getGridYLength() + 1, 0)
  }
}

function drawGridLines() {
  for (var row = 0; row < getGridYLength(); row++) {
    for (var col = 0; col < getGridXLength(); col++) {
      if (row === 0) {
        drawText(col, col * pixelSize + (pixelSize - 3), pixelSize / 3)
      }
      const colPos = col * pixelSize + pixelOffset
      drawLine(colPos, row * pixelSize, colPos, row * pixelSize + pixelSize)
    }

    drawText(row, 0, row * pixelSize + pixelSize)
    const rowPos = row * pixelSize + pixelOffset
    drawLine(0, rowPos, getGridXLength() * pixelSize, rowPos)
  }
}

export const drawCreationDetails = (otherGrid, floodGraph) => () => {
  drawBricks(otherGrid, ctx2, drawColors, floodGraph)
}

export const draw = (currentGrid, results) => () => {
  drawBricks(currentGrid, ctx, false)
  drawHints(results)
  if (shouldDrawGridLines) {
    drawGridLines()
  }
  drawBlockLines()
  checkForWin(currentGrid)
  if (shouldPauseOnDraw) {
    debugger // eslint-disable-line
  }
  requestAnimationFrame(draw(currentGrid, results))
}

export const debugDraw = (results, currentGrid, override = true) => {
  drawBricks(currentGrid, ctx, false)
  drawHints(results)
  drawGridLines()
  if (shouldPauseOnDebugDraw && override) {
     debugger // eslint-disable-line
  }
}
