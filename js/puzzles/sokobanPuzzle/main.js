import { getCanvasWidth, getCanvasHeight } from './gridDimensions.js'
import { AleaRandomizer } from '../../utils/AleaRandomizer.js'
import { createRoom } from './createRoom2.js'
import { draw } from './draw.js'

const canvas = document.getElementById('myCanvas')
canvas.height = getCanvasHeight()
canvas.width = getCanvasWidth()

const debugCanvas = document.getElementById('debugCanvas')
debugCanvas.height = getCanvasHeight()
debugCanvas.width = getCanvasWidth()

const seedOutput = document.getElementById('seed')

const debugInput = document.getElementById('debugHistory')
const debugLabel = document.getElementById('debugLabel')
const additionButton = document.getElementById('addition')
const subtractButton = document.getElementById('subtract')

let historyIndex = 0

let seed = Math.random()
// seed = 0.5546359266872523 // only considering one target
// seed = 0.1460515347403799 // only considering one target
// seed = 0.3220532206180031 // solvable but should be impossible by grid history - impossible move in between - no longer considered valid

seedOutput.innerHTML = `Seed: ${seed}`
console.log('seed', seed)
const randomizer = AleaRandomizer(seed)

const { grid, storedBestGrid } = createRoom(randomizer)
draw('myCanvas', grid, {})()

if (storedBestGrid) {
  const maxLength = storedBestGrid.gridHistory.length
  console.log('storedBestGrid', storedBestGrid)
  storedBestGrid.gridHistory.unshift({ grid: storedBestGrid.bestGrid })
  debugInput.max = maxLength
  debugInput.min = 0
  debugInput.value = 0
  debugLabel.innerHTML = 0

  additionButton.onclick = () => {
    historyIndex = historyIndex + 1 > maxLength ? historyIndex : historyIndex + 1
    debugInput.value = historyIndex
    debugLabel.innerHTML = historyIndex
    draw('debugCanvas', storedBestGrid.gridHistory[historyIndex].grid, {})()
  }
  subtractButton.onclick = () => {
    historyIndex = historyIndex - 1 < 0 ? historyIndex : historyIndex - 1
    debugInput.value = historyIndex
    debugLabel.innerHTML = historyIndex
    draw('debugCanvas', storedBestGrid.gridHistory[historyIndex].grid, {})()
  }

  debugInput.onchange = e => {
    debugLabel.innerHTML = e.target.value
    historyIndex = parseInt(e.target.value)
    draw('debugCanvas', storedBestGrid.gridHistory[historyIndex].grid, {})()
  }

  console.log('storedBestGrid', storedBestGrid)
  draw('debugCanvas', storedBestGrid.gridHistory[0].grid, {})()
}
