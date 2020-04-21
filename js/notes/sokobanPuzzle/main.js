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
// seed =  0.34602003720192265 // good diff
// seed = 0.6705667699235995
// seed = 0.5324721975384277
// seed = 0.0020633618481573635
// seed = 0.17686642682062592 // too easy
// seed = 0.04028745024544045 // can go further
// seed = 0.6374806211043333 // can go further
// seed = 0.6252110957528205 // can go further
// seed = 0.033812763221873876 // good diffculty
// seed = 0.48370146363728916 // just a bad seed 
// seed = 0.9778432610761867 // vertical difference - also fake highest difficulty
// seed = 0.08922083204081921 // horizontal difference
// seed = 0.4052290785457666 // broken 
// seed = 0.022411362391700607 // impossible to solve?
// seed = 0.5782616717267648 // wat?
// seed = 0.1438983793267321 // good difficulty
// seed = 0.8786905198435171 // impossible to solve - easier to fix?
console.log('seed', seed)
const randomizer = AleaRandomizer(seed)

const { grid, storedRoomsGrid } = createRoom(randomizer)
draw('myCanvas', grid, {})()

if (storedRoomsGrid) {
  draw('debugCanvas', storedRoomsGrid, {})()
}
