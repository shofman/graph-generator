import { createHardcodedPuzzles } from './hardcodedDungeons/createHardcodedDungeons.js'
import { drawTree, rewind, advance } from './ui/drawGraph.js'
import { AleaRandomizer } from '../utils/AleaRandomizer.js'
import { generateSeedName } from './utils/seedName.js'

const result = createHardcodedPuzzles(2)
console.log('result', result)

window.rewind = rewind
window.advance = advance

drawTree(result)

const canvas = document.getElementById('laser-puzzle')
const ctx = canvas.getContext('2d')

const canvasWidth = 1000
const canvasHeight = 800

const blockSize = 5
canvas.width = canvasWidth
canvas.height = canvasHeight
canvas.style.border = '1px dashed green'

const getRandomInt = (randomizer, min, max) => {
  const randomResult = randomizer()
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(randomResult * (max - min)) + min //The maximum is exclusive and the minimum is inclusive
}

const getRandomFloat = (randomizer, min, max) => {
  const randomResult = randomizer()
  return min + randomResult * (max - min)
}

// Does line segment AB -> CD intersect with PQ -> RS
const intersects = (a, b, c, d, p, q, r, s) => {
  var det, gamma, lambda
  det = (c - a) * (s - q) - (r - p) * (d - b)
  if (det === 0) {
    return false
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det
    return 0 < lambda && lambda < 1 && (0 < gamma && gamma < 1)
  }
}

const doesLineIntersectRectangle = (rectangle, pointA, pointB) => {
  const pairs = [
    [rectangle[0], rectangle[1]],
    [rectangle[0], rectangle[2]],
    [rectangle[1], rectangle[3]],
    [rectangle[2], rectangle[3]],
  ]

  return pairs.some(pair =>
    intersects(
      pair[0][0],
      pair[0][1],
      pair[1][0],
      pair[1][1],
      pointA[0],
      pointA[1],
      pointB[0],
      pointB[1]
    )
  )
}

const drawRect = (x, y, color = 'green', xSize = 10, ySize = 10) => {
  ctx.beginPath()
  ctx.fillStyle = color
  ctx.fillRect(x, y, xSize, ySize)
  ctx.strokeStyle = 'black'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, xSize, ySize)
  ctx.closePath()

  return [x, y]
}

const drawSquare = (x, y, color = 'green', size = 10) => {
  return drawRect(x, y, color, size, size)
}

const drawBlock = (block, color = 'black') => {
  const [cx, cy] = block.center
  const [sizeX, sizeY] = block.dimensions

  block.endpoints.forEach(endpoint => {
    drawPoint(endpoint[0], endpoint[1], color, 1)
    drawPoint(endpoint[0], endpoint[1], color, 1)
    drawPoint(endpoint[0], endpoint[1], color, 1)
    drawPoint(endpoint[0], endpoint[1], color, 1)
  })

  return drawRect(cx, cy, color, sizeX, sizeY)
}

const drawPoint = (x, y, color = 'green', size = 5) => {
  ctx.beginPath()
  ctx.arc(x, y, size, 0, 2 * Math.PI, false)
  ctx.fillStyle = color
  ctx.fill()
  ctx.lineWidth = 1
  ctx.strokeStyle = 'black'
  ctx.stroke()

  return [x, y]
}

const drawStart = (startPoint, color = 'green', size = 5) => {
  return drawPoint(startPoint[0], startPoint[1], color, size)
}

const calcDistance = (pointOne, pointTwo) => {
  const a = pointOne[0] - pointTwo[0]
  const b = pointOne[1] - pointTwo[1]
  return Math.sqrt(a * a + b * b)
}

const drawStar = (cx, cy, color = 'green', outerRadius = 2, innerRadius = 1) => {
  const spikes = 5
  var rot = (Math.PI / 2) * 3
  var x = cx
  var y = cy
  var step = Math.PI / spikes

  ctx.beginPath()
  ctx.moveTo(cx, cy - outerRadius)
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius
    y = cy + Math.sin(rot) * outerRadius
    ctx.lineTo(x, y)
    rot += step

    x = cx + Math.cos(rot) * innerRadius
    y = cy + Math.sin(rot) * innerRadius
    ctx.lineTo(x, y)
    rot += step
  }
  ctx.lineTo(cx, cy - outerRadius)
  ctx.closePath()
  ctx.lineWidth = 5
  ctx.strokeStyle = 'black'
  ctx.stroke()
  ctx.fillStyle = color
  ctx.fill()
  ctx.lineWIdth = 1

  return [cx, cy]
}

const drawEnd = (cx, cy, color = 'green', outerRadius = 2, innerRadius = 1) => {
  return drawStar(cx, cy, color, outerRadius, innerRadius)
}

const drawConnectorLines = (start, connectors, end, color) => {
  ctx.fillStyle = color
  ctx.beginPath()

  ctx.moveTo(start[0], start[1])

  connectors.forEach(connector => {
    ctx.lineTo(connector[0] + 5, connector[1] + 5)
  })

  ctx.lineTo(end[0] + 2, end[1])
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.closePath()
}

const getRandomConnector = (randomizer, startPoint, endPoint, blocks, otherPoints = []) => {
  let firstDistance = 0
  let secondDistance = 0
  let isValidConnector = false
  let connectorX, connectorY

  let tries = 0
  const minDistance = 100

  while (!isValidConnector && tries++ < 1000) {
    connectorX = getRandomInt(randomizer, 10, canvasWidth - 10)
    connectorY = getRandomInt(randomizer, 10, canvasHeight - 10)

    const connectPoint = [connectorX, connectorY]

    firstDistance = calcDistance(startPoint, connectPoint)
    secondDistance = calcDistance(connectPoint, endPoint)

    if (firstDistance > minDistance && secondDistance > minDistance) {
      // Check that the block does not interfere with the intersection points
      const noBlocksInterfereWithLine = blocks.every(({ endpoints }) => {
        const isBlockedToStart = doesLineIntersectRectangle(endpoints, startPoint, connectPoint)
        const isBlockedToEnd = doesLineIntersectRectangle(endpoints, endPoint, connectPoint)
        return !isBlockedToStart && !isBlockedToEnd
      })

      const noCrossingLines = otherPoints.every(point => {
        const pointA = point[0]
        const pointB = point[1]
        const isCrossingWithStart = intersects(
          pointA[0],
          pointA[1],
          pointB[0],
          pointB[1],
          startPoint[0],
          startPoint[1],
          connectPoint[0],
          connectPoint[1]
        )

        const isCrossingWithEnd = intersects(
          pointA[0],
          pointA[1],
          pointB[0],
          pointB[1],
          endPoint[0],
          endPoint[1],
          connectPoint[0],
          connectPoint[1]
        )
        return !isCrossingWithStart && !isCrossingWithEnd
      })
      isValidConnector = noBlocksInterfereWithLine && noCrossingLines
    }
  }

  if (!isValidConnector) throw new Error('could not create a valid connector')
  return [connectorX, connectorY]
}

const pickBlockLocation = (randomizer, originPoint, endPoint) => {
  // Pick a random point on the line between start and end, and introduce a barrier
  const [xOrigin, yOrigin] = originPoint
  const [xEnd, yEnd] = endPoint

  const randomWeight = getRandomFloat(randomizer, 0.15, 0.85)
  const x = xOrigin * randomWeight + xEnd * (1 - randomWeight)

  const y = (yOrigin * (xEnd - x) + yEnd * (x - xOrigin)) / (xEnd - xOrigin)

  const xDistance = xEnd - xOrigin
  const yDistance = yEnd - yOrigin

  const dimensions = Math.abs(xDistance) > Math.abs(yDistance) ? [10, 30] : [30, 10]

  const center = [x - dimensions[0] / 2, y - dimensions[1] / 2]

  const safetyMargin = 10

  return {
    coordinates: [x, y],
    dimensions,
    center,
    endpoints: [
      [center[0] - safetyMargin, center[1] - safetyMargin],
      [center[0] - safetyMargin, center[1] + dimensions[1] + safetyMargin],
      [center[0] + dimensions[0] + safetyMargin, center[1] - safetyMargin],
      [center[0] + dimensions[0] + safetyMargin, center[1] + dimensions[1] + safetyMargin],
    ],
  }
}

const blockColors = ['teal', 'red', 'blue', 'orange', 'grey', 'black']

let seed = generateSeedName()
// Ensure that we don't cross over the lines
// Ensure that we don't have previous blocks interfere with the lines either
console.log('seed', seed)
// seed = 1646690511957.3684
// seed = 1646760090947.4634
// seed = 1646764332742.689
const randomizer = AleaRandomizer(seed)

let creationAttempts = 0
let hasCreatedGreenPath = false

const createGreenPath = () => {
  try {
    const randomStartX = getRandomInt(randomizer, 10, canvasWidth - 10)
    const randomStartY = getRandomInt(randomizer, 10, canvasHeight - 10)

    let randomEndX = getRandomInt(randomizer, 10, canvasWidth - 10)
    let randomEndY = getRandomInt(randomizer, 10, canvasHeight - 10)
    let distance = calcDistance([randomStartX, randomStartY], [randomEndX, randomEndY])

    while (distance < 100) {
      randomEndX = getRandomInt(randomizer, 10, canvasWidth - 10)
      randomEndY = getRandomInt(randomizer, 10, canvasHeight - 10)
      distance = calcDistance([randomStartX, randomStartY], [randomEndX, randomEndY])
    }

    const startPoint = [randomStartX, randomStartY]
    const endPoint = [randomEndX, randomEndY]

    // Draw the static points
    const greenStart = drawStart(startPoint)
    const greenEnd = drawEnd(randomEndX, randomEndY)

    const firstBlock = pickBlockLocation(randomizer, startPoint, endPoint)
    drawBlock(firstBlock, blockColors[0])

    // Check that we are properly blocking the entry
    const check = doesLineIntersectRectangle(firstBlock.endpoints, startPoint, endPoint)
    if (!check) throw new Error('does not block')

    // Add a connector to get around the block
    const firstConnect = getRandomConnector(randomizer, startPoint, endPoint, [firstBlock])
    const firstConnector = drawSquare(firstConnect[0], firstConnect[1], 'blue', blockSize)

    const secondBlock = pickBlockLocation(randomizer, firstConnect, endPoint)
    drawBlock(secondBlock, blockColors[1])

    // Check that we are properly blocking the entry
    const secondCheck = doesLineIntersectRectangle(secondBlock.endpoints, firstConnect, endPoint)
    if (!secondCheck) throw new Error('second block does not block')

    const thirdBlock = pickBlockLocation(randomizer, firstConnect, startPoint)
    drawBlock(thirdBlock, blockColors[2])

    const thirdCheck = doesLineIntersectRectangle(thirdBlock.endpoints, firstConnect, startPoint)
    if (!thirdCheck) throw new Error('third block does not block')

    const listOfBlocks = [firstBlock, secondBlock, thirdBlock]

    const secondConnect = getRandomConnector(
      randomizer,
      endPoint,
      firstConnect,
      listOfBlocks,
      [],
      true
    )
    const secondConnector = drawSquare(secondConnect[0], secondConnect[1], 'orange', blockSize)

    let otherPoints = [[secondConnect, endPoint], [secondConnect, firstConnect]]
    const thirdConnect = getRandomConnector(
      randomizer,
      firstConnect,
      startPoint,
      listOfBlocks,
      otherPoints
    )
    const thirdConnector = drawSquare(thirdConnect[0], thirdConnect[1], 'purple', blockSize)

    let fourthBlock
    let hasPlacedFourthBlock = false
    let blockPlacementTries = 0

    const solutionPath = [
      [startPoint, thirdConnect],
      [thirdConnect, firstConnect],
      [firstConnect, secondConnect],
      [secondConnect, endPoint],
    ]

    const checkBlockIntersection = block => {
      const points = block.endpoints

      return solutionPath.every(segment => {
        return !doesLineIntersectRectangle(points, segment[0], segment[1])
      })
    }

    while (blockPlacementTries++ < 100 && !hasPlacedFourthBlock) {
      fourthBlock = pickBlockLocation(randomizer, thirdConnect, endPoint)
      hasPlacedFourthBlock = checkBlockIntersection(fourthBlock)
    }
    if (!hasPlacedFourthBlock) throw new Error('could not position fourth block')
    drawBlock(fourthBlock, blockColors[3])

    blockPlacementTries = 0
    let fifthBlock
    let hasPlacedFifthBlock = false

    while (blockPlacementTries++ < 100 && !hasPlacedFifthBlock) {
      fifthBlock = pickBlockLocation(randomizer, secondConnect, thirdConnect)
      hasPlacedFifthBlock = checkBlockIntersection(fifthBlock)
    }
    if (!hasPlacedFifthBlock) throw new Error('could not position fifth block')
    drawBlock(fifthBlock, blockColors[4])

    blockPlacementTries = 0
    let sixthBlock
    let hasPlacedSixthBlock = false

    while (blockPlacementTries++ < 100 && !hasPlacedSixthBlock) {
      sixthBlock = pickBlockLocation(randomizer, secondConnect, startPoint)
      hasPlacedSixthBlock = checkBlockIntersection(sixthBlock)
    }
    if (!hasPlacedSixthBlock) throw new Error('could not position sixth block')
    drawBlock(sixthBlock, blockColors[5])

    const greenConnector = [thirdConnector, firstConnector, secondConnector]
    drawConnectorLines(greenStart, greenConnector, greenEnd, 'green')

    return {
      hasSucceeded: true,
      start: greenStart,
      path: greenConnector,
      end: greenEnd,
      solutionPath,
      connectors: [thirdConnect, firstConnect, secondConnect],
      blocks: [firstBlock, secondBlock, thirdBlock, fourthBlock, fifthBlock, sixthBlock],
    }
  } catch (e) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    return {
      hasSucceeded: false,
    }
  }
}

const createYellowPath = firstCreation => {
  try {
    const randomStartX = getRandomInt(randomizer, 10, canvasWidth - 10)
    const randomStartY = getRandomInt(randomizer, 10, canvasHeight - 10)

    let randomEndX
    let randomEndY
    let exitPlacement = 0
    let isFarEnough = false

    while (!isFarEnough && exitPlacement++ < 1000) {
      randomEndX = getRandomInt(randomizer, 10, canvasWidth - 10)
      randomEndY = getRandomInt(randomizer, 10, canvasHeight - 10)

      let distance = calcDistance([randomStartX, randomStartY], [randomEndX, randomEndY])
      if (distance > 100) {
        isFarEnough = true
      }
    }

    const startPoint = [randomStartX, randomStartY]
    const endPoint = [randomEndX, randomEndY]

    // If we are intersecting the other puzzle (blocks or lines), consider it already blocked
    // If not, we add an interfering block
    const doesNotIntersectOtherBlocks = firstCreation.blocks.every(({ endpoints }) => {
      return !doesLineIntersectRectangle(endpoints, startPoint, endPoint)
    })

    const doesNotIntersectSolution = firstCreation.solutionPath.every(lineSegment => {
      return !intersects(
        randomStartX,
        randomStartY,
        randomEndX,
        randomEndY,
        lineSegment[0][0],
        lineSegment[0][1],
        lineSegment[1][0],
        lineSegment[1][1]
      )
    })

    // Draw the static points
    const yellowStart = drawStart(startPoint, 'yellow')
    const yellowEnd = drawEnd(randomEndX, randomEndY, 'yellow')

    const needsBlock = doesNotIntersectOtherBlocks && doesNotIntersectSolution

    let hasPlaced = false
    let firstBlock
    if (needsBlock) {
      let attempts = 0

      while (attempts++ < 100 && !hasPlaced) {
        firstBlock = pickBlockLocation(randomizer, startPoint, endPoint)
        hasPlaced = firstCreation.solutionPath.every(lineSegment => {
          return !doesLineIntersectRectangle(firstBlock.endpoints, lineSegment[0], lineSegment[1])
        })
      }
      if (!hasPlaced) throw new Error('could not place a block')
      drawBlock(firstBlock, 'lightblue')
    }

    // Add a connector to get around the block
    const firstConnect = getRandomConnector(
      randomizer,
      startPoint,
      endPoint,
      hasPlaced ? firstCreation.blocks.concat([firstBlock]) : firstCreation.blocks,
      firstCreation.solutionPath
    )
    const firstConnector = drawSquare(firstConnect[0], firstConnect[1], 'lightblue', blockSize)

    const secondBlock = pickBlockLocation(randomizer, firstConnect, endPoint)
    drawBlock(secondBlock, 'lightgreen')

    // Check that we are properly blocking the entry
    const secondCheck = doesLineIntersectRectangle(secondBlock.endpoints, firstConnect, endPoint)
    if (!secondCheck) throw new Error('second block does not block')

    const thirdBlock = pickBlockLocation(randomizer, firstConnect, startPoint)
    drawBlock(thirdBlock, 'magenta')

    const thirdCheck = doesLineIntersectRectangle(thirdBlock.endpoints, firstConnect, startPoint)
    if (!thirdCheck) throw new Error('third block does not block')

    const listOfBlocks = hasPlaced
      ? [firstBlock, secondBlock, thirdBlock]
      : [secondBlock, thirdBlock]

    const secondConnect = getRandomConnector(
      randomizer,
      endPoint,
      firstConnect,
      firstCreation.blocks.concat(listOfBlocks),
      firstCreation.solutionPath
    )
    const secondConnector = drawSquare(secondConnect[0], secondConnect[1], 'cyan', blockSize)

    let otherPoints = [[secondConnect, endPoint], [secondConnect, firstConnect]]
    const thirdConnect = getRandomConnector(
      randomizer,
      firstConnect,
      startPoint,
      firstCreation.blocks.concat(listOfBlocks),
      otherPoints.concat(firstCreation.solutionPath)
    )
    const thirdConnector = drawSquare(thirdConnect[0], thirdConnect[1], 'purple', blockSize)

    const solutionPath = [
      [startPoint, thirdConnect],
      [thirdConnect, firstConnect],
      [firstConnect, secondConnect],
      [secondConnect, endPoint],
    ]

    const checkBlockIntersection = block => {
      const points = block.endpoints

      return solutionPath.every(segment => {
        return !doesLineIntersectRectangle(points, segment[0], segment[1])
      })
    }

    let blockPlacementTries = 0
    let hasPlacedFourthBlock = false
    let fourthBlock

    while (blockPlacementTries++ < 100 && !hasPlacedFourthBlock) {
      fourthBlock = pickBlockLocation(randomizer, thirdConnect, endPoint)
      hasPlacedFourthBlock = checkBlockIntersection(fourthBlock)
    }
    if (!hasPlacedFourthBlock) throw new Error('could not position fourth block')
    drawBlock(fourthBlock, 'orange')

    blockPlacementTries = 0
    let fifthBlock
    let hasPlacedFifthBlock = false

    while (blockPlacementTries++ < 100 && !hasPlacedFifthBlock) {
      fifthBlock = pickBlockLocation(randomizer, secondConnect, thirdConnect)
      hasPlacedFifthBlock = checkBlockIntersection(fifthBlock)
    }
    if (!hasPlacedFifthBlock) throw new Error('could not position fifth block')
    drawBlock(fifthBlock, 'grey')

    blockPlacementTries = 0
    let sixthBlock
    let hasPlacedSixthBlock = false

    while (blockPlacementTries++ < 100 && !hasPlacedSixthBlock) {
      sixthBlock = pickBlockLocation(randomizer, secondConnect, startPoint)
      hasPlacedSixthBlock = checkBlockIntersection(sixthBlock)
    }
    if (!hasPlacedSixthBlock) throw new Error('could not position sixth block')
    drawBlock(sixthBlock)

    drawConnectorLines(
      yellowStart,
      [thirdConnector, firstConnector, secondConnector],
      yellowEnd,
      'yellow'
    )

    return {
      hasSucceeded: true,
    }
  } catch (e) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawStart(firstCreation.start, 'green')
    drawEnd(firstCreation.end[0], firstCreation.end[1], 'green')
    firstCreation.connectors.forEach(connector => {
      drawSquare(connector[0], connector[1], 'green')
    })
    drawConnectorLines(firstCreation.start, firstCreation.path, firstCreation.end, 'green')
    firstCreation.blocks.forEach((block, index) => {
      drawBlock(block, blockColors[index])
    })

    // return {
    //   hasSucceeded: true,
    //   start: greenStart,
    //   path: greenConnector,
    //   end: greenEnd,
    //   solutionPath: [
    //     [startPoint, thirdConnect],
    //     [thirdConnect, firstConnect],
    //     [firstConnect, secondConnect],
    //     [secondConnect, endPoint],
    //   ],
    //   blocks: [firstBlock, secondBlock, thirdBlock, fourthBlock, fifthBlock, sixthBlock],
    // }
    return {
      hasSucceeded: false,
    }
  }
}

let firstCreation

while (creationAttempts++ < 1000 && !hasCreatedGreenPath) {
  firstCreation = createGreenPath()
  hasCreatedGreenPath = firstCreation.hasSucceeded
  if (firstCreation.hasSucceeded) console.log('creationAttempts', creationAttempts)
}

// Two options - create the same type or create a separate path
// Worry about the separate path entry for now

let yellowCreationAttempts = 0
let hasCreatedYellowPath = false
let secondCreation

while (yellowCreationAttempts++ < 1000 && !hasCreatedYellowPath) {
  secondCreation = createYellowPath(firstCreation)
  hasCreatedYellowPath = secondCreation.hasSucceeded
  if (secondCreation.hasSucceeded) console.log('yellowCreationAttempts', yellowCreationAttempts)
}

// const greenConnector = [drawSquare(100, 100), drawSquare(150, 250), drawSquare(400, 10)]

// const yellowStart = drawPoint(40, 30, 'yellow')
// const yellowConnector = [drawSquare(200, 100, 'yellow')]
// const yellowEnd = drawEnd(250, 30, 'yellow')

// drawConnectorLines(yellowStart, yellowConnector, yellowEnd, 'yellow')
