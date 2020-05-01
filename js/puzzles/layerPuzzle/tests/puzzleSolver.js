import { createInitialGrid } from '../createInitialGrid.js'
import { AleaRandomizer } from '../../../utils/AleaRandomizer.js'
import { generateNewGrid } from '../generateNewGrid.js'
import { generateSolvedPuzzle } from '../solvePuzzle.js'

export const runTest = seed => {
  let initialGrid = createInitialGrid()
  const randomizer = AleaRandomizer(seed)

  const { shavedGrid } = generateNewGrid(initialGrid, randomizer)
  initialGrid = shavedGrid

  const solvedResults = generateSolvedPuzzle(initialGrid, randomizer)

  return {
    currentGrid: solvedResults.grid,
    results: solvedResults.results,
  }
}
