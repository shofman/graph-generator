import {
  getGridXLength,
  getGridYLength,
  pixelSize,
  pixelOffset,
  getCanvasWidth,
  getCanvasHeight,
} from './gridDimensions.js'
import {
  SPACE,
  PUSH_BLOCK,
  WALL,
  SUCCESS_TARGET,
  PASSTHROUGH_SPACE,
  PLAYER,
} from './blockTypes.js'

const colorGroups = ['green', 'yellow', 'orange', 'purple', 'cyan', 'red', 'white', 'black']
const drawColors = true
let shouldDrawTarget = false
const shouldPauseOnDraw = false
const shouldPauseOnDebugDraw = true
const shouldDrawGridLines = true
const drawDistances = false

const canvas = document.getElementById('myCanvas')
let ctx = canvas.getContext('2d')

function drawText(text, column, row, size = 8) {
  ctx.beginPath()
  ctx.font = `${size}px Comic Sans MS`
  ctx.fillStyle = 'black'
  ctx.fillText(text, column, row)
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
      var brickX = column * pixelSize + pixelOffset
      var brickY = row * pixelSize + pixelOffset

      if (
        parseInt(drawTarget.targetRow) === row &&
        parseInt(drawTarget.targetCol) === column &&
        shouldDrawTarget
      ) {
        drawBrickFunc(brickX, brickY, 'green')
      } else if (drawColors && floodGraph && floodGraph[row][column].visited === true) {
        const index = floodGraph[row][column].searchGroup
        drawBrickFunc(brickX, brickY, colorGroups[index])
      } else if (
        currentGrid[row][column] === SPACE ||
        currentGrid[row][column] === PASSTHROUGH_SPACE
      ) {
        drawBrickFunc(brickX, brickY, 'red')
      } else if (currentGrid[row][column] === SUCCESS_TARGET) {
        drawBrickFunc(brickX, brickY, 'yellow')
      } else if (currentGrid[row][column] === WALL) {
        drawBrickFunc(brickX, brickY, '#0090FF')
      } else if (currentGrid[row][column] === PUSH_BLOCK) {
        drawBrickFunc(brickX, brickY, 'blue')
      } else if (currentGrid[row][column] === PLAYER) {
        drawBrickFunc(brickX, brickY, 'black')
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
  if (hasWon) {
    drawText('You win!', getGridYLength() + 1, 100, 100)
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

const canMoveDown = (playerYPos, playerXPos, playerMovementDistance, grid) => {
  const maxGridHeight = getGridYLength(false) * 3 - 1
  const nextBlockDown = grid[playerYPos + 1][playerXPos]

  if (nextBlockDown === PUSH_BLOCK) {
    if (playerYPos + 2 > maxGridHeight) return false
    const blockAfterNextBlockDown = grid[playerYPos + 2][playerXPos]
    if (blockAfterNextBlockDown === WALL) return false
  }

  return playerYPos < maxGridHeight && nextBlockDown !== WALL
}
const canMoveUp = (playerYPos, playerXPos, playerMovementDistance, grid) => {
  const nextBlockUp = grid[playerYPos - 1][playerXPos]
  if (nextBlockUp === PUSH_BLOCK) {
    if (playerYPos - 2 < 0) return false
    const blockAfterNextBlock = grid[playerYPos - 2][playerXPos]
    if (blockAfterNextBlock === WALL) return false
  }

  return playerYPos > 0 && nextBlockUp !== WALL
}
const canMoveLeft = (playerYPos, playerXPos, playerMovementDistance, grid) => {
  const nextBlockLeft = grid[playerYPos][playerXPos - 1]
  if (nextBlockLeft === PUSH_BLOCK) {
    if (playerXPos - 2 < 0) return false
    const blockAfterNextBlock = grid[playerYPos][playerXPos - 2]
    if (blockAfterNextBlock === WALL) return false
  }

  return playerXPos > 0 && nextBlockLeft !== WALL
}
const canMoveRight = (playerYPos, playerXPos, playerMovementDistance, grid) => {
  const maxGridWidth = getGridXLength(false) * 3 - 1
  const nextBlockLeft = grid[playerYPos][playerXPos + 1]

  if (nextBlockLeft === PUSH_BLOCK) {
    if (playerXPos + 2 < 0) return false
    const blockAfterNextBlock = grid[playerYPos][playerXPos + 2]
    if (blockAfterNextBlock === WALL) return false
  }

  return playerXPos < maxGridWidth && nextBlockLeft !== WALL
}

function keyDownHandler(e) {
  let playerMovementDistance = 1
  let hasMoved = false
  let currentXPos = playerXPos
  let currentYPos = playerYPos

  if (e.keyCode == 39 && canMoveRight(playerYPos, playerXPos, playerMovementDistance, globalGrid)) {
    hasMoved = true
    // while (canMoveRight(playerYPos, playerXPos, playerMovementDistance, grid)) {
    playerXPos += playerMovementDistance
    // }
  }
  if (e.keyCode === 38 && canMoveUp(playerYPos, playerXPos, playerMovementDistance, globalGrid)) {
    hasMoved = true
    // while (canMoveUp(playerYPos, playerXPos, playerMovementDistance)) {
    playerYPos -= playerMovementDistance
    // }
  }
  if (e.keyCode == 37 && canMoveLeft(playerYPos, playerXPos, playerMovementDistance, globalGrid)) {
    hasMoved = true
    // while(canMoveLeft(playerYPos, playerXPos, playerMovementDistance)) {
    playerXPos -= playerMovementDistance
    // }
  }
  if (e.keyCode === 40 && canMoveDown(playerYPos, playerXPos, playerMovementDistance, globalGrid)) {
    hasMoved = true
    // while(canMoveDown(playerYPos, playerXPos, playerMovementDistance, grid)) {
    playerYPos += playerMovementDistance
    // }
  }

  if (e.keyCode === 32) {
    shouldReset = true
    hasWon = false
  }

  if (hasMoved && !hasWon) {
    globalGrid[currentYPos][currentXPos] = SPACE
    globalGrid[globalTargetY][globalTargetX] = SUCCESS_TARGET
    if (globalGrid[playerYPos][playerXPos] === PUSH_BLOCK) {
      // If we are going to move into a pushblock, move it in the direction too
      const nextPushBlockY = playerYPos + (playerYPos - currentYPos)
      const nextPushBlockX = playerXPos + (playerXPos - currentXPos)
      globalGrid[nextPushBlockY][nextPushBlockX] = PUSH_BLOCK

      if (nextPushBlockY === globalTargetY && nextPushBlockX === globalTargetX) {
        console.log('we have won')
        hasWon = true
      }
    }
    globalGrid[playerYPos][playerXPos] = PLAYER
  }
}

document.addEventListener('keydown', keyDownHandler, false)
let globalGrid
let playerXPos
let playerYPos
let unmodifiedGrid
let shouldReset = false
let globalTargetX
let globalTargetY
let hasWon = false

export const draw = (canvasId, currentGrid, results) => () => {
  const canvas = document.getElementById(canvasId)
  if (canvasId === 'myCanvas') {
    if (!unmodifiedGrid) {
      unmodifiedGrid = JSON.stringify(currentGrid)
    }
    globalGrid = currentGrid
    if (shouldReset) {
      shouldReset = false
      globalGrid = JSON.parse(unmodifiedGrid)
    }
    globalGrid.forEach((row, rowIndex) => {
      if (row.includes(PLAYER)) {
        playerXPos = row.indexOf(PLAYER)
        playerYPos = rowIndex
      }
      if (row.includes(SUCCESS_TARGET)) {
        globalTargetX = row.indexOf(SUCCESS_TARGET)
        globalTargetY = rowIndex
      }
    })
    ctx = canvas.getContext('2d')
    drawBricks(globalGrid, ctx, false)
    drawHints(results)
    if (shouldDrawGridLines) {
      drawGridLines()
    }
    // drawBlockLines()
    checkForWin(globalGrid)
    if (shouldPauseOnDraw) {
      debugger // eslint-disable-line
    }
    requestAnimationFrame(draw(canvasId, globalGrid, results))
  } else {
    ctx = canvas.getContext('2d')
    drawBricks(currentGrid, ctx, false)
    drawHints(results)
    if (shouldDrawGridLines) {
      drawGridLines()
    }
    if (shouldPauseOnDraw) {
      debugger // eslint-disable-line
    }
    requestAnimationFrame(draw(canvasId, currentGrid, results))
  }

  
}

export const debugDraw = (results, currentGrid, override = true) => {
  drawBricks(currentGrid, ctx, false)
  drawHints(results)
  drawGridLines()
  if (shouldPauseOnDebugDraw && override) {
    debugger // eslint-disable-line
  }
}
