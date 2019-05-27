import { OBSTACLE, TARGET, EMPTY, SUCCESS_TARGET } from './blockTypes.js'
import { getValuesFromKey } from './generateKey.js'
import { isWithinXGrid, isWithinYGrid } from './gridDimensions.js'

export const slideBlock = (results, currentGrid, blockKey, direction) => {
  const currentBlock = results[blockKey]
  const { x, y } = direction

  let [currCol, currRow] = getValuesFromKey(blockKey)

  let blockValue = currentBlock.value
  let nextBlock = currentGrid[currRow][currCol]

  while (
    blockValue > 0 &&
    isWithinXGrid(currCol + x) &&
    isWithinYGrid(currRow + y) &&
    nextBlock !== TARGET
  ) {
    currRow = currRow + y
    currCol = currCol + x

    nextBlock = currentGrid[currRow][currCol]
    if (nextBlock === EMPTY) {
      blockValue--
      results[blockKey].value = blockValue
      currentGrid[currRow][currCol] = OBSTACLE
    } else if (nextBlock === TARGET) {
      blockValue--
      results[blockKey].value = blockValue
      currentGrid[currRow][currCol] = SUCCESS_TARGET
    }
  }

  return {
    foundTarget: nextBlock === TARGET,
    currentGrid,
    results,
  }
}
