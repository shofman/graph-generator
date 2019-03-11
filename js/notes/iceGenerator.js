const AleaRandomizer = seed => {
  function Mash() {
    var n = 4022871197
    return function(r) {
      for (var t, f, s, u = 0, e = 0.02519603282416938; u < r.length; u++)
        (s = r.charCodeAt(u)),
        (f = e * (n += s) - ((n * e) | 0)),
        (n = 4294967296 * ((t = f * ((e * n) | 0)) - (t | 0)) + (t | 0))
      return (n | 0) * 2.3283064365386963e-10
    }
  }
  return (function() {
    var m = Mash(),
      a = m(' '),
      b = m(' '),
      c = m(' '),
      x = 1
    ;(seed = seed.toString()), (a -= m(seed)), (b -= m(seed)), (c -= m(seed))
    a < 0 && a++, b < 0 && b++, c < 0 && c++
    return function() {
      var y = x * 2.3283064365386963e-10 + a * 2091639
      ;(a = b), (b = c)
      return (c = y - (x = y | 0))
    }
  })()
}



const canvas = document.getElementById('myCanvas')
const ideal = document.getElementById('ideal')
const playerKeystrokes = document.getElementById('keys')
const ctx = canvas.getContext('2d')

function getRandomInt(randomizer, min, max) {
  const randomResult = randomizer()
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(randomResult * (max - min)) + min //The maximum is exclusive and the minimum is inclusive
}

function generateHardcodedIceGrid(width, height, seed) {
  const xDirections = [ 0, 1, -1, 0]
  const yDirections = [-1, 0,  0, 1]
  const directionLetters = ['U', 'R', 'L', 'D']
  const randomizer = AleaRandomizer(seed)
  let tries = 0

  while (tries++ < 10000) {
    const isValidPosition = (row, column) => {
      const isWithinGrid = (0 <= row && row < height && 0 <= column && column < width)
      const isStartingPosition = (row === startPositionY && column === startPositionX)
      const isEndingPosition = (row === endPositionY && column === endPositionX)
      if (isStartingPosition || isEndingPosition) {
        return true
      }

      if (!isWithinGrid) {
        return false
      }

      const isNotABlock = gridProbabilities[row][column] !== 0
      return isNotABlock
    }

    const calcNewPosition = (row, column, currentDirection) => {
      if (!isValidPosition(row + yDirections[currentDirection], column + xDirections[currentDirection])) {
        return {
          x: column,
          y: row,
        }
      } else {
        return calcNewPosition(row + yDirections[currentDirection], column + xDirections[currentDirection], currentDirection)
      }
    }

    const validateGrid = (winningPath, startingPosition) => {
      const winningPositions = []
      let currentPosition = {
        x: startingPosition.x,
        y: startingPosition.y,
      }
      winningPath.split('').forEach(direction => {
        const directionIndex = directionLetters.indexOf(direction)
        currentPosition = calcNewPosition(currentPosition.y, currentPosition.x, directionIndex)
        winningPositions.push(currentPosition)
      })

      // For each accessible position (e.g. is it not entirely surrounded... (astar/flood to find all possible positions))
      // I want to choose that as my starting position, and try to reach one of the winningPositions
    }

    const startPositionX = getRandomInt(randomizer, 0, width)
    const startPositionY = -1

    const endPositionX = getRandomInt(randomizer, 0, width)
    const endPositionY = height

    const gridProbabilities = []

    for (let i=0; i<height; i++) {
      gridProbabilities.push(Array.apply(null, Array(width)).map(() => getRandomInt(randomizer, 0, 7)))
    }

    const nodesToVisit = [{ x: startPositionX, y: startPositionY, visitedPath: '' }]
    let currentPosition = {}
    let visited = []

    while (nodesToVisit.length > 0 && !(currentPosition.x === endPositionX && currentPosition.y === endPositionY)) {
      currentPosition = nodesToVisit.pop()
      for (let direction=0; direction<4; direction++) {
        const newNodePosition = calcNewPosition(currentPosition.y, currentPosition.x, direction)

        if (isValidPosition(currentPosition.y + yDirections[direction], currentPosition.x + xDirections[direction]) && !visited.some(item => item.x === newNodePosition.x && item.y === newNodePosition.y)) {
          newNodePosition.visitedPath = currentPosition.visitedPath + directionLetters[direction]
          // debugger // eslint-disable-line
          nodesToVisit.unshift(newNodePosition)
          visited.push(newNodePosition)
        }
      }
    }

    if ((currentPosition.y === endPositionY && currentPosition.x === endPositionX) && currentPosition.visitedPath.length > Math.min(height, width)) {
      console.log('we found it!', currentPosition.visitedPath)
      validateGrid(currentPosition.visitedPath, { x: startPositionX, y: startPositionY })
      return {
        grid: gridProbabilities,
        visitedPath: currentPosition.visitedPath,
        startingPosition: {
          x: startPositionX,
          y: startPositionY,
        },
        endingPosition: {
          x: endPositionX,
          y: endPositionY,
        },
        height,
        width,
        seed,
      }
    }
  } 
}

const pixelSize = 20
const gridY = canvas.height - pixelSize
const gridX = canvas.width - pixelSize


const obstacle = 3
const playerIndicator = 1
const emptySpace = 0
const goal = 4

const gridYLength = (gridY / pixelSize) - 1
const gridXLength = (gridX / pixelSize) - 1

let playerXPos
let playerYPos

let startingXPos
let startingYPos

let endingXPos
let endingYPos

const createGrid = () => {
  const initialGrid = []
  const seed = Math.random()

  // const brokenSeed = 0.3955406636481307
  console.log('seed', seed)
  const result = generateHardcodedIceGrid(gridXLength, gridYLength, seed)

  startingXPos = result.startingPosition.x + 1
  startingYPos = 0
  endingXPos = result.endingPosition.x + 1
  endingYPos = gridYLength + 1

  ideal.innerHTML = result.visitedPath.length

  for (let i=-1; i<gridYLength+1; i++) {
    initialGrid.push(Array.apply(null, Array(gridXLength+2)).map((_, index) => {
      if (i===-1 || i === gridYLength || index === 0 || index === gridXLength + 1) { 
        return obstacle 
      }
      return emptySpace
    }))
  }

  result.grid.forEach(
    (row, rowIndex) => row.forEach(
      (item, columnIndex) => { 
        if (item === 0) {
          initialGrid[rowIndex+1][columnIndex+1] = obstacle
        }
      }
    )
  )

  initialGrid[startingYPos][startingXPos] = playerIndicator
  initialGrid[endingYPos][endingXPos] = goal

  playerXPos = startingXPos
  playerYPos = startingYPos

  return initialGrid
}

let grid = createGrid()

document.addEventListener('keydown', keyDownHandler, false)

function canMoveRight(playerYPosition, playerXPosition, movementDistance, grid) {
  const newPosition = playerXPosition + movementDistance
  return newPosition < grid[0].length && grid[playerYPosition][newPosition] !== obstacle
}

function canMoveLeft(playerYPosition, playerXPosition, movementDistance) {
  const newPosition = playerXPosition - movementDistance
  return newPosition >= 0 && grid[playerYPosition][newPosition] !== obstacle
}

function canMoveUp(playerYPosition, playerXPosition, movementDistance) {
  const newPosition = playerYPosition - movementDistance
  return newPosition >= 0 && grid[newPosition][playerXPosition] !== obstacle
}

function canMoveDown(playerYPosition, playerXPosition, movementDistance, grid) {
  const newPosition = playerYPosition + movementDistance
  return newPosition < grid.length && grid[newPosition][playerXPosition] !== obstacle
}

function keyDownHandler(e) {
  let playerMovementDistance = 1
  let hasMoved = false
  let currentXPos = playerXPos
  let currentYPos = playerYPos

  if(e.keyCode == 39 && canMoveRight(playerYPos, playerXPos, playerMovementDistance, grid)) {
    hasMoved = true
    while (canMoveRight(playerYPos, playerXPos, playerMovementDistance, grid)) {
      playerXPos += playerMovementDistance
    }
  }
  if(e.keyCode === 38 && canMoveUp(playerYPos, playerXPos, playerMovementDistance)) {
    hasMoved = true
    while (canMoveUp(playerYPos, playerXPos, playerMovementDistance)) {
      playerYPos -= playerMovementDistance
    }
    
  }
  if(e.keyCode == 37 && canMoveLeft(playerYPos, playerXPos, playerMovementDistance)) {
    hasMoved = true
    while(canMoveLeft(playerYPos, playerXPos, playerMovementDistance)) {
      playerXPos -= playerMovementDistance
    }
  }
  if (e.keyCode === 40 && canMoveDown(playerYPos, playerXPos, playerMovementDistance, grid)) {
    hasMoved = true
    while(canMoveDown(playerYPos, playerXPos, playerMovementDistance, grid)) {
      playerYPos += playerMovementDistance
    }
  }

  if (e.keyCode === 32) {
    playerXPos = startingXPos
    playerYPos = 0
    playerKeystrokes.innerHTML = 0
  }

  if (e.keyCode === 82) {
    grid = createGrid()
    playerKeystrokes.innerHTML = 0
  }

  if (hasMoved) {
    grid[currentYPos][currentXPos] = emptySpace
    grid[playerYPos][playerXPos] = playerIndicator
    playerKeystrokes.innerHTML = Number(playerKeystrokes.innerHTML) + 1
  }
}

function drawCharacter() {
  ctx.beginPath()
  ctx.arc((playerXPos * pixelSize) + (pixelSize/2), (playerYPos * pixelSize) + (pixelSize/2), pixelSize / 2, 0, Math.PI*2)
  ctx.fillStyle = 'black'
  ctx.fill()
  ctx.closePath()
}

function drawGrid() {
  for(var c=0; c<gridYLength+2; c++) {
    for(var r=0; r<gridXLength+2; r++) {
      if(grid[c][r] === obstacle) {
        var brickX = (r*(pixelSize))
        var brickY = (c*(pixelSize))
        ctx.beginPath()
        ctx.rect(brickX, brickY, pixelSize, pixelSize)
        ctx.fillStyle = '#0095DD'
        ctx.fill()
        ctx.closePath()
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawCharacter()
  drawGrid()

  requestAnimationFrame(draw)

  if (playerXPos === endingXPos && playerYPos === endingYPos) {
    ctx.font = "80px Comic Sans MS"
    ctx.fillStyle = "red"
    ctx.textAlign = "center"
    ctx.fillText("You win!", canvas.width/2, canvas.height/2)
  }
}

draw()