import { getCanvasWidth, getCanvasHeight } from './gridDimensions.js'
import { AleaRandomizer } from './AleaRandomizer.js'
import { generateNewGrid } from './generateNewGrid.js'
import { generateSolvedPuzzle } from './solvePuzzle.js'
import { draw } from './draw.js'
import { randomFive } from './seeds.js'
import { createInitialGrid } from './createInitialGrid.js'

const canvas = document.getElementById('myCanvas')
canvas.height = getCanvasHeight()
canvas.width = getCanvasWidth()

const seed = Math.random()
console.log('seed', seed)
const randomizer = AleaRandomizer(seed)

let initialGrid = createInitialGrid()

const { grid, shavedGrid, distanceVisitedGraph, floodGraph } = generateNewGrid(
  initialGrid,
  randomizer
)

initialGrid = shavedGrid
const otherGrid = grid

let currentGrid = initialGrid

const gridList = []
gridList.push(initialGrid)

const solvedResults = generateSolvedPuzzle(initialGrid, randomizer)
currentGrid = solvedResults.grid
let results = solvedResults.results

draw(currentGrid, otherGrid, results, distanceVisitedGraph, floodGraph)()
