import { getGridXLength, getGridYLength, TEMP_Y_SIZE, TEMP_X_SIZE } from './gridDimensions.js'
import { generateListOfRooms } from './generateListOfRooms.js'
import { arrayCopy } from './helpers.js'
import { EMPTY, WALL, SPACE } from './blockTypes.js'
import { prepareVisitationGraph, findGroupsWithFlooding } from './visitationGraph.js'
import { getNumberOfBlocksSurroundingRoom } from './getNumberOfBlocksSurroundingRoom.js'

const getRow = (template, index) => arrayCopy(template[index])
const getCol = (template, index) => arrayCopy(template.map(row => row[index]))
const isEmpty = item => item === EMPTY

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
      .map((point, index) => (point !== WALL ? 1 + arrayBuffer[index] : 0))

    let currSize = findMaxAreaFromSingleArray(arrayBuffer)
    maxArea = Math.max(maxArea, currSize)
  }

  return maxArea >= 12
}

const areTwoRoomSubsetsCompatible = (firstSubset, secondSubset) => {
  if (firstSubset.length !== secondSubset.length) {
    throw new Error(
      `lengths are different ${JSON.stringify(firstSubset)}, ${JSON.stringify(secondSubset)}`
    )
  }
  return firstSubset.every((item, index) => {
    if (item === EMPTY) return true
    const secondItem = secondSubset[index]
    if (secondItem === EMPTY) return true
    return item === secondItem
  })
}

const canPlaceRoom = (room, grid, storedRooms, xPos, yPos) => {
  // Check if the previous/next rows or cols falls off the grid with something inside it
  if (!room.isFirstRowEmpty && yPos - 1 < 0) return false
  if (!room.isFirstColEmpty && xPos - 1 < 0) return false
  if (!room.isLastRowEmpty && yPos + 1 >= TEMP_Y_SIZE) return false
  if (!room.isLastColEmpty && xPos + 1 >= TEMP_X_SIZE) return false

  // Check previous blocks if it collides
  if (storedRooms.length) {
    const leftRoom = storedRooms.find(room => room.xPos === xPos - 1 && room.yPos === yPos)

    if (leftRoom) {
      const firstComparison = areTwoRoomSubsetsCompatible(leftRoom.fourthCol, room.firstCol)
      const secondComparison = areTwoRoomSubsetsCompatible(leftRoom.fifthCol, room.secondCol)
      if (!firstComparison || !secondComparison) return false
    }

    const aboveRoom = storedRooms.find(room => room.xPos === xPos && room.yPos === yPos - 1)

    if (aboveRoom) {
      const firstComparison = areTwoRoomSubsetsCompatible(aboveRoom.fourthRow, room.firstRow)
      const secondComparison = areTwoRoomSubsetsCompatible(aboveRoom.fifthRow, room.secondRow)
      if (!firstComparison || !secondComparison) return false
    }

    const topRightRoom = storedRooms.find(room => room.xPos === xPos + 1 && room.yPos === yPos - 1)

    if (topRightRoom) {
      const firstComparison = areTwoRoomSubsetsCompatible(
        topRightRoom.bottomLeftBlock.firstRow,
        room.topRightBlock.firstRow
      )
      const secondComparison = areTwoRoomSubsetsCompatible(
        topRightRoom.bottomLeftBlock.secondRow,
        room.topRightBlock.secondRow
      )
      if (!firstComparison || !secondComparison) return false
    }

    const topLeftRoom = storedRooms.find(room => room.xPos === xPos - 1 && room.yPos === yPos - 1)

    if (topLeftRoom) {
      const firstComparison = areTwoRoomSubsetsCompatible(
        topLeftRoom.bottomRightBlock.firstRow,
        room.topLeftBlock.firstRow
      )
      const secondComparison = areTwoRoomSubsetsCompatible(
        topLeftRoom.bottomRightBlock.secondRow,
        room.topLeftBlock.secondRow
      )
      if (!firstComparison || !secondComparison) return false
    }
  }

  return true
}

const hasNoBlocksSurroundedByThreeWalls = grid =>
  grid.every((row, rowIndex) =>
    row.every((point, colIndex) => {
      if (point === SPACE) {
        const totalNumberOfBlocksSurrounding = getNumberOfBlocksSurroundingRoom(
          grid,
          rowIndex,
          colIndex
        )
        return totalNumberOfBlocksSurrounding !== 3
      }
      return true
    })
  )

const addRoomToGrid = (room, grid, xPos, yPos) => {
  room.forEach((row, rowIndex) => {
    row.forEach((columnItem, columnIndex) => {
      const newXIndex = xPos * row.length + columnIndex
      const newYIndex = yPos * row.length + rowIndex

      grid[newYIndex][newXIndex] = columnItem
    })
  })

  return {
    updatedGrid: grid,
  }
}

const createRoomInfo = (room, xPos, yPos) => {
  const trimRow = row => {
    const newRow = arrayCopy(row)
    newRow.pop()
    newRow.shift()
    return newRow
  }

  const roomObj = {
    block: [trimRow(room[1]), trimRow(room[2]), trimRow(room[3])],
    fullBlock: arrayCopy(room),
    firstRow: getRow(room, 0),
    secondRow: getRow(room, 1),
    thirdRow: getRow(room, 2),
    fourthRow: getRow(room, 3),
    fifthRow: getRow(room, 4),
    firstCol: getCol(room, 0),
    secondCol: getCol(room, 1),
    thirdCol: getCol(room, 2),
    fourthCol: getCol(room, 3),
    fifthCol: getCol(room, 4),
    topRightBlock: {
      firstRow: room[0].slice(3),
      secondRow: room[1].slice(3),
    },
    topLeftBlock: {
      firstRow: room[0].slice(0, 2),
      secondRow: room[1].slice(0, 2),
    },
    bottomRightBlock: {
      firstRow: room[3].slice(3),
      secondRow: room[4].slice(3),
    },
    bottomLeftBlock: {
      firstRow: room[3].slice(0, 2),
      secondRow: room[4].slice(0, 2),
    },
    xPos,
    yPos,
  }

  roomObj.isFirstRowEmpty = roomObj.firstRow.every(isEmpty)
  roomObj.isLastRowEmpty = roomObj.fifthRow.every(isEmpty)
  roomObj.isFirstColEmpty = roomObj.firstCol.every(isEmpty)
  roomObj.isLastColEmpty = roomObj.fifthCol.every(isEmpty)

  return roomObj
}

const generateRandomRoomAndPlace = ({
  randomizer,
  currentGrid,
  currentRoomsUsed,
  storedRoomsGrid,
  xPos,
  yPos,
}) => {
  const shouldShuffle = true
  const listOfPossibleRooms = generateListOfRooms(shouldShuffle, randomizer)

  let hasPlaced = false
  let roomIndex = 0

  let newGrid = currentGrid
  let newStoredGrid = storedRoomsGrid
  let newRoomsUsed = currentRoomsUsed

  while (!hasPlaced && roomIndex < listOfPossibleRooms.length) {
    const currentRoom = createRoomInfo(listOfPossibleRooms[roomIndex], xPos, yPos)

    const canPlace = canPlaceRoom(currentRoom, currentGrid, currentRoomsUsed, xPos, yPos)

    if (canPlace) {
      const newRoom = addRoomToGrid(currentRoom.block, currentGrid, xPos, yPos)
      newGrid = newRoom.updatedGrid
      newRoomsUsed.push(currentRoom)
      hasPlaced = true

      const newStoredGridRoom = addRoomToGrid(currentRoom.fullBlock, storedRoomsGrid, xPos, yPos)
      storedRoomsGrid = newStoredGridRoom.updatedGrid
    } else {
      roomIndex += 1
    }
  }

  if (!hasPlaced) {
    throw new Error('Cannot place block')
  }

  return {
    newGrid,
    newStoredGrid,
    newRoomsUsed,
  }
}

export const createEmptyRoom = randomizer => {
  let initialGrid = []
  let storedRoomsGrid = []
  let storedRooms = []

  for (let i = 0; i < getGridYLength(); i++) {
    initialGrid.push(Array.apply(null, Array(getGridXLength())).map(() => 0))
  }

  for (let i = 0; i < getGridXLength() * 5; i++) {
    storedRoomsGrid.push(Array.apply(null, Array(getGridXLength() * 5)).map(() => 0))
  }

  for (let y = 0; y < TEMP_Y_SIZE; y++) {
    for (let x = 0; x < TEMP_X_SIZE; x++) {
      const { newGrid, newStoredGrid, newRoomsUsed } = generateRandomRoomAndPlace({
        randomizer,
        currentGrid: initialGrid,
        currentRoomsUsed: storedRooms,
        storedRoomsGrid,
        xPos: x,
        yPos: y,
      })

      initialGrid = newGrid
      storedRoomsGrid = newStoredGrid
      storedRooms = newRoomsUsed
    }
  }

  const visitationGraph = prepareVisitationGraph(initialGrid)
  findGroupsWithFlooding(visitationGraph)

  const allConnected = visitationGraph.every(row =>
    row.every(item => !item.block || (item.block && item.searchGroup === 0))
  )

  const isNotTooOpen = !hasTooMuchOpenSpace(arrayCopy(initialGrid))

  const allBlocksValid = hasNoBlocksSurroundedByThreeWalls(arrayCopy(initialGrid))

  return {
    grid: initialGrid,
    hasSucceeded: allConnected && isNotTooOpen && allBlocksValid,
    storedRooms,
    storedRoomsGrid,
  }
}
