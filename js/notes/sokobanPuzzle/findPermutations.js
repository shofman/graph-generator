import { arrayCopy } from './helpers.js'
import { SUCCESS_TARGET, SPACE } from './blockTypes.js'

export const findPermutations = (listOne, listTwo) => {
  const permutations = []

  listOne.forEach(entry => {
    listTwo.forEach(secondEntry => {
      const option = [entry, secondEntry]
      permutations.push(option)
    })
  })

  return permutations
}

export const combinePermutationsIntoGridState = twoGrids => {
  const [firstGridObj, secondGridObj] = twoGrids
  const newGrid = arrayCopy(firstGridObj.grid)

  newGrid.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      if (col === SUCCESS_TARGET) {
        newGrid[rowIndex][colIndex] = SPACE
      }
      if (
        (colIndex === firstGridObj.blockCol && rowIndex === firstGridObj.blockRow) ||
        (colIndex === secondGridObj.blockCol && rowIndex === secondGridObj.blockRow)
      ) {
        newGrid[rowIndex][colIndex] = SUCCESS_TARGET
      }
    })
  })

  const newGridState = {
    grid: newGrid,
    blocks: [
      {
        colIndex: firstGridObj.blockCol,
        rowIndex: firstGridObj.blockRow,
      },
      {
        colIndex: secondGridObj.blockCol,
        rowIndex: secondGridObj.blockRow,
      },
    ],
    directions: [
      { directionX: firstGridObj.directionX, directionY: firstGridObj.directionY },
      { directionX: secondGridObj.directionX, directionY: secondGridObj.directionY },
    ],
    previousPlayerPos: [
      {
        colIndex: firstGridObj.previousPlayerCol,
        rowIndex: firstGridObj.previousPlayerRow,
      },
      {
        colIndex: secondGridObj.previousPlayerCol,
        rowIndex: secondGridObj.previousPlayerRow,
      },
    ],
    firstBlock: { ...firstGridObj },
    secondBlock: { ...secondGridObj },
  }

  return newGridState
}
