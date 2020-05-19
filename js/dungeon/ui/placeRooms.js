import { shuffleList } from '../../utils/shuffleList.js'
import { getRandomIntInclusive } from '../utils/getRandomIntInclusive.js'
import { drawDungeonLayout } from '../ui/drawDungeonLayout.js'
import { circularArrayCopy, arrayCopy } from '../../utils/arrayCopy.js'
import { randChunkSplit } from '../utils/randChunkSplit.js'
import { getAllPermutations } from '../utils/getAllPermutations.js'

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

const getNewPosition = (currentPosition, currentDirection) => {
  const { xPos, yPos } = currentPosition
  const { x, y } = currentDirection

  return { x: x + xPos, y: y + yPos }
}

const canPlaceRoom = (dungeon, currentPosition, currentDirection, gridDimensions) => {
  const { x: newPosX, y: newPosY } = getNewPosition(currentPosition, currentDirection)

  if (newPosX > gridDimensions.width - 1) return false
  if (newPosY > gridDimensions.height - 1) return false
  if (newPosX < 0) return false
  if (newPosY < 0) return false

  return dungeon[newPosY][newPosX] === 0
}

const addChildrenNodesToRoomsToAdd = (rooms, roomsToAdd) => node => {
  const children = node.children
  if (!children) return
  children
    .filter(child => {
      const correspondingRoom = findRoomForNode(rooms, child)
      const currentRoom = findRoomForNode(rooms, node)
      return correspondingRoom !== currentRoom
    })
    .forEach(child => {
      const correspondingRoom = findRoomForNode(rooms, child)
      if (!roomsToAdd.includes(correspondingRoom)) {
        roomsToAdd.push(correspondingRoom)
      }
    })
}

const createHallway = () => ({
  indexId: -1,
  nodesInRoom: [{ name: 'hallway' }],
  parentNode: undefined,
})

// solve(game):
//     if (game board is full)
//         return SUCCESS
//     else
//         next_square = getNextEmptySquare()
//         for each value that can legally be put in next_square
//             put value in next_square (i.e. modify game state)
//             if (solve(game)) return SUCCESS
//             remove value from next_square (i.e. backtrack to a previous state)
//     return FAILURE

const createPlaceRooms = (rooms, randomizer) => {
  const createHallwayRooms = (chunkedRooms, dungeon, currentPosition, gridDimensions, depth) => {
    // drawDungeonLayout(dungeon, document.getElementById('dungeonVisual'), true)
    // debugger

    let chunkedRoomIndex = 0
    let tempDungeon = dungeon
    const hallwayDirections = shuffleList(Object.values(directions), randomizer)
    let numberOfHallwaysPlaced = 0

    while (chunkedRoomIndex < chunkedRooms.length && hallwayDirections.length) {
      const hallwayDirection = hallwayDirections.shift()
      if (canPlaceRoom(tempDungeon, currentPosition, hallwayDirection, gridDimensions)) {
        numberOfHallwaysPlaced++
        const { x: hallX, y: hallY } = getNewPosition(currentPosition, hallwayDirection)
        const hallwayDungeon = circularArrayCopy(tempDungeon)
        hallwayDungeon[hallY][hallX] = createHallway()
        const result = placeRooms(
          chunkedRooms[chunkedRoomIndex],
          hallwayDungeon,
          { xPos: hallX, yPos: hallY },
          gridDimensions,
          depth + 1
        )
        drawDungeonLayout(hallwayDungeon, document.getElementById('dungeonVisual'), true)

        if (result.isSuccessful) {
          tempDungeon = result.storedDungeon
          chunkedRoomIndex++
        }
      }
    }

    return {
      isSuccessful: numberOfHallwaysPlaced === chunkedRooms.length,
      storedDungeon: tempDungeon,
    }
  }

  const createLookup = size => (accumulator, arrayOfDirections) => {
    const truncatedDirections = arrayOfDirections.slice(0, size)
    const key = JSON.stringify(truncatedDirections)
    if (!accumulator[key]) {
      accumulator[key] = true
      accumulator.result.push(truncatedDirections)
    }
    return accumulator
  }

  const allDirections = getAllPermutations(Object.values(directions))
  const directionToRoomLookup = {
    [1]: allDirections.reduce(createLookup(1), { result: [] }).result,
    [2]: allDirections.reduce(createLookup(2), { result: [] }).result,
    [3]: allDirections.reduce(createLookup(3), { result: [] }).result,
  }

  const placeRooms = (roomsToAdd, dungeon, currentPosition, gridDimensions, depth) => {
    if (roomsToAdd.length === 0) return { isSuccessful: true, storedDungeon: dungeon }
    console.log('roomsToAdd', roomsToAdd)

    let roomIndex = 0
    let directionIndex = 0

    let storedDungeon = dungeon

    if (roomsToAdd.length > 3) {
      const chunkedRooms = randChunkSplit(randomizer, roomsToAdd, 1, 2)
      return createHallwayRooms(chunkedRooms, dungeon, currentPosition, gridDimensions, depth)
    }
    const arrayOfDirectionsToConsider = shuffleList(
      arrayCopy(directionToRoomLookup[roomsToAdd.length]),
      randomizer
    )
    console.log('arrayOfDirectionsToConsider', arrayOfDirectionsToConsider)
    let hasPlaced = false

    while (roomIndex < roomsToAdd.length && directionIndex < arrayOfDirectionsToConsider.length) {
      const shuffledDirections = arrayCopy(arrayOfDirectionsToConsider[directionIndex])

      while (shuffledDirections.length) {
        const currentDirection = shuffledDirections.shift()
        if (
          canPlaceRoom(storedDungeon, currentPosition, currentDirection, gridDimensions) &&
          roomIndex < roomsToAdd.length
        ) {
          const currentRoom = roomsToAdd[roomIndex]
          const currentName = currentRoom.roomName
          console.log('currentRoom', currentRoom)
          const { x: xPos, y: yPos } = getNewPosition(currentPosition, currentDirection)
          const newDungeon = circularArrayCopy(storedDungeon)
          newDungeon[yPos][xPos] = currentRoom
          // drawDungeonLayout(newDungeon, document.getElementById('dungeonVisual'), true)
          // debugger

          const newRoomsToAdd = []
          currentRoom.nodesInRoom.forEach(addChildrenNodesToRoomsToAdd(rooms, newRoomsToAdd))
          const placeRooms = createPlaceRooms(rooms, randomizer)
          const newPosition = { xPos, yPos }
          const result = placeRooms(
            newRoomsToAdd,
            newDungeon,
            newPosition,
            gridDimensions,
            depth + 1
          )
          hasPlaced = result.isSuccessful
          if (result.isSuccessful) {
            // debugger
            storedDungeon = result.storedDungeon
            roomIndex++
          } else {
            console.log('newRoomsToAdd', newRoomsToAdd)
            // debugger
            storedDungeon = dungeon
            directionIndex++
            roomIndex = 0
          }
        } else {
          hasPlaced = false
          directionIndex++
          roomIndex = 0
          storedDungeon = dungeon
        }
      }
      const numberOfRoomsPlaced = roomIndex
      if (roomsToAdd.length !== numberOfRoomsPlaced && hasPlaced) {
        hasPlaced = false
        directionIndex++
        roomIndex = 0
        storedDungeon = dungeon
      } else {
        // debugger
      }
    }
    if (!hasPlaced) {
      // debugger
      return { isSuccessful: false, storedDungeon: storedDungeon || dungeon }
    }
    return { isSuccessful: true, storedDungeon: storedDungeon || dungeon }
  }

  return placeRooms
}

export const layoutDungeon = (canvas, dungeonToDraw) => {
  const { rooms, randomizer } = dungeonToDraw

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

  dungeon[startingRoomY][startingRoomX] = startingNode

  const roomsToAdd = []
  startingNode.nodesInRoom.forEach(addChildrenNodesToRoomsToAdd(rooms, roomsToAdd))

  const shuffledRoomsToAdd = shuffleList(roomsToAdd, randomizer)

  console.log('shuffledRoomsToAdd', shuffledRoomsToAdd)

  const placeRooms = createPlaceRooms(rooms, randomizer)

  const firstState = createState({
    xPos: startingRoomX,
    yPos: startingRoomY,
    gridHistory: [],
    grid: dungeon,
    roomsToPlace: roomsToAdd,
    roomHistory: [],
  })

  const success = placeRooms(
    shuffledRoomsToAdd,
    dungeon,
    firstState.currentPosition,
    gridDimensions,
    0
  )
  console.log('success', success)
  return dungeon
}
