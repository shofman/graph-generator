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
// seed = 0.14268056080675628
// seed = 0.5880775834630378
// seed = 0.419515245309819 // broken generator
// seed = 0.04028745024544045 // can go further
// seed = 0.6374806211043333 // can go further
// seed = 0.6252110957528205 // can go further
// seed = 0.7315915691519606 // gated by the block - needs to have the player checked to be on the inside
// seed = 0.9514092773572342 // fake highest difficulty
// seed = 0.033812763221873876 // broken generator
// seed = 0.4002330819117046 // another one gated by the block
// seed = 0.4052290785457666 // broken 
console.log('seed', seed)
const randomizer = AleaRandomizer(seed)

const { grid, storedRoomsGrid } = createRoom(randomizer)
draw('myCanvas', grid, {})()

if (storedRoomsGrid) {
  draw('debugCanvas', storedRoomsGrid, {})()
}
