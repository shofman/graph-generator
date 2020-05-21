import { drawDungeonTree, rewind, advance } from './ui/drawGraph.js'
import { evaluateDungeon } from './evaluate/evaluateDungeon.js'
import {
  drawDungeonLayout,
  rewindDraw,
  advanceDraw,
  setupFirstView,
  stepThroughDungeon,
} from './ui/drawDungeonLayout.js'
import { layoutDungeon } from './ui/placeRooms.js'
import { verify } from './evaluate/verifyDungeon.js'

window.drawDungeonTree = drawDungeonTree
window.rewind = rewind
window.advance = advance
window.rewindDraw = rewindDraw
window.advanceDraw = advanceDraw
window.stepThroughDungeon = stepThroughDungeon
window.evaluateDungeon = evaluateDungeon
window.verify = verify

window.switchViews = () => {
  const dungeonRooms = document.getElementById('dungeonRooms')
  const dungeonVisual = document.getElementById('dungeonVisual')

  if (document.getElementById('dungeonView').checked) {
    dungeonRooms.style.display = 'block'
    dungeonVisual.style.display = 'none'
  } else {
    dungeonRooms.style.display = 'none'
    dungeonVisual.style.display = 'block'
  }
}

const result = drawDungeonTree()
evaluateDungeon()
const dungeonVisual = document.getElementById('dungeonVisual')
const newDungeonLayout = layoutDungeon(dungeonVisual, result[0])

drawDungeonLayout(newDungeonLayout, document.getElementById('dungeonVisual'))
setupFirstView()

const nodes = document.querySelectorAll('tbody')
const lastTable = nodes[nodes.length - 1]
const roomsPlaced = [...lastTable.querySelectorAll('.filled')]

const roomsPlacedIgnoringHallways = roomsPlaced.filter(
  roomDisplay => !roomDisplay.innerHTML.includes('hallway')
).length
const roomsExpected = result[0].rooms.length

if (roomsPlacedIgnoringHallways !== roomsExpected) {
  console.warn(
    'we did not place all the expected rooms',
    `Missing ${roomsExpected - roomsPlacedIgnoringHallways}`
  )
}
