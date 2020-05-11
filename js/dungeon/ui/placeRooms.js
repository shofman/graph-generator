import { shuffleList } from '../../utils/shuffleList.js'
import { getRandomIntInclusive } from '../utils/getRandomIntInclusive.js'

const createLabelForRoom = (xPos, yPos, listOfNames) => {
  return {
    xPos,
    yPos,
    listOfNames,
  }
}

const findRoomForNode = (rooms, child) => {
  let foundRoom
  rooms.forEach(room => {
    if (room.nodesInRoom.includes(child)) {
      foundRoom = room
      return foundRoom
    }
  })
  return foundRoom
}

const directions = {
  north: { x: 0, y: -1 },
  south: { x: 0, y: 1 },
  east: { x: 1, y: 0 },
  west: { x: -1, y: 0 },
}

// What to do I need

// Current position within the grid
// Grid history
// Placement history (list of rooms placed)
// List of rooms to still place
// Current grid

const createState = ({ xPos, yPos, gridHistory, roomHistory, roomsToPlace, grid }) => {
  const currentPosition = { xPos, yPos }
  return {
    currentPosition,
    gridHistory,
    grid,
    roomHistory,
    roomsToPlace,
  }
}

const canPlaceRoom = (currentPosition, currentDirection, gridDimensions) => {
  const { xPos, yPos } = currentPosition
  const { x, y } = currentDirection

  console.log('xPos, x, yPos, y, gridDimensions', xPos, x, yPos, y, gridDimensions)
  if (xPos + x > gridDimensions.width - 1) return false
  if (yPos + y > gridDimensions.height - 1) return false
  if (xPos + x < 0) return false
  if (yPos + y < 0) return false
  return true
}

export const layoutDungeon = (canvas, dungeonToDraw) => {
  const ctx = canvas.getContext('2d')
  const { rooms, randomizer } = dungeonToDraw

  console.log('randomizer', randomizer)

  // Set grid to be rooms.length ^ 2, to ensure we have enough space to place all
  const layoutWidth = rooms.length
  const layoutHeight = rooms.length

  const gridDimensions = {
    height: layoutHeight,
    width: layoutWidth,
  }

  const dungeon = []
  for (let i = 0; i < layoutHeight; i++) {
    let arr = []
    arr.length = layoutWidth
    arr.fill(0)
    dungeon.push(arr)
  }

  const startingNode = rooms.filter(room => room.isFirstRoom)[0]
  const startingRoomX = Math.floor(layoutWidth / 2)
  const startingRoomY = layoutHeight - 1

  dungeon[startingRoomY][startingRoomX] = startingNode.nodesInRoom.filter(
    node => !node.parent
  )[0].name

  console.log('dungeon', dungeon)

  const roomsToAdd = []
  startingNode.nodesInRoom.forEach(node => {
    const children = node.children
    children
      .filter(child => !startingNode.nodesInRoom.includes(child))
      .forEach(child => {
        const correspondingRoom = findRoomForNode(rooms, child)
        if (!roomsToAdd.includes(correspondingRoom)) {
          roomsToAdd.push(correspondingRoom)
        }
      })
  })

  const firstState = createState({
    xPos: startingRoomX,
    yPos: startingRoomY,
    gridHistory: [],
    grid: dungeon,
    roomsToPlace: roomsToAdd,
    roomHistory: [],
  })

  if (roomsToAdd.length > 3) {
    // Create hallway
  } else {
    console.log('randomizer', randomizer)
    if (randomizer() < 100) {
      const shuffledRoomsToAdd = shuffleList(roomsToAdd, randomizer)

      const shuffledDirections = shuffleList(Object.values(directions), randomizer)
      console.log('shuffledDirections', shuffledDirections)
      console.log('shuffledRoomsToAdd', shuffledRoomsToAdd)

      const currentDirection = shuffledDirections[3] // .shift()
      const currentRoom = shuffledRoomsToAdd.shift()
      console.log('currentDirection', currentDirection)
      if (canPlaceRoom(firstState.currentPosition, currentDirection, gridDimensions)) {
        console.log('we can place')
      }
    } else {
      // TODO - figure out probs of adding hallway here
    }
  }

  console.log('roomsToAdd', roomsToAdd)
}

export const drawDungeonFromRooms = (canvas, dungeonToDraw) => {
  const ctx = canvas.getContext('2d')

  const { rooms, randomizer } = dungeonToDraw

  // Calculate max size that, if we took all the max room widths
  // and sent all the rooms to draw in that direction, that would be zero from our starting point
  const DUNGEON_WIDTH = 120
  const DUNGEON_HEIGHT = 120

  let dungeon = []
  for (let i = 0; i < DUNGEON_HEIGHT; i++) {
    let setToOne = i === 0 || i === DUNGEON_HEIGHT - 1
    dungeon.push(
      Array.apply(null, Array(DUNGEON_WIDTH)).map((j, index) => {
        return index === 0 || index === DUNGEON_WIDTH - 1 || setToOne ? 1 : 0
      })
    )
  }

  const newRoomWidth = getRandomIntInclusive(randomizer, 15, 35)
  const newRoomHeight = getRandomIntInclusive(randomizer, 15, 35)

  const startingRoomX = Math.floor(DUNGEON_WIDTH / 2) - Math.floor(newRoomWidth / 2)
  const startingRoomY = DUNGEON_HEIGHT - newRoomHeight

  for (let row = 0; row < newRoomHeight; row++) {
    for (let col = 0; col < newRoomWidth; col++) {
      dungeon[row + startingRoomY][col + startingRoomX] = 1
    }
  }

  const dungeonLabels = []
  const startingNode = rooms.filter(room => room.isFirstRoom)[0]
  const startingLabel = createLabelForRoom(
    startingRoomX,
    startingRoomY,
    startingNode.nodesInRoom.map(node => node.name)
  )

  dungeonLabels.push(startingLabel)

  const roomsAdded = []

  const roomsToAdd = []
  startingNode.nodesInRoom.forEach(node => {
    const children = node.children
    children
      .filter(child => !startingNode.nodesInRoom.includes(child))
      .forEach(child => {
        const correspondingRoom = findRoomForNode(rooms, child)
        if (!roomsToAdd.includes(correspondingRoom)) {
          roomsToAdd.push(correspondingRoom)
        }
      })
  })

  // TODO - attempt to force layout grid.
  // Ignore random widths / heights - separate visual component from underlying logic
  // First check that the room positionings can work via brute force
  // Attempt the 3 next positions
  // If there is ever a failure state where none of the room sizes work, insert a 'hallway node' and check again.
  // Once we have a static grid of interlocking pieces, then we can convert that into a visual representation
  const shuffledRoomsToAdd = shuffleList(roomsToAdd, randomizer)

  let hasRoomsToAdd = shuffledRoomsToAdd.length
  // while (hasRoomsToAdd) {
  //   const currentRoom = shuffledRoomsToAdd.shift()
  //   roomsAdded.push(currentRoom)

  //   const roomWidth = getRandomIntInclusive(randomizer, 15, 35)
  //   const roomHeight = getRandomIntInclusive(randomizer, 15, 35)

  //   const RoomX = Math.floor(DUNGEON_WIDTH / 2) - Math.floor(newRoomWidth / 2)
  //   const startingRoomY = DUNGEON_HEIGHT - newRoomHeight

  //   for (let row = 0; row < newRoomHeight; row++) {
  //     for (let col = 0; col < newRoomWidth; col++) {
  //       dungeon[row + startingRoomY][col + startingRoomX] = 1
  //     }
  //   }
  // }

  console.log('roomsToAdd', shuffledRoomsToAdd)

  dungeon.forEach((row, yIndex) => {
    row.forEach((point, xIndex) => {
      if (point === 1) {
        ctx.fillStyle = '#666666'
      } else {
        ctx.fillStyle = '#FFFFFF'
      }
      ctx.fillRect(xIndex * 4, yIndex * 4, 4, 4)
    })
  })
  ctx.stroke()

  dungeonLabels.forEach(label => {
    const baseX = label.xPos
    const baseY = label.yPos
    const GAP = 14

    const getBackgroundLength = word => {
      if (word.length <= 5) {
        return 30
      } else if (word.length <= 10) {
        return 50
      } else if (word.length <= 15) {
        return 60
      } else if (word.length <= 20) {
        return 90
      }
    }

    label.listOfNames.forEach((name, index) => {
      const startingX = baseX * 4
      const startingY = baseY * 4 + GAP * index
      ctx.fillStyle = 'black'
      ctx.fillRect(startingX, startingY, getBackgroundLength(name), 20)
      ctx.fillStyle = 'orange'
      ctx.font = '10px Comic Sans MS'
      ctx.fillText(name, startingX + 4, startingY + GAP)
      ctx.stroke()
    })
  })
}
