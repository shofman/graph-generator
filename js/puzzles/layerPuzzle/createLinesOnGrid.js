import { OBSTACLE, TARGET } from './blockTypes.js'
import { generateKey } from './generateKey.js'

export const createLines = grid => {
  const gridPositions = {}
  const lineGrid = {
    horizontal: [],
    vertical: [],
  }

  grid.forEach((row, rowPos) => {
    row.forEach((block, colPos) => {
      if (block === OBSTACLE || block === TARGET) {
        const key = generateKey(colPos, rowPos)
        gridPositions[key] = OBSTACLE
      }
    })
  })

  // Horizontal lines
  const obstaclePositions = Object.keys(gridPositions)

  obstaclePositions.forEach(hexEntry => {
    const newLine = []
    const currentEntry = hexEntry
    const [hexX, hexY] = currentEntry.split(',')
    let xNeighbor = Number(hexX) + 1
    let horizontalNeighbor = generateKey(xNeighbor, hexY)

    if (obstaclePositions.includes(horizontalNeighbor)) {
      newLine.push(currentEntry)
    }

    while (obstaclePositions.includes(horizontalNeighbor)) {
      newLine.push(horizontalNeighbor)
      xNeighbor = Number(xNeighbor) + 1
      horizontalNeighbor = generateKey(xNeighbor, hexY)
    }

    if (
      newLine.length > 1 &&
      !lineGrid.horizontal.some(possibleArray => possibleArray.includes(currentEntry))
    ) {
      lineGrid.horizontal.push(newLine)
    }
  })

  // Vertical lines
  obstaclePositions.forEach(hexEntry => {
    const newLine = []
    const currentEntry = hexEntry
    const [hexX, hexY] = currentEntry.split(',')

    let yNeighbor = Number(hexY) + 1
    let verticalNeighbor = generateKey(hexX, yNeighbor)

    if (obstaclePositions.includes(verticalNeighbor)) {
      newLine.push(currentEntry)
    }

    while (obstaclePositions.includes(verticalNeighbor)) {
      newLine.push(verticalNeighbor)
      yNeighbor = Number(yNeighbor) + 1
      verticalNeighbor = generateKey(hexX, yNeighbor)
    }

    if (
      newLine.length > 1 &&
      !lineGrid.vertical.some(possibleArray => possibleArray.includes(currentEntry))
    ) {
      lineGrid.vertical.push(newLine)
    }
  })

  return lineGrid
}
