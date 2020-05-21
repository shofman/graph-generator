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

const isFreeSpace = (x, y, dungeon) => {
  try {
    return dungeon[y][x] === 0 ? 1 : 0
  } catch (e) {
    return 0
  }
}

const getFreeSpacesAround = (currentPosition, dungeon) => {
  const { xPos: x, yPos: y } = currentPosition
  return (
    isFreeSpace(x, y + 1, dungeon) +
    isFreeSpace(x, y - 1, dungeon) +
    isFreeSpace(x - 1, y, dungeon) +
    isFreeSpace(x + 1, y, dungeon)
  )
}

const createHallway = (parent, children) => ({
  indexId: -1,
  nodesInRoom: [{ name: 'hallway' }],
  parentNode: parent,
  roomName: 'hallway',
  children,
})

// Directions methods
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

const getDirections = (index, randomizer) => {
  if (index === 0 || index > Object.keys(directionToRoomLookup).length) {
    return []
  }
  return shuffleList(arrayCopy(directionToRoomLookup[index]), randomizer)
}

const createPlaceRooms = (rooms, randomizer) => {
  // Placement methods
  const createHallwayRooms = (chunkedRooms, dungeon, currentPosition, gridDimensions, depth) => {
    let chunkedRoomIndex = 0
    let tempDungeon = dungeon
    const hallwayDirections = shuffleList(Object.values(directions), randomizer)
    let numberOfHallwaysPlaced = 0

    const freeSpacesAround = getFreeSpacesAround(currentPosition, dungeon)
    if (freeSpacesAround < chunkedRooms.length) {
      if (freeSpacesAround === 0) return { isSuccessful: false, storedDungeon: dungeon }
      debugger
    }

    while (chunkedRoomIndex < chunkedRooms.length && hallwayDirections.length) {
      const hallwayDirection = hallwayDirections.shift()
      if (canPlaceRoom(tempDungeon, currentPosition, hallwayDirection, gridDimensions)) {
        numberOfHallwaysPlaced++
        const { x: hallX, y: hallY } = getNewPosition(currentPosition, hallwayDirection)
        const hallwayDungeon = circularArrayCopy(tempDungeon)
        const currentChunk = chunkedRooms[chunkedRoomIndex]
        hallwayDungeon[hallY][hallX] = createHallway(currentChunk[0].parentNode, currentChunk)

        const newDirections = getDirections(currentChunk.length, randomizer)

        const result = placeRooms(
          currentChunk,
          newDirections,
          hallwayDungeon,
          { xPos: hallX, yPos: hallY },
          gridDimensions,
          depth + 1
        )

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

  const placeRooms = (
    roomsToAdd,
    arrayOfDirectionsToConsider,
    dungeon,
    currentPosition,
    gridDimensions,
    depth
  ) => {
    if (roomsToAdd.length === 0) return { isSuccessful: true, storedDungeon: dungeon }

    if (roomsToAdd.length > 3) {
      const chunkedRooms = randChunkSplit(randomizer, roomsToAdd, 1, 2)
      return createHallwayRooms(chunkedRooms, dungeon, currentPosition, gridDimensions, depth)
    }

    if (getFreeSpacesAround(currentPosition, dungeon) < roomsToAdd.length) {
      return createHallwayRooms([roomsToAdd], dungeon, currentPosition, gridDimensions, depth)
    }

    // const arrayOfDirectionsToConsider = getDirections(roomsToAdd.length, randomizer)

    let storedDungeon = dungeon

    let hasAllPlacedSuccess = false

    let directionIndex = 0
    while (directionIndex < arrayOfDirectionsToConsider.length && !hasAllPlacedSuccess) {
      const directions = arrayOfDirectionsToConsider[directionIndex]

      const canPlaceAllRooms = roomsToAdd.every((room, index) => {
        const currentDirection = directions[index]
        return canPlaceRoom(storedDungeon, currentPosition, currentDirection, gridDimensions)
      })

      if (canPlaceAllRooms) {
        const roomsToAddNext = []
        roomsToAdd.forEach((currentRoom, index) => {
          const currentDirection = directions[index]
          const { x: xPos, y: yPos } = getNewPosition(currentPosition, currentDirection)
          storedDungeon[yPos][xPos] = currentRoom

          const newRoomsToAdd = []
          currentRoom.nodesInRoom.forEach(addChildrenNodesToRoomsToAdd(rooms, newRoomsToAdd))
          const newDirections = getDirections(newRoomsToAdd.length, randomizer)

          roomsToAddNext.push({
            roomsToAdd: newRoomsToAdd,
            position: { xPos, yPos },
            directions: newDirections,
          })
        })

        const placeRooms = createPlaceRooms(rooms, randomizer)
        drawDungeonLayout(storedDungeon, document.getElementById('dungeonVisual'), true)
        // debugger

        if (directionIndex === 5) {
          // debugger
        }
        const subRoomsPlacedSuccessfully = roomsToAddNext.every(nextRoom => {
          const newDungeon = circularArrayCopy(storedDungeon)
          const result = placeRooms(
            nextRoom.roomsToAdd,
            nextRoom.directions,
            newDungeon,
            nextRoom.position,
            gridDimensions,
            depth + 1
          )

          if (directionIndex === 5) {
            // debugger
          }

          if (result.isSuccessful) {
            storedDungeon = result.storedDungeon
          }
          return result.isSuccessful
        })
        if (directionIndex === 5) {
          // debugger
        }

        hasAllPlacedSuccess = subRoomsPlacedSuccessfully
      }

      if (!hasAllPlacedSuccess) {
        directionIndex++
        storedDungeon = dungeon
        drawDungeonLayout(storedDungeon, document.getElementById('dungeonVisual'), true)
        // debugger
      }
    }

    return { isSuccessful: hasAllPlacedSuccess, storedDungeon }
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

  const placeRooms = createPlaceRooms(rooms, randomizer)

  const currentPosition = {
    xPos: startingRoomX,
    yPos: startingRoomY,
  }

  const directions = getDirections(shuffledRoomsToAdd.length, randChunkSplit)

  const success = placeRooms(
    shuffledRoomsToAdd,
    directions,
    dungeon,
    currentPosition,
    gridDimensions,
    0
  )
  console.log('success', success)
  return success.storedDungeon
}
