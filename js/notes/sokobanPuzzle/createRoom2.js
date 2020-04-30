import {
  getGridXLength,
  getGridYLength,
  isWithinYGrid,
  isWithinXGrid,
  TEMP_Y_SIZE,
  TEMP_X_SIZE,
} from './gridDimensions.js'
import { prepareVisitationGraph, findGroupsWithFlooding } from './visitationGraph.js'
import { generateListOfRooms } from './generateListOfRooms.js'
import { shuffleRooms as shuffleList } from './shuffleRooms.js'
import { findPermutations, combinePermutationsIntoGridState } from './findPermutations.js'
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
import { findPlayerPosition } from './findPlayerPosition.js'

const getRow = (template, index) => arrayCopy(template[index])
const getCol = (template, index) => arrayCopy(template.map(row => row[index]))
const isEmpty = item => item === EMPTY

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

const createEmptyRoom = randomizer => {
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

const placeGoals = (grid, randomizer) => {
  const newGrid = arrayCopy(grid)

  // Brute force placing the goal - add a second one

  const allGoals = []

  grid.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      if (col === PASSTHROUGH_SPACE) {
        newGrid[rowIndex][colIndex] = SPACE
        allGoals.push({ colIndex, rowIndex })
      }
      if (col === SPACE) {
        const blocksAround = getNumberOfBlocksSurroundingRoom(newGrid, rowIndex, colIndex)
        if (blocksAround >= 1) {
          allGoals.push({ colIndex, rowIndex })
        }
      }
    })
  })

  const shuffledGoals = shuffleList(allGoals, randomizer)

  return {
    grid: newGrid,
    shuffledGoals,
  }
}

const findTargets = grid => {
  const targets = []

  grid.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      if (col === SUCCESS_TARGET) {
        targets.push({
          targetColIndex: colIndex,
          targetRowIndex: rowIndex,
        })
      }
    })
  })

  return targets
}

const findPossibleStates = (grid, { targetColIndex, targetRowIndex }) => {
  const possibleStates = []

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
            possibleStates.push({
              grid: newGrid,
              directionY: y,
              directionX: x,
              previousPlayerCol,
              previousPlayerRow,
              blockCol: newX,
              blockRow: newY,
              // Next here because we are moving backwards
              nextBlockCol: targetColIndex,
              nextBlockRow: targetRowIndex,
            })
          }
        }
      }
    }
  }

  return possibleStates
}

const calculateDifficultyFromPastState = (pastState, currentState) => {
  const areMovingSameBlock = (pastState, currentState) => {
    return (
      currentState.nextBlockCol === pastState.blockCol &&
      currentState.nextBlockRow === pastState.blockRow
    )
  }

  const areMovingInSameDirection = (pastState, currentState) => {
    return (
      pastState.directionX === currentState.directionX ||
      pastState.directionY === currentState.directionY
    )
  }

  const areReversingDirection = (pastState, currentState) => {
    // Check added here to ensure that changing order of if statements is less impacted
    if (areMovingInSameDirection(pastState, currentState)) return false
    return (
      Math.abs(currentState.directionX) === Math.abs(pastState.directionX) &&
      Math.abs(currentState.directionY) == Math.abs(pastState.directionY)
    )
  }

  // if we are switching between blocks, that counts as a better difficulty
  if (!areMovingSameBlock(pastState, currentState)) {
    // TODO - explore if checking the direction also effects difficulty here
    return 6
  } else {
    // if we are continuing in the same direction, that counts as the same difficulty
    if (areMovingInSameDirection(pastState, currentState)) {
      return 0
    } else if (areReversingDirection(pastState, currentState)) {
      // if we are changing direction for the current axis of movement, that counts as better, but not as much
      return 1
    } else {
      // if we are switching direction axis, that counts as a better difficulty
      return 2
    }
  }
}

// Expand goal takes the content of the grid and returns the states that the player would previously have had to be in to achieve said state
const expandGoal = ({ grid, gridHistory, pastStates, difficulty }) => {
  const allTargets = findTargets(grid)

  let possibleStates = []
  if (allTargets.length !== 2) {
    return {
      possibleStates,
      pastStates,
    }
  }

  // TODO - Double check - do we include the situation where one state does not move, but the other does?

  let possibleStates1 = findPossibleStates(grid, allTargets[0])
  let possibleStates2 = findPossibleStates(grid, allTargets[1])

  possibleStates = possibleStates1.concat(possibleStates2)

  possibleStates = possibleStates.filter(state => {
    const comparableState = JSON.stringify(state.grid)
    const hasAlreadySeen = pastStates.includes(comparableState)
    if (!hasAlreadySeen) {
      pastStates.push(comparableState)
    }
    return !hasAlreadySeen
  })

  const lastHistory = gridHistory[0]
  const possibleStatesWithCalculatedDifficulty = possibleStates
    .map(state => {
      const newState = { ...state }

      if (!lastHistory) {
        newState.difficulty = difficulty + 1
      } else {
        const newDifficulty = calculateDifficultyFromPastState(lastHistory, state)
        newState.difficulty = difficulty + newDifficulty
      }
      return newState
    })
    .sort((item1, item2) => item2.difficulty - item1.difficulty)

  // How to handle when only one permutation is possible?

  // const allPermutations = findPermutations(possibleStates1, possibleStates2)

  // allPermutations.forEach(twoStates => {
  //   const newGridState = combinePermutationsIntoGridState(twoStates)
  //   const comparableState = JSON.stringify(newGridState.grid)
  //   const hasAlreadySeen = pastStates.includes(comparableState)
  //   if (!hasAlreadySeen) {
  //     pastStates.push(comparableState)
  //     possibleStates.push(newGridState)
  //   }
  // })

  return {
    possibleStates: possibleStatesWithCalculatedDifficulty,
    pastStates,
  }
}

// eslint-disable-next-line no-unused-vars
const debugDraw = grid => {
  draw('myCanvas', grid, {})()
}

const isBlockWherePlayerNeedsToBe = (firstBlock, secondBlock) => {
  return (
    firstBlock.blockCol == secondBlock.previousPlayerCol &&
    firstBlock.blockRow === secondBlock.previousPlayerRow
  )
}

const doesActionFollow = (currentBlock, nextBlock) => {
  return (
    currentBlock.previousPlayerRow - currentBlock.directionY === nextBlock.previousPlayerRow &&
    currentBlock.previousPlayerCol - currentBlock.directionX === nextBlock.previousPlayerCol
  )
}

const checkBestResult2 = (bestResult, finalGoals, shouldDebug = false) => {
  const actionsInOrder = bestResult.gridHistory.reverse()

  // if (shouldDebug) console.log('actionsInOrder', actionsInOrder)
  // if (shouldDebug) debugger

  const areAllActionsValid = actionsInOrder.every((currentAction, index) => {
    if (index + 1 > actionsInOrder.length - 1) return true
    const nextAction = actionsInOrder[index + 1]
    // console.log('nextAction', nextAction)

    // if (
    //   currentFirstBlock.blockCol === currentSecondBlock.blockCol &&
    //   currentFirstBlock.blockRow === currentSecondBlock.blockRow
    // ) {
    //   // The blocks are in the same position - cannot happen. Reject
    //   return false
    // }

    const doActionsFollowPath = doesActionFollow(currentAction, nextAction)

    if (doActionsFollowPath) {
      return true
    } else {
      return canReachNextPosWithoutMovingBlock(currentAction, nextAction)
    }
  })

  const lastStateGoals = findTargets(bestResult.grid)

  const finalStateStringArray = finalGoals.map(JSON.stringify)
  const areEndStatesInvalid = lastStateGoals
    .map(JSON.stringify)
    .some(item => finalStateStringArray.includes(item))

  return areAllActionsValid && !areEndStatesInvalid
}

const canReachNextPosWithoutMovingBlock = (currentAction, nextAction) => {
  // Create a grid that we can verify on
  const verificationGrid = arrayCopy(currentAction.grid)
  // Pretend that the player has pushed the block - they are in the position of the current actions block
  const newPlayerPosY = currentAction.blockRow
  const newPlayerPosX = currentAction.blockCol

  // Next, set that the block in the next position is a wall, so that it cannot be moved
  verificationGrid[nextAction.blockRow][nextAction.blockCol] = WALL
  verificationGrid[newPlayerPosY][newPlayerPosX] = SPACE

  const visitationGraph = prepareVisitationGraph(verificationGrid)
  findGroupsWithFlooding(visitationGraph)

  // Check that the nextAction's required player position is the same search group as the current player position
  // (e.g. can I reach the next position without moving the block)
  if (
    visitationGraph[newPlayerPosY][newPlayerPosX].searchGroup !==
    visitationGraph[nextAction.previousPlayerRow][nextAction.previousPlayerCol].searchGroup
  ) {
    return false
  }
  return true
}

const calculateDifficulty = bestResult => (totalDifficulty, currentHistory, currentIndex) => {
  if (bestResult.gridHistory[currentIndex + 1]) {
    if (
      bestResult.gridHistory[currentIndex + 1].directionY !== currentHistory.directionY &&
      bestResult.gridHistory[currentIndex + 1].directionX !== currentHistory.directionX
    ) {
      return totalDifficulty + 1
    }
  }
  return totalDifficulty
}

const createFarthestSuccessState = ({ grid, finalGoals, randomizer }) => {
  const listOfStatesChecked = []
  const initialDifficulty = 0
  let attempts = 0
  const MAX_ATTEMPTS_TO_FIND_FURTHEST_SUCCESS = 1000
  // const MAX_ATTEMPTS_TO_FIND_FURTHEST_SUCCESS = 10

  // debugDraw(grid)
  // debugger

  const goalInfo = {
    grid: arrayCopy(grid),
    gridHistory: [],
    difficulty: initialDifficulty,
  }

  const listOfStatesToCheck = [goalInfo]
  const allGoals = []

  while (attempts++ < MAX_ATTEMPTS_TO_FIND_FURTHEST_SUCCESS && listOfStatesToCheck.length) {
    const currentState = listOfStatesToCheck.shift()
    const newGoal = { ...currentState, pastStates: listOfStatesChecked }
    const nextStates = expandGoal(newGoal)
    // console.log('nextStates', nextStates)w

    nextStates.possibleStates.forEach(state => {
      const nextGoal = {
        grid: arrayCopy(state.grid),
        gridHistory: [...currentState.gridHistory, state],
        difficulty: state.difficulty,
        stateInfo: state,
      }
      allGoals.push(nextGoal)
      listOfStatesToCheck.push(nextGoal)
    })
  }

  const goalsToCheck = arrayCopy(allGoals).sort(
    (goalA, goalB) => goalB.difficulty - goalA.difficulty
  )

  let bestResult
  let isValidResult = false

  while (!isValidResult && goalsToCheck.length) {
    bestResult = goalsToCheck.shift()
    isValidResult = checkBestResult2(arrayCopy(bestResult), finalGoals)
  }

  if (!bestResult) {
    return { grid: {}, difficulty: 0 }
  }

  // checkBestResult2(arrayCopy(bestResult), finalGoals, true)

  const finalGrid = arrayCopy(bestResult.grid)
  const lastStateGoals = findTargets(finalGrid)

  console.log('bestResult', bestResult)

  // TODO - Add validation for last state goals - if the list is empty

  // if (!lastStateGoal.targetColIndex || !lastStateGoal.targetRowIndex) {
  //   return { grid: {}, difficulty: 0 }
  // }

  finalGoals.forEach(({ targetRowIndex, targetColIndex }) => {
    finalGrid[targetRowIndex][targetColIndex] = SUCCESS_TARGET
  })

  lastStateGoals.forEach(({ targetRowIndex, targetColIndex }) => {
    finalGrid[targetRowIndex][targetColIndex] = PUSH_BLOCK
  })

  const { playerPositionY, playerPositionX } = findPlayerPosition(
    bestResult,
    finalGoals,
    randomizer
  )
  if (playerPositionY === -1 || playerPositionX === -1) return { grid: {}, difficulty: 0 }
  finalGrid[playerPositionY][playerPositionX] = PLAYER

  return {
    grid: finalGrid,
    gridHistory: bestResult.gridHistory,
    difficulty: bestResult.difficulty,
  }
}

const MAX_TRIES = 5000
const MAX_INTERNAL_TRIES = 5000

export const createRoom = randomizer => {
  let tries = 0
  let success = false
  let grid
  let storedRoomsGrid
  let storedBestGrid

  while (tries++ < MAX_TRIES && !success) {
    try {
      const { grid: newGrid, hasSucceeded, storedRoomsGrid: newStoredRoomsGrid } = createEmptyRoom(
        randomizer
      )
      if (hasSucceeded) {
        const { grid: cleanedGrid, shuffledGoals } = placeGoals(newGrid, randomizer)

        let internalTries = 0

        while (internalTries++ < MAX_INTERNAL_TRIES && !success) {
          const firstGoal = shuffledGoals.shift()
          const secondGoal = shuffledGoals.shift()
          if (!firstGoal || !secondGoal) {
            success = false
          } else {
            const currentGrid = arrayCopy(cleanedGrid)
            const { rowIndex: firstGoalRow, colIndex: firstGoalCol } = firstGoal
            currentGrid[firstGoalRow][firstGoalCol] = SUCCESS_TARGET

            const { rowIndex: secondGoalRow, colIndex: secondGoalCol } = secondGoal
            currentGrid[secondGoalRow][secondGoalCol] = SUCCESS_TARGET

            const { grid: bestGrid, gridHistory, difficulty } = createFarthestSuccessState({
              grid: currentGrid,
              finalGoals: [
                {
                  targetColIndex: firstGoalCol,
                  targetRowIndex: firstGoalRow,
                },
                {
                  targetColIndex: secondGoalCol,
                  targetRowIndex: secondGoalRow,
                },
              ],
              randomizer,
            })

            storedBestGrid = {
              bestGrid,
              gridHistory,
              difficulty,
            }

            if (difficulty < 150) {
              if (!storedBestGrid || (storedBestGrid && storedBestGrid.difficulty < difficulty)) {
                storedBestGrid = {
                  bestGrid,
                  gridHistory,
                  difficulty,
                }
              }
              success = false
            } else {
              success = true
            }

            grid = bestGrid
            storedRoomsGrid = newStoredRoomsGrid
          }
        }
      }
    } catch (e) {
      success = false
      console.log('e', e)
    }
  }

  const outputGrid = success ? grid : storedBestGrid.bestGrid

  console.log('storedBestGrid', storedBestGrid)

  // outputGrid.forEach((row, rowIndex) => {
  //   outputGrid.forEach((col, colIndex) => {
  //     if (colIndex === 9 && rowIndex < 10) {
  //       outputGrid[rowIndex][colIndex] = WALL
  //     }
  //     if (rowIndex === 9 && colIndex < 10) {
  //       outputGrid[rowIndex][colIndex] = WALL
  //     }
  //   })
  //   if (rowIndex < 10) {
  //     row.unshift(WALL)
  //   }
  // })
  // outputGrid.unshift(
  //   Array.apply(null, Array(getGridXLength())).map((item, index) => (index < 11 ? WALL : EMPTY))
  // )
  return {
    grid: outputGrid,
    storedRoomsGrid,
    storedBestGrid,
  }
}
