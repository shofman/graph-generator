import { isWithinYGrid, isWithinXGrid } from './gridDimensions.js'
import { EMPTY, WALL } from './blockTypes.js'

export const getNumberOfBlocksSurroundingRoom = (grid, rowIndex, colIndex) => {
  const isNextToWallOrEmpty = (newRow, newCol) =>
    grid[newRow][newCol] === WALL || grid[newRow][newCol] === EMPTY

  const hasBelow = !isWithinYGrid(rowIndex + 1) || isNextToWallOrEmpty(rowIndex + 1, colIndex)
  const hasAbove = !isWithinYGrid(rowIndex - 1) || isNextToWallOrEmpty(rowIndex - 1, colIndex)
  const hasToLeft = !isWithinXGrid(colIndex - 1) || isNextToWallOrEmpty(rowIndex, colIndex - 1)
  const hasToRight = !isWithinXGrid(colIndex + 1) || isNextToWallOrEmpty(rowIndex, colIndex + 1)
  const totalNumberOfBlocksSurrounding = hasBelow + hasAbove + hasToLeft + hasToRight
  return totalNumberOfBlocksSurrounding
}
