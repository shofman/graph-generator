import { getGridXLength, getGridYLength } from './gridDimensions.js'
import { generateListOfRooms } from './generateListOfRooms.js'
import { arrayCopy } from './helpers.js'
import {
  EMPTY,
  WALL,
  SPACE,
  SUCCESS_TARGET,
  PLAYER,
  PASSTHROUGH_SPACE,
  PUSH_BLOCK,
} from './blockTypes.js'
import { draw } from './draw.js'

const getRow = (template, index) => arrayCopy(template[index])
const getCol = (template, index) => arrayCopy(template.map(row => row[index]))
const isEmpty = item => item === EMPTY

const TEMP_X_SIZE = 3
const TEMP_Y_SIZE = 3
const BLOCK_SIZE = 3

const isWithinXGrid = xPos => xPos >= 0 && xPos < TEMP_X_SIZE * BLOCK_SIZE
const isWithinYGrid = yPos => yPos >= 0 && yPos < TEMP_Y_SIZE * BLOCK_SIZE

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

const prepareVisitationGraph = grid =>
  grid.map(row =>
    row.map(block =>
      block === SPACE ? { visited: false, block: true, distance: 0 } : { block: false }
    )
  )

const depthFirstSearch = (x, y, visitedGraph, searchGroup) => {
  if (!isWithinXGrid(x)) return 0
  if (!isWithinYGrid(y)) return 0
  if (!visitedGraph[y] || !visitedGraph[y][x]) return 0
  if (!visitedGraph[y][x].block) return 0
  if (visitedGraph[y][x].visited) return 0

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

const getNumberOfBlocksSurroundingRoom = (grid, rowIndex, colIndex) => {
  const isNextToWallOrEmpty = (newRow, newCol) =>
    grid[newRow][newCol] === WALL || grid[newRow][newCol] === EMPTY

  const hasBelow = !isWithinYGrid(rowIndex + 1) || isNextToWallOrEmpty(rowIndex + 1, colIndex)
  const hasAbove = !isWithinYGrid(rowIndex - 1) || isNextToWallOrEmpty(rowIndex - 1, colIndex)
  const hasToLeft = !isWithinXGrid(colIndex - 1) || isNextToWallOrEmpty(rowIndex, colIndex - 1)
  const hasToRight = !isWithinXGrid(colIndex + 1) || isNextToWallOrEmpty(rowIndex, colIndex + 1)
  const totalNumberOfBlocksSurrounding = hasBelow + hasAbove + hasToLeft + hasToRight
  return totalNumberOfBlocksSurrounding
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

const createEmptyRoom = (randomizer, attemptNumber) => {
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

  const hasEnoughSpaceToPlace = true

  // console.log('allConnected', allConnected)
  // console.log('isNotTooOpen', isNotTooOpen)
  // console.log('allBlocksValid', allBlocksValid)

  return {
    grid: initialGrid,
    hasSucceeded: allConnected && isNotTooOpen && allBlocksValid && hasEnoughSpaceToPlace,
    storedRooms,
    storedRoomsGrid,
  }
}

const placeGoal = grid => {
  const newGrid = arrayCopy(grid)

  let placedEnoughGoals = false
  // Brute force placing the goal -
  // TODO: shuffle the SPACE results to ensure that there is a random assignment of goal placements

  grid.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      if (col === PASSTHROUGH_SPACE) {
        newGrid[rowIndex][colIndex] = SPACE
      }
      if (col === SPACE && !placedEnoughGoals) {
        const blocksAround = getNumberOfBlocksSurroundingRoom(newGrid, rowIndex, colIndex)
        if (blocksAround > 1) {
          newGrid[rowIndex][colIndex] = SUCCESS_TARGET
          placedEnoughGoals = true
        }
      }
    })
  })

  return newGrid
}

const findTarget = grid => {
  let targetRowIndex
  let targetColIndex

  grid.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      if (col === SUCCESS_TARGET) {
        targetColIndex = colIndex
        targetRowIndex = rowIndex
      }
    })
  })

  return {
    targetColIndex,
    targetRowIndex,
  }
}

const stateIncludesBothTargetAndBlock = state => {
  const stateHasTarget = state.some(row => row.includes(SUCCESS_TARGET))
  const stateHasBlock = state.some(row => row.includes(PUSH_BLOCK))
  return stateHasBlock && stateHasTarget
}

// Expand goal takes the content of the grid and returns the states that the player would previously have had to be in to achieve said state
const expandGoal = ({ grid, pastStates, difficulty }) => {
  const { targetColIndex, targetRowIndex } = findTarget(grid)

  let possibleStates = []

  // Check all the spaces around the player
  for (let y = -1; y < 2; y++) {
    for (let x = -1; x < 2; x++) {
      if (Math.abs(y) !== Math.abs(x)) {
        const newY = targetRowIndex + y
        const newX = targetColIndex + x
        if (isWithinXGrid(newX) && isWithinYGrid(newY)) {
          // Can only place a block if the previous space is empty
          const isPreviousSpaceEmpty = grid[newY][newX] === SPACE

          // Only placeable if there is a straight line for the player
          // to have traversed through to reach this state (e.g. cannot have a wall behind)
          const previousPlayerRow = newY + y
          const previousPlayerCol = newX + x
          const isPlayerAbleToPush =
            isWithinXGrid(previousPlayerCol) &&
            isWithinYGrid(previousPlayerRow) &&
            grid[previousPlayerRow][previousPlayerCol] === SPACE

          if (isPreviousSpaceEmpty && isPlayerAbleToPush) {
            // RESET TARGET
            const newGrid = arrayCopy(grid)
            newGrid[targetRowIndex][targetColIndex] = SPACE

            newGrid[newY][newX] = SUCCESS_TARGET
            possibleStates.push(newGrid)
          }
        }
      }
    }
  }

  console.log('possibleStates', possibleStates)
  console.log('pastStates', pastStates)

  possibleStates = possibleStates.filter(state => {
    const comparableState = JSON.stringify(state)
    const hasAlreadySeen = pastStates.includes(comparableState)
    if (!hasAlreadySeen) {
      pastStates.push(comparableState)
    }

    return !hasAlreadySeen
  })

  console.log('possibleStates after', possibleStates)
  return {
    possibleNextStates: possibleStates,
    pastStates,
    difficulty: difficulty + 1,
  }
}

const findFarthestSuccessState = ({ grid, finalGoal }) => {
  let attempts = 0
  let difficulty = 0
  let MAX_ATTEMPTS_TO_FIND_FURTHEST_SUCCESS = 1000
  const visitedStates = []

  const storedStates = JSON.stringify(grid)
  visitedStates.push(storedStates)

  const expandGoalInfo = {
    grid: arrayCopy(grid),
    pastStates: visitedStates,
    difficulty,
  }

  const allGoals = []

  let listOfStatesToCheck = [expandGoalInfo]

  while (listOfStatesToCheck.length && attempts < MAX_ATTEMPTS_TO_FIND_FURTHEST_SUCCESS) {
    const currentGoal = listOfStatesToCheck.shift()
    const newState = expandGoal(currentGoal)
    newState.possibleNextStates.forEach(state => {
      draw('myCanvas', arrayCopy(state), {})()
      const nextGoalToCheck = {
        grid: arrayCopy(state),
        pastStates: arrayCopy(newState.pastStates),
        difficulty: newState.difficulty,
      }
      // debugger
      allGoals.push(nextGoalToCheck)
      listOfStatesToCheck.push(nextGoalToCheck)
    })
    attempts += 1
  }

  console.log(
    `reason for terminating - listOfStatesToCheck.length: ${!listOfStatesToCheck.length}, attempts: ${attempts >=
      MAX_ATTEMPTS_TO_FIND_FURTHEST_SUCCESS}`
  )

  const bestResult = allGoals.sort((goalA, goalB) => goalB.difficulty - goalA.difficulty)[0]
  console.log('bestResult', bestResult)

  const returnState = bestResult.grid

  const lastStateGoal = findTarget(returnState)

  console.log('lastStateGoal', lastStateGoal)

  if (!lastStateGoal.targetColIndex || !lastStateGoal.targetRowIndex) {
    console.warn('could not find block placement!')
    console.log('allGoals', allGoals)
    return grid
  }
  returnState[finalGoal.targetRowIndex][finalGoal.targetColIndex] = SUCCESS_TARGET
  returnState[lastStateGoal.targetRowIndex][lastStateGoal.targetColIndex] = PUSH_BLOCK
  return returnState
}

const MAX_TRIES = 1000

export const createRoom = randomizer => {
  let tries = 0
  let success = false
  let grid
  let storedRoomsGrid
  while (tries++ < MAX_TRIES && !success) {
    try {
      const { grid: newGrid, hasSucceeded, storedRoomsGrid: newStoredRoomsGrid } = createEmptyRoom(
        randomizer,
        tries
      )
      if (hasSucceeded) {
        success = true
        const gridWithGoal = placeGoal(newGrid)

        const finalGoal = findTarget(gridWithGoal)

        grid = findFarthestSuccessState({ grid: gridWithGoal, finalGoal })

        // grid = gridWithGoal
        storedRoomsGrid = newStoredRoomsGrid
      } else {
        console.log('trying again')
      }
    } catch (e) {
      console.log('could not place room', e)
    }
  }
  return {
    grid,
    storedRoomsGrid,
  }
}
