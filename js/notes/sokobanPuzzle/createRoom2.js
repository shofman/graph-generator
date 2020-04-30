import { isWithinYGrid, isWithinXGrid, getGridXLength } from './gridDimensions.js'
import { prepareVisitationGraph, findGroupsWithFlooding } from './visitationGraph.js'
import { shuffleRooms as shuffleList } from './shuffleRooms.js'
import { arrayCopy } from './helpers.js'
import { getNumberOfBlocksSurroundingRoom } from './getNumberOfBlocksSurroundingRoom.js'
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
import { createEmptyRoom } from './createEmptyRoom.js'

const placeGoals = (grid, randomizer) => {
  const newGrid = arrayCopy(grid)

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

const checkBestResult2 = (bestResult, finalGoals) => {
  const actionsInOrder = bestResult.gridHistory.reverse()

  const areAllActionsValid = actionsInOrder.every((currentAction, index) => {
    if (index + 1 > actionsInOrder.length - 1) return true
    const nextAction = actionsInOrder[index + 1]

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

const createFarthestSuccessState = ({ grid, finalGoals, randomizer }) => {
  const listOfStatesChecked = []
  const initialDifficulty = 0
  let attempts = 0
  const MAX_ATTEMPTS_TO_FIND_FURTHEST_SUCCESS = 1000

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

  const finalGrid = arrayCopy(bestResult.grid)
  const lastStateGoals = findTargets(finalGrid)

  console.log('bestResult', bestResult)

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
        console.log('shuffledGoals.length', shuffledGoals.length)
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

  outputGrid.forEach((row, rowIndex) => {
    outputGrid.forEach((col, colIndex) => {
      if (colIndex === 9 && rowIndex < 10) {
        outputGrid[rowIndex][colIndex] = WALL
      }
      if (rowIndex === 9 && colIndex < 10) {
        outputGrid[rowIndex][colIndex] = WALL
      }
    })
    if (rowIndex < 10) {
      row.unshift(WALL)
    }
  })
  outputGrid.unshift(
    Array.apply(null, Array(getGridXLength())).map((item, index) => (index < 11 ? WALL : EMPTY))
  )
  return {
    grid: outputGrid,
    storedRoomsGrid,
    storedBestGrid,
  }
}
