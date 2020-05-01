import { drawDungeonTree, rewind, advance } from './ui/drawGraph.js'
import { evaluateDungeon } from './evaluate/evaluateDungeon.js'
import { drawDungeon } from './ui/drawDungeon.js'
import { verify } from './evaluate/verifyDungeon.js'

window.drawDungeonTree = drawDungeonTree
window.rewind = rewind
window.advance = advance
window.evaluateDungeon = evaluateDungeon
window.verify = verify

window.switchViews = () => {
  console.log('i am here')
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
drawDungeon(document.getElementById('dungeonVisual'), result[0])
