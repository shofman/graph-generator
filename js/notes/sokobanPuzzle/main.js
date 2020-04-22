import { getCanvasWidth, getCanvasHeight } from './gridDimensions.js'
import { AleaRandomizer } from './AleaRandomizer.js'
// import { createRoom } from './createRoom.js'
import { createRoom } from './createRoom2.js'
import { draw } from './draw.js'

const canvas = document.getElementById('myCanvas')
canvas.height = getCanvasHeight()
canvas.width = getCanvasWidth()

const debugCanvas = document.getElementById('debugCanvas')
debugCanvas.height = getCanvasHeight()
debugCanvas.width = getCanvasWidth()

let seed = Math.random()

console.log('seed', seed)
const randomizer = AleaRandomizer(seed)

const { grid, storedRoomsGrid } = createRoom(randomizer)
draw('myCanvas', grid, {})()

if (storedRoomsGrid) {
  draw('debugCanvas', storedRoomsGrid, {})()
}
