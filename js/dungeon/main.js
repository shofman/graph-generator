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
import { drawDungeonView } from './ui/drawDungeonView.js'

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
const {
  dungeon: newDungeonLayout,
  hasPlacedAggressiveHallways,
  hasPlacedRoomHallways,
} = layoutDungeon(dungeonVisual, result[0])

drawDungeonLayout(newDungeonLayout, document.getElementById('dungeonVisual'))
setupFirstView()

const nodes = document.querySelectorAll('tbody')
const lastTable = nodes[nodes.length - 1]
const roomsPlaced = [...lastTable.querySelectorAll('.filled')]

const roomsPlacedIgnoringHallways = roomsPlaced.filter(
  roomDisplay => !roomDisplay.innerHTML.includes('hallway')
).length
const roomsExpected = result[0].rooms.length

const doLengthsOfRoomsMatch = roomsPlacedIgnoringHallways === roomsExpected

if (!doLengthsOfRoomsMatch) {
  console.warn(
    'we did not place all the expected rooms',
    `Missing ${roomsExpected - roomsPlacedIgnoringHallways}`,
    `used aggressive hallway algorithm: ${hasPlacedAggressiveHallways}`,
    `used hallway system with multiple rooms per chunk ${hasPlacedRoomHallways}`
  )

  const arrayOfNodesPlaced = roomsPlaced
    .filter(roomDisplay => !roomDisplay.innerHTML.includes('hallway'))
    .reduce((accum, roomDisplay) => {
      const listedNodes = [...roomDisplay.querySelectorAll('li')]
      listedNodes.forEach(listElement => {
        const html = listElement.innerHTML
        accum.push(html)
      })
      return accum
    }, [])

  const arrayOfNodesThatNeedPlacing = result[0].totalRoomsAdded

  const missingNodes = []
  arrayOfNodesThatNeedPlacing.forEach(neededNode => {
    if (!arrayOfNodesPlaced.includes(neededNode)) {
      missingNodes.push(neededNode)
    }
  })
  const stringOfMissingNodes = missingNodes.join(' ')
  if (stringOfMissingNodes === '') {
    console.warn('Duplicate node was placed on the grid!')
    debugger
  } else {
    console.warn('missing the following nodes:', missingNodes.join(' '))
    debugger
  }
}

const verifyConnectedness = dungeon => {
  const hasAdjacentNeighbor = (dungeon, x, y) => {
    try {
      return dungeon[y][x] !== 0
    } catch (e) {
      return false
    }
  }

  return dungeon.every((row, rowIndex) => {
    return row.every((col, colIndex) => {
      if (col === 0) return true
      return (
        hasAdjacentNeighbor(dungeon, colIndex + 1, rowIndex) ||
        hasAdjacentNeighbor(dungeon, colIndex - 1, rowIndex) ||
        hasAdjacentNeighbor(dungeon, colIndex, rowIndex + 1) ||
        hasAdjacentNeighbor(dungeon, colIndex, rowIndex - 1)
      )
    })
  })
}

const isDungeonConnected = verifyConnectedness(newDungeonLayout)

if (!isDungeonConnected) {
  console.warn(
    'all rooms are not connected',
    `used aggressive hallway algorithm: ${hasPlacedAggressiveHallways}`,
    `used hallway system with multiple rooms per chunk ${hasPlacedRoomHallways}`
  )
  debugger
}

if (isDungeonConnected && doLengthsOfRoomsMatch) {
  drawDungeonView(result[0], newDungeonLayout)
}
