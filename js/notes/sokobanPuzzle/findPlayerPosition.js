import { findGroupsWithFlooding, prepareVisitationGraph } from './visitationGraph.js'
import { SUCCESS_TARGET } from './blockTypes.js'
import { arrayCopy } from './helpers.js'
import { shuffleRooms as shuffleList } from './shuffleRooms.js'

export const findPlayerPosition = (bestResult, lastStateGoals, randomizer) => {
  // Place player in grid in a random possible position
  const lastGridHistory = bestResult.gridHistory[bestResult.gridHistory.length - 1]
  if (!lastGridHistory) {
    // This entry may not exist if there's only one in the history. Reject
    return { playerPositionX: -1, playerPositionY: -1 }
  }
  const playerPositionX = lastGridHistory.previousPlayerCol
  const playerPositionY = lastGridHistory.previousPlayerRow

  // const visitationGraph = prepareVisitationGraph(arrayCopy(bestResult.grid))
  // findGroupsWithFlooding(visitationGraph)

  // const secondToLastGrid = secondToLastHistory.grid

  // let currentVerticalIndex = bestResult.grid.findIndex(row => row.includes(SUCCESS_TARGET))
  // secondToLastGrid.forEach((row, rowIndex) => {
  //   const bestResultRow = bestResult.grid[rowIndex]
  //   if (JSON.stringify(row) !== JSON.stringify(bestResultRow)) {
  //     // Two cases - vertical and horizontal
  //     // if both entries of the same rowIndex contain a SUCCESS_TARGET, then it was a horizontal movement
  //     if (row.includes(SUCCESS_TARGET) && bestResultRow.includes(SUCCESS_TARGET)) {
  //       const priorPos = row.indexOf(SUCCESS_TARGET)
  //       const currentPos = bestResultRow.indexOf(SUCCESS_TARGET)
  //       if (priorPos > currentPos) {
  //         // Left movement - place player to left of target
  //         playerPositionY = rowIndex
  //         playerPositionX = currentPos - 1
  //       } else {
  //         // Right movement - place player to right of target
  //         playerPositionY = rowIndex
  //         playerPositionX = currentPos + 1
  //       }
  //     } else if (row.includes(SUCCESS_TARGET)) {
  //       if (currentVerticalIndex > rowIndex) {
  //         // Up movement
  //         playerPositionY = currentVerticalIndex + 1
  //         playerPositionX = row.indexOf(SUCCESS_TARGET)
  //       } else {
  //         // Down movement - place player above target
  //         playerPositionY = currentVerticalIndex - 1
  //         playerPositionX = row.indexOf(SUCCESS_TARGET)
  //       }
  //     }
  //   }
  // })

  const visitationGraph = prepareVisitationGraph(arrayCopy(bestResult.grid))
  findGroupsWithFlooding(visitationGraph)

  const playerSearchGroup = visitationGraph[playerPositionY][playerPositionX].searchGroup

  const possiblePositions = visitationGraph.reduce((accumulator, currentRow, rowIndex) => {
    const rowSum = []
    currentRow.forEach((column, colIndex) => {
      if (column.block && column.searchGroup === playerSearchGroup) {
        rowSum.push({ rowIndex, colIndex })
      }
    })
    return accumulator.concat(rowSum)
  }, [])

  if (possiblePositions.length) {
    const shuffledPositions = shuffleList(possiblePositions, randomizer)

    let isValidPosition = false

    while (shuffledPositions.length && !isValidPosition) {
      const { rowIndex, colIndex } = shuffledPositions.shift()

      isValidPosition = lastStateGoals.every(block => {
        return !(block.targetRowIndex === rowIndex && block.targetColIndex === colIndex)
      })
      if (isValidPosition) {
        return { playerPositionX: colIndex, playerPositionY: rowIndex }
      }
    }
  }

  return { playerPositionX, playerPositionY }
}

const pickSearchGroup = (playerGroup1, playerGroup2) => {
  if (playerGroup1 === playerGroup2) return playerGroup1
  if (playerGroup1 === 0) return playerGroup2
  if (playerGroup2 === 0) return playerGroup1
  return 0
}

export const findPlayerPosition2 = (bestResult, lastStateGoals, randomizer) => {
  // Place player in grid in a random possible position
  let playerPositionX
  let playerPositionY

  const possiblePlayerPositions =
    bestResult.gridHistory[bestResult.gridHistory.length - 1].previousPlayerPos

  const visitationGraph = prepareVisitationGraph(arrayCopy(bestResult.grid))
  findGroupsWithFlooding(visitationGraph)

  const firstPlayerPos = possiblePlayerPositions[0]
  const secondPlayerPos = possiblePlayerPositions[1]

  const playerSearchGroup1 =
    visitationGraph[firstPlayerPos.rowIndex][firstPlayerPos.colIndex].searchGroup

  const playerSearchGroup2 =
    visitationGraph[secondPlayerPos.rowIndex][secondPlayerPos.colIndex].searchGroup

  const hasValidSearchGroup =
    playerSearchGroup1 === playerSearchGroup2 ||
    playerSearchGroup1 === 0 ||
    playerSearchGroup2 === 0

  if (hasValidSearchGroup) {
    const validSearchGroup = pickSearchGroup(playerSearchGroup1, playerSearchGroup2)

    const possiblePositions = visitationGraph.reduce((accumulator, currentRow, rowIndex) => {
      const rowSum = []
      currentRow.forEach((column, colIndex) => {
        if (column.block && column.searchGroup === validSearchGroup) {
          rowSum.push({ rowIndex, colIndex })
        }
      })
      return accumulator.concat(rowSum)
    }, [])

    if (possiblePositions.length) {
      const shuffledPositions = shuffleList(possiblePositions, randomizer)

      let isValidPosition = false

      while (shuffledPositions.length && !isValidPosition) {
        const { rowIndex, colIndex } = shuffledPositions.shift()

        isValidPosition = lastStateGoals.every(block => {
          return !(block.targetRowIndex === rowIndex && block.targetColIndex === colIndex)
        })
        if (isValidPosition) {
          return { playerPositionX: colIndex, playerPositionY: rowIndex }
        }
      }
    }
  } else {
    debugger
  }

  return { playerPositionX, playerPositionY }
}
