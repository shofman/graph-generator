import { hardcodedSubroomTemplates } from './subroomTemplates.js'
import { arrayCopy } from './helpers.js'
import { shuffleRooms } from './shuffleRooms.js'

const rotateBy90 = oldRoom => {
  const newRoom = []
  for (let i = 0; i < oldRoom.length; i++) {
    newRoom.push([])
  }

  oldRoom.forEach(room => {
    for (let i = 0; i < room.length; i++) {
      newRoom[i].push(room[room.length - 1 - i])
    }
  })
  return newRoom
}

const flipRoom = (room, isVertical) => {
  const newRoom = arrayCopy(room)
  return isVertical ? newRoom.reverse() : newRoom.map(row => row.reverse())
}

const rotateRoom = (oldRoom, degreesToRotate) => {
  if (degreesToRotate === 90) {
    return rotateBy90(oldRoom)
  } else if (degreesToRotate === 180) {
    return rotateBy90(rotateBy90(oldRoom))
  } else if (degreesToRotate === 270) {
    return rotateBy90(rotateBy90(rotateBy90(oldRoom)))
  }
  return oldRoom
}

export const generateListOfRooms = (shuffle = false, randomizer = {}) => {
  const roomlist = Object.keys(hardcodedSubroomTemplates)
  let allPermutationsOfRooms = []
  roomlist.forEach(roomKey => {
    const oldRoom = hardcodedSubroomTemplates[roomKey]
    allPermutationsOfRooms = allPermutationsOfRooms.concat([
      oldRoom,
      flipRoom(oldRoom, true),
      flipRoom(oldRoom),
      rotateRoom(oldRoom, 90),
      flipRoom(rotateRoom(oldRoom, 90)),
      rotateRoom(oldRoom, 180),
      rotateRoom(oldRoom, 270),
      flipRoom(rotateRoom(oldRoom, 270)),
    ])
  })

  if (shuffle) {
    return shuffleRooms(allPermutationsOfRooms, randomizer)
  }

  return allPermutationsOfRooms
}
