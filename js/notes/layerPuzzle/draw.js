import {
  getGridXLength,
  getGridYLength,
  pixelSize,
  getCanvasWidth,
  getCanvasHeight,
} from './gridDimensions.js'
import { OBSTACLE, TARGET } from './blockTypes.js'

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
      } else if (drawColors && floodGraph && floodGraph[row][column].visited === true) {
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
      const [column, row] = coordinate.split(',')
      drawText(value, column * pixelSize + (pixelSize - 3), row * pixelSize + pixelSize)
    })
  }
}

function drawGridLines() {
  for (var row = 0; row < getGridYLength(); row++) {
    for (var col = 0; col < getGridXLength(); col++) {
      if (row === 0) {
        drawText(col, col * pixelSize + (pixelSize - 3), pixelSize / 3)
      }
      const colPos = col * pixelSize + pixelSize / 2
      drawLine(colPos, row * pixelSize, colPos, row * pixelSize + pixelSize)
    }

    drawText(row, 0, row * pixelSize + pixelSize)
    const rowPos = row * pixelSize + pixelSize / 2
    drawLine(0, rowPos, getGridXLength() * pixelSize, rowPos)
  }
}

export const draw = (currentGrid, otherGrid, results, distanceVisitedGraph, floodGraph) => () => {
  drawBricks(currentGrid, ctx, false)
  drawBricks(otherGrid, ctx2, drawColors, floodGraph)
  drawHints(results)
  if (shouldDrawGridLines) {
    drawGridLines()
  }
  if (shouldPauseOnDraw) {
    debugger // eslint-disable-line
  }
  requestAnimationFrame(draw(currentGrid, otherGrid, results))
}

export const debugDraw = (results, currentGrid, override = true) => {
  drawBricks(currentGrid, ctx, false)
  drawHints(results)
  drawGridLines()
  if (shouldPauseOnDebugDraw && override) {
     debugger // eslint-disable-line
  }
}
