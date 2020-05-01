import { getCanvasWidth, getCanvasHeight } from './gridDimensions.js'
import { AleaRandomizer } from '../../utils/AleaRandomizer.js'
import { generateNewGrid } from './generateNewGrid.js'
import { generateSolvedPuzzle } from './solvePuzzle.js'
import { drawCreationDetails } from './draw.js'
import { createInitialGrid } from './createInitialGrid.js'
import { play } from './play.js'
// import { simpSimpSimple } from './seeds.js'

const canvas = document.getElementById('myCanvas')
canvas.height = getCanvasHeight()
canvas.width = getCanvasWidth()

const seed = 0.5864508999144089//Math.random()
console.log('seed', seed)
const randomizer = AleaRandomizer(seed)

let initialGrid = createInitialGrid()

const { grid, shavedGrid, floodGraph } = generateNewGrid(initialGrid, randomizer)

initialGrid = shavedGrid
const otherGrid = grid

let currentGrid = initialGrid

const gridList = []
gridList.push(initialGrid)
let solvedResults = {}
let results = {}
let target = {}
try {
  solvedResults = generateSolvedPuzzle(initialGrid, randomizer)
  currentGrid = solvedResults.grid
  results = solvedResults.results
  target = solvedResults.target
} catch (e) {
  console.log('could not solve', e)
}

drawCreationDetails(otherGrid, floodGraph)()
play(currentGrid, results, target)
