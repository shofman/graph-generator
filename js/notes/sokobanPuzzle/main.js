import { getCanvasWidth, getCanvasHeight } from './gridDimensions.js'
import { AleaRandomizer } from './AleaRandomizer.js'
import { createRoom } from './createRoom.js'
import { draw } from './draw.js'

const canvas = document.getElementById('myCanvas')
canvas.height = getCanvasHeight()
canvas.width = getCanvasWidth()

const seed =  0.6751776450335498//Math.random()
console.log('seed', seed)
const randomizer = AleaRandomizer(seed)

let initialGrid = createRoom(randomizer)
draw(initialGrid, {})()
