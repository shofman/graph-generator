import { getGridXLength, getGridYLength, isWithinXGrid, isWithinYGrid } from './gridDimensions.js'
import { hardcodedSubroomTemplates } from './subroomTemplates.js'
import { arrayCopy } from './helpers.js'
import { generateListOfRooms } from './generateListOfRooms.js'
import { shuffleRooms } from './shuffleRooms.js'
import { EMPTY, WALL, SPACE } from './blockTypes.js'
import { debugDraw } from './draw.js'

const pickRandomElement = (array, randomizer) => {
  return array[Math.floor(randomizer() * array.length)]
}

const seedInitialGrid = (grid, randomizer) => {
  const newTemplateKey = pickRandomElement(Object.keys(hardcodedSubroomTemplates), randomizer)
  const newTemplatePlacement = arrayCopy(hardcodedSubroomTemplates[newTemplateKey])
  const newTemplateReference = arrayCopy(newTemplatePlacement)

  newTemplatePlacement.shift()
  newTemplatePlacement.pop()

  newTemplatePlacement.forEach((row, rowIndex) => {
    row.shift()
    row.pop()

    row.forEach((columnItem, columnIndex) => {
      const newXIndex = columnIndex
      const newYIndex = rowIndex

      grid[newYIndex][newXIndex] = columnItem
    })
  })
  return {
    grid,
    template: newTemplateReference,
  }
}

const itemIsTrue = item => item === true
const itemIsFalse = item => item === false
const itemIsEmpty = item => item === EMPTY
const isValidRowPosition = (grid, currentPos) => (item, index) =>
  item === grid[currentPos][index] || item === 0 || grid[currentPos][index] === 0
const isValidColPosition = (grid, rowIndex, colIndex) => (item, index) =>
  item === grid[rowIndex + index][colIndex] || item === 0 || grid[rowIndex + index][colIndex] === 0

let count = 0

const getRow = (template, index) => arrayCopy(template[index])
const getCol = (template, index) => arrayCopy(template.map(row => row[index]))

const areNeededBlocksOutsideGrid = (template, position) => {
  const topRow = position.i * 3
  const leftCol = position.j * 3
  const bottomRow = topRow + 2
  const rightCol = leftCol + 2
  let hasNeededBlocksOutside = false

  if (!isWithinYGrid(topRow - 1)) {
    const firstRow = getRow(template, 0)
    hasNeededBlocksOutside = hasNeededBlocksOutside || !firstRow.every(itemIsEmpty)
  }
  if (!isWithinYGrid(bottomRow + 1)) {
    const fifthRow = getRow(template, 4)
    hasNeededBlocksOutside = hasNeededBlocksOutside || !fifthRow.every(itemIsEmpty)
  }

  if (!isWithinXGrid(leftCol - 1)) {
    const firstCol = getCol(template, 0)
    hasNeededBlocksOutside = hasNeededBlocksOutside || !firstCol.every(itemIsEmpty)
  }
  if (!isWithinXGrid(rightCol + 1)) {
    const fifthCol = getCol(template, 4)
    hasNeededBlocksOutside = hasNeededBlocksOutside || !fifthCol.every(itemIsEmpty)
  }

  return hasNeededBlocksOutside
}

const isTemplateValidWithWestRoom = (template, westRoom) => {
  const leftTemplateCol = getCol(template, 0)
  const secondLeftTemplateCol = getCol(template, 1)

  const secondRightWestCol = getCol(westRoom, 3)
  const rightWestCol = getCol(westRoom, 4)

  let isValidRoom = true

  for (let x = 0; x < leftTemplateCol.length; x++) {
    if (
      leftTemplateCol[x] !== EMPTY &&
      secondRightWestCol[x] !== EMPTY &&
      leftTemplateCol[x] !== secondRightWestCol[x]
    ) {
      isValidRoom = false
    }
    if (
      secondLeftTemplateCol[x] !== EMPTY &&
      rightWestCol[x] !== EMPTY &&
      secondLeftTemplateCol[x] !== rightWestCol[x]
    ) {
      isValidRoom = false
    }
  }

  return isValidRoom
}

const isTemplateValidWithNorthRoom = (template, northRoom) => {
  const topTemplateRow = getRow(template, 0)
  const secondTemplateRow = getRow(template, 1)

  const secondBottomNorthRow = getRow(northRoom, 3)
  const bottomNorthRow = getRow(northRoom, 4)

  let isValidRoom = true

  for (let x = 0; x < topTemplateRow.length; x++) {
    if (
      topTemplateRow[x] !== EMPTY &&
      secondBottomNorthRow[x] !== EMPTY &&
      topTemplateRow[x] !== secondBottomNorthRow[x]
    ) {
      isValidRoom = false
    }
    if (
      secondTemplateRow[x] !== EMPTY &&
      bottomNorthRow[x] !== EMPTY &&
      secondTemplateRow[x] !== bottomNorthRow[x]
    ) {
      isValidRoom = false
    }
  }

  return isValidRoom
}

const isTemplateValidWithNorthwestRoom = (template, northWestRoom) => {
  const topTemplateRow = getRow(template, 0).slice(0, 2)
  const secondTemplateRow = getRow(template, 1).slice(0, 2)

  const secondBottomNorthWestRow = getRow(northWestRoom, 3).slice(3, 5)
  const bottomNorthWestRow = getRow(northWestRoom, 4).slice(3, 5)

  let isValidRoom = true

  for (let x = 0; x < topTemplateRow.length; x++) {
    if (
      topTemplateRow[x] !== EMPTY &&
      secondBottomNorthWestRow[x] !== EMPTY &&
      topTemplateRow[x] !== secondBottomNorthWestRow[x]
    ) {
      isValidRoom = false
    }
    if (
      secondTemplateRow[x] !== EMPTY &&
      bottomNorthWestRow[x] !== EMPTY &&
      secondTemplateRow[x] !== bottomNorthWestRow[x]
    ) {
      isValidRoom = false
    }
  }

  return isValidRoom
}

const isTemplateValidWithNortheastRoom = (template, northEastRoom) => {
  const topTemplateRow = getRow(template, 0).slice(3, 5)
  const secondTemplateRow = getRow(template, 1).slice(3, 5)

  const secondBottomNorthEastRow = getRow(northEastRoom, 3).slice(0, 2)
  const bottomNorthEastRow = getRow(northEastRoom, 4).slice(0, 2)

  let isValidRoom = true

  for (let x = 0; x < topTemplateRow.length; x++) {
    if (
      topTemplateRow[x] !== EMPTY &&
      secondBottomNorthEastRow[x] !== EMPTY &&
      topTemplateRow[x] !== secondBottomNorthEastRow[x]
    ) {
      isValidRoom = false
    }
    if (
      secondTemplateRow[x] !== EMPTY &&
      bottomNorthEastRow[x] !== EMPTY &&
      secondTemplateRow[x] !== bottomNorthEastRow[x]
    ) {
      isValidRoom = false
    }
  }

  return isValidRoom
}

const pickValidTemplateInGrid = (
  grid,
  listOfPossibleRooms,
  position,
  previousRooms,
  attemptNumber
) => {
  const { i, j } = position
  let hasSucceeded = false

  listOfPossibleRooms.forEach(roomTemplate => {
    if (hasSucceeded) return

    const currentTemplate = arrayCopy(roomTemplate)

    const hasNeededBlocksOutside = areNeededBlocksOutsideGrid(currentTemplate, position)
    if (hasNeededBlocksOutside) return

    const westNeighborPosition = { i: position.i, j: position.j - 1, type: 'west' }
    const northWestNeighborPosition = { i: position.i - 1, j: position.j - 1, type: 'northwest' }
    const northNeighborPosition = { i: position.i - 1, j: position.j, type: 'north' }
    const northEastNeighborPosition = { i: position.i - 1, j: position.j + 1, type: 'northeast' }

    const roomPositionsWithPotentialCollision = [
      westNeighborPosition,
      northWestNeighborPosition,
      northNeighborPosition,
      northEastNeighborPosition,
    ]

    let canPlace = true

    roomPositionsWithPotentialCollision.forEach(room => {
      if (isWithinXGrid(room.i, false) && isWithinYGrid(room.j, false)) {
        const roomIndex = getGridYLength(false) * room.j + room.i
        const roomToCheck = previousRooms[roomIndex]
        console.log('roomToCheck', roomToCheck)
        // TODO - using roomToCheck somehow changes the seed...
        let validator = isTemplateValidWithWestRoom
        if (room.type === 'north') {
          validator = isTemplateValidWithNorthRoom
        } else if (room.type === 'northwest') {
          validator = isTemplateValidWithNorthwestRoom
        } else if (room.type === 'northeast') {
          validator = isTemplateValidWithNortheastRoom
        }
        try {
          canPlace = canPlace && validator(arrayCopy(currentTemplate), arrayCopy(roomToCheck))
        } catch (e) {
          console.log('e', e)
        }
      }
    })

    console.log('previousRooms.length', previousRooms.length)

    // if (attemptNumber === 16 && previousRooms.length === 4) {
    //   debugDraw({}, grid, false)
    //   console.log('roomTemplate', roomTemplate)
    //   debugger
    // }
    // console.log('canPlace', canPlace)

    // For each neighbor
    //   1) check if the block exists (within grid) (value < 0 || value > width || height)
    //   2) for west neighbor, check enire left two columns of roomTemplate against west Neighbor right column
    //   3) for northWest, check top left square of roomTemplate againt bottom right square of northwest (2x2)
    //   4) for north, check two two rows of roomTemplate against north neighbor bottom two rows
    //   5) for northEast, check top right sqare of roomTemplate against bottom left square of northwest (2x2)

    // previousRooms.forEach((room, index) => {
    //   const leftMostPoint = (index * 3) % 6 // Width
    //   console.log('leftMostPoint', leftMostPoint)
    //   const rightMostPoint = leftMostPoint + 2
    //   const bottomMostPoint = Math.floor(index / 2) * 3 + 2
    //   console.log('bottomMostPoint', { bottomMostPoint, leftMostPoint, rightMostPoint }, room)
    //   const leftCol = position.j * 3
    //   console.log('position', position, leftCol)
    // })

    if (attemptNumber === 16 && previousRooms.length === 2) {
      debugDraw({}, grid, false)
      console.log('roomTemplate', roomTemplate)
      // debugger
    }
  })
}

const pickValidTemplateAndPlaceInGrid = (
  grid,
  listOfPossibleRooms,
  position,
  previousRooms,
  attemptNumber
) => {
  const { i, j } = position
  let hasSucceeded = false
  let pickedTemplate = undefined

  listOfPossibleRooms.forEach(roomTemplate => {
    if (hasSucceeded) return

    if (attemptNumber === 16) {
      debugDraw({}, grid, false)
      console.log('roomTemplate', roomTemplate)
      pickValidTemplateInGrid(grid, listOfPossibleRooms, position, previousRooms, attemptNumber)
      debugger
    }

    const currentTemplate = arrayCopy(roomTemplate)

    const rowBefore = roomTemplate.shift()
    const rowAfter = roomTemplate.pop()

    const currentRowPos = i * 3

    const rowBeforePosition = currentRowPos - 1
    const rowAfterPosition = currentRowPos + 1

    const rowBeforeValid =
      (!isWithinYGrid(rowBeforePosition) && rowBefore.every(item => item === EMPTY)) ||
      rowBefore.map(isValidRowPosition(grid, rowBeforePosition)).every(itemIsTrue)

    if (attemptNumber === 16) {
      debugDraw({}, grid, false)
      console.log('roomTemplate', roomTemplate)
      debugger
    }

    const rowAfterValid =
      (!isWithinYGrid(rowAfterPosition) && rowAfter.every(item => item === EMPTY)) ||
      rowAfter.map(isValidRowPosition(grid, rowAfterPosition)).every(itemIsTrue)

    if (rowBeforeValid && rowAfterValid) {
      const columnBefore = []
      const columnAfter = []

      roomTemplate.forEach(row => {
        columnBefore.push(row.shift())
        columnAfter.push(row.pop())
      })
      const currentColPos = j * roomTemplate[0].length

      const columnBeforePosition = currentColPos - 1
      const columnAfterPosition = currentColPos + roomTemplate[0].length + 1

      const columnBeforeValid =
        (!isWithinXGrid(columnBeforePosition) && columnBefore.every(item => item === EMPTY)) ||
        columnBefore
          .map(isValidColPosition(grid, currentRowPos, columnBeforePosition))
          .every(itemIsTrue)

      const columnAfterValid =
        (!isWithinXGrid(columnAfterPosition) && columnAfter.every(item => item === EMPTY)) ||
        columnAfter
          .map(isValidColPosition(grid, currentRowPos, columnAfterPosition))
          .every(itemIsTrue)

      if (columnBeforeValid && columnAfterValid) {
        roomTemplate.forEach((row, rowIndex) => {
          row.forEach((columnItem, columnIndex) => {
            const newXIndex = j * row.length + columnIndex
            const newYIndex = i * row.length + rowIndex

            grid[newYIndex][newXIndex] = columnItem
            hasSucceeded = true
            pickedTemplate = currentTemplate
          })
        })
      }
    }
  })

  return {
    grid,
    hasSucceeded,
    template: pickedTemplate,
  }
}

const depthFirstSearch = (x, y, visitedGraph, searchGroup) => {
  if (!isWithinXGrid(x)) return 0
  if (!isWithinYGrid(y)) return 0
  if (!visitedGraph[y] || !visitedGraph[y][x]) return 0
  if (visitedGraph[y][x].visited) return 0
  if (!visitedGraph[y][x].block) return 0

  visitedGraph[y][x].visited = true
  visitedGraph[y][x].searchGroup = searchGroup

  depthFirstSearch(x - 1, y, visitedGraph, searchGroup)
  depthFirstSearch(x, y - 1, visitedGraph, searchGroup)
  depthFirstSearch(x + 1, y, visitedGraph, searchGroup)
  depthFirstSearch(x, y + 1, visitedGraph, searchGroup)
}

const findGroupsWithFlooding = visitedGraph => {
  let searchGroup = 0
  visitedGraph.forEach((row, rowPos) => {
    row.forEach((item, colPos) => {
      if (item.block && !item.visited) {
        depthFirstSearch(colPos, rowPos, visitedGraph, searchGroup)
        searchGroup++
      }
    })
  })

  return visitedGraph
}

const prepareVisitationGraph = grid => {
  const newGrid = grid.map(row => {
    const newRows = row.map(block => {
      if (block === 1) {
        return { visited: false, block: true, distance: 0 }
      } else {
        return { block: false }
      }
    })
    return newRows
  })
  return newGrid
}

const findMaxAreaFromSingleArray = array => {
  let tempH
  let tempPos
  let maxSize = -Infinity
  let pos

  const heightStack = []
  const positionStack = []

  const removeHeightWhileLarger = () => {
    tempH = heightStack.pop()
    tempPos = positionStack.pop()
    const tempSize = tempH * (pos - tempPos)
    maxSize = Math.max(tempSize, maxSize)
  }

  for (pos = 0; pos < array.length; pos++) {
    const currentHeight = array[pos]
    if (heightStack.length === 0 || currentHeight > heightStack[heightStack.length - 1]) {
      heightStack.push(currentHeight)
      positionStack.push(pos)
    } else if (currentHeight < heightStack[heightStack.length - 1]) {
      while (heightStack.length && currentHeight < heightStack[heightStack.length - 1]) {
        removeHeightWhileLarger()
      }
      heightStack.push(currentHeight)
      positionStack.push(tempPos)
    }
  }
  while (heightStack.length) {
    removeHeightWhileLarger()
  }

  return maxSize
}

const hasTooMuchOpenSpace = grid => {
  let arrayBuffer = []
  let maxArea = 0
  grid[0].forEach(point => {
    if (point !== EMPTY) {
      arrayBuffer.push(0)
    }
  })

  for (let i = 0; i < grid.length; i++) {
    arrayBuffer = grid[i]
      .filter(point => point !== EMPTY)
      .map((point, index) => {
        if (point === WALL) {
          return 0
        } else {
          return 1 + arrayBuffer[index]
        }
      })

    let currSize = findMaxAreaFromSingleArray(arrayBuffer)
    maxArea = Math.max(maxArea, currSize)
  }

  return maxArea >= 12
}

const hasNoBlocksSurroundedByThreeWalls = grid => {
  const isNextToWallOrEmpty = (newRow, newCol) =>
    grid[newRow][newCol] === WALL || grid[newRow][newCol] === EMPTY
  return grid
    .map((row, rowIndex) => {
      return row
        .map((point, colIndex) => {
          if (point === SPACE) {
            const hasBelow =
              !isWithinYGrid(rowIndex + 1) || isNextToWallOrEmpty(rowIndex + 1, colIndex)
            const hasAbove =
              !isWithinYGrid(rowIndex - 1) || isNextToWallOrEmpty(rowIndex - 1, colIndex)
            const hasToLeft =
              !isWithinXGrid(colIndex - 1) || isNextToWallOrEmpty(rowIndex, colIndex - 1)
            const hasToRight =
              !isWithinXGrid(colIndex + 1) || isNextToWallOrEmpty(rowIndex, colIndex + 1)
            const totalNumberOfBlocksSurrounding = hasBelow + hasAbove + hasToLeft + hasToRight
            return totalNumberOfBlocksSurrounding === 3
          }
          return false
        })
        .every(itemIsFalse)
    })
    .every(itemIsTrue)
}

const createEmptyRoom = (randomizer, attemptNumber) => {
  let initialGrid = []

  for (let i = 0; i < getGridYLength(); i++) {
    initialGrid.push(
      Array.apply(null, Array(getGridXLength())).map(() => {
        return 0
      })
    )
  }

  let hasPlacedFirst = false
  const listOfPlacedRooms = []

  const listOfPossibleRooms = generateListOfRooms()

  for (let i = 0; i < getGridYLength(false); i++) {
    for (let j = 0; j < getGridXLength(false); j++) {
      if (!hasPlacedFirst) {
        const { grid, template } = seedInitialGrid(initialGrid, randomizer)
        initialGrid = grid
        listOfPlacedRooms.push(template)
        hasPlacedFirst = true
      } else {
        const shuffledRooms = shuffleRooms(arrayCopy(listOfPossibleRooms), randomizer)
        const currentPos = { i, j }

        // pickValidTemplateInGrid(initialGrid, shuffledRooms, currentPos, listOfPlacedRooms, attemptNumber)
        // console.log('we are here')

        const { grid, hasSucceeded, template } = pickValidTemplateAndPlaceInGrid(
          initialGrid,
          shuffledRooms,
          currentPos,
          listOfPlacedRooms,
          attemptNumber
        )

        if (!hasSucceeded) {
          throw new Error('Could not place a room')
        } else {
          listOfPlacedRooms.push(template)
          initialGrid = grid
        }
      }
    }
  }

  const visitedGraph = prepareVisitationGraph(initialGrid)
  findGroupsWithFlooding(visitedGraph)

  const allConnected = visitedGraph.every(row =>
    row.every(item => !item.block || (item.block && item.searchGroup === 0))
  )

  const hasEnoughSpace = !hasTooMuchOpenSpace(arrayCopy(initialGrid))

  const allBlocksValid = hasNoBlocksSurroundedByThreeWalls(arrayCopy(initialGrid))

  if (allConnected && hasEnoughSpace && allBlocksValid) {
    console.log(
      'allConnected, hasEnoughSpace, allBlocksValid',
      allConnected,
      hasEnoughSpace,
      allBlocksValid
    )
  }
  if (allConnected) {
    console.log('listOfPlacedRooms', listOfPlacedRooms)
  }

  return {
    grid: initialGrid,
    hasSucceeded: allConnected,
  }
}

const MAX_TRIES = 1000

export const createRoom = randomizer => {
  let tries = 0
  let success = false
  let grid
  while (tries++ < MAX_TRIES && !success) {
    try {
      const { grid: newGrid, hasSucceeded } = createEmptyRoom(randomizer, tries)
      if (hasSucceeded) {
        success = true
        grid = newGrid
      } else {
        console.log('trying again')
      }
    } catch (e) {
      // console.log('could not place a room')
    }
  }
  return { grid }
}
