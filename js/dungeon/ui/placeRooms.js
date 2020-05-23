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

const getFreeSpacesAroundArray = (arrayOfPositions, dungeon) => {
  const seenPoints = []
  let total = 0
  arrayOfPositions.forEach(position => {
    const { xPos: x, yPos: y } = position
    const newPoints = [{ x, y: y + 1 }, { x, y: y - 1 }, { x: x - 1, y }, { x: x + 1, y }]
    newPoints.forEach(direction => {
      const isFree = isFreeSpace(direction.x, direction.y, dungeon)
      if (isFree) {
        if (!seenPoints.includes(JSON.stringify(direction))) {
          seenPoints.push(JSON.stringify(direction))
          total += 1
        }
      }
    })
  })

  return seenPoints
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

let placeRoomCounter = 0
let drawHistory = true

const createPlaceRooms = (rooms, randomizer) => {
  // Placement methods

  const placeHallway = (dungeon, currentPosition, currentChunk, gridDimensions) => {
    let hasPlacedHallway = false
    let newHallwayPosition = undefined
    const hallwayDirections = shuffleList(Object.values(directions), randomizer)

    while (!hasPlacedHallway && hallwayDirections.length) {
      const hallwayDirection = hallwayDirections.shift()

      // Check to see if we can place a hallway
      if (canPlaceRoom(dungeon, currentPosition, hallwayDirection, gridDimensions)) {
        hasPlacedHallway = true
        const { x: hallX, y: hallY } = getNewPosition(currentPosition, hallwayDirection)
        dungeon[hallY][hallX] = createHallway(currentChunk.parentNode, currentChunk)
        if (drawHistory) {
          drawDungeonLayout(dungeon, document.getElementById('dungeonVisual'), true)
        }
        newHallwayPosition = { xPos: hallX, yPos: hallY }
      }
    }

    return {
      dungeon,
      hasPlacedHallway,
      newHallwayPosition,
    }
  }

  const createHallways = (chunkedRoomsToAdd, dungeon, currentPosition, gridDimensions, depth) => {
    const freeSpacesAroundCurrentPos = getFreeSpacesAround(currentPosition, dungeon)
    if (freeSpacesAroundCurrentPos === 0) return { isSuccessful: false, storedDungeon: dungeon }

    // Attempt to place a single hallway
    let tempDungeon = circularArrayCopy(dungeon)
    let chunkedRoomIndex = 0

    let { hasPlacedHallway, newHallwayPosition, dungeon: hallwayDungeon } = placeHallway(
      tempDungeon,
      currentPosition,
      dungeon[currentPosition.yPos][currentPosition.xPos],
      gridDimensions
    )
    if (!hasPlacedHallway) {
      return { isSuccessful: false, storedDungeon: dungeon }
    }
    tempDungeon = hallwayDungeon
    let listOfAddedHallwayPositions = [newHallwayPosition]

    // Check to see how we can place - do we have enough space to place the remaining chunks, or do we need more?
    let freeSpacesAroundHallway = getFreeSpacesAround(newHallwayPosition, tempDungeon)
    if (freeSpacesAroundHallway < chunkedRoomsToAdd.length) {
      if (freeSpacesAroundHallway === 0) {
        return { isSuccessful: false, storedDungeon: dungeon }
      } else if (freeSpacesAroundHallway === 1) {
        return createHallways(chunkedRoomsToAdd, dungeon, newHallwayPosition, gridDimensions, depth)
      } else {
        // Calculate how much minimum free space we need to place all the rooms
        let freeSpaceNeededFromChunks = chunkedRoomsToAdd.reduce(
          (accum, current) => accum + current.length,
          0
        )

        while (freeSpaceNeededFromChunks > freeSpacesAroundHallway) {
          const newPlacement = placeHallway(
            tempDungeon,
            newHallwayPosition,
            dungeon[newHallwayPosition.yPos][newHallwayPosition.xPos],
            gridDimensions
          )

          if (newPlacement.hasPlacedHallway) {
            tempDungeon = newPlacement.dungeon
            newHallwayPosition = newPlacement.newHallwayPosition
            listOfAddedHallwayPositions.push(newHallwayPosition)
            freeSpacesAroundHallway = getFreeSpacesAroundArray(
              listOfAddedHallwayPositions,
              tempDungeon
            ).length
          } else {
            return { isSuccessful: false, storedDungeon: dungeon }
          }
        }

        let dungeonWithNecessaryHallways = circularArrayCopy(tempDungeon)

        const freeSpaces = shuffleList(
          getFreeSpacesAroundArray(listOfAddedHallwayPositions, dungeonWithNecessaryHallways).map(
            JSON.parse
          ),
          randomizer
        )

        const roomsToAddNext = []
        chunkedRoomsToAdd.forEach((chunkedRoomArray, index) => {
          // Stored as an array here (from legacy decision to store as chunks)
          // Possibly revisit this later
          const currentChunkedRoom = chunkedRoomArray[0]
          const freeSpace = freeSpaces[index]
          dungeonWithNecessaryHallways[freeSpace.y][freeSpace.x] = currentChunkedRoom

          const newRoomsToAdd = []
          currentChunkedRoom.nodesInRoom.forEach(addChildrenNodesToRoomsToAdd(rooms, newRoomsToAdd))
          const newDirections = getDirections(newRoomsToAdd.length, randomizer)

          roomsToAddNext.push({
            roomsToAdd: newRoomsToAdd,
            position: { xPos: freeSpace.x, yPos: freeSpace.y },
            directions: newDirections,
            directionIndex: 0,
            directionMax: newDirections.length,
          })
        })

        if (drawHistory) {
          drawDungeonLayout(
            dungeonWithNecessaryHallways,
            document.getElementById('dungeonVisual'),
            true
          )
        }

        let isValid = true
        let isFinishedPlacing = false
        let failingIndex = -1

        while (!isFinishedPlacing) {
          roomsToAddNext.forEach((nextRoom, index) => {
            if (!isValid) return
            const newDungeon = circularArrayCopy(dungeonWithNecessaryHallways)
            const result = placeRooms(
              nextRoom.roomsToAdd,
              nextRoom.directions.slice(nextRoom.directionIndex, nextRoom.directionMax),
              newDungeon,
              nextRoom.position,
              gridDimensions,
              depth + 1
            )

            if (result.isSuccessful) {
              dungeonWithNecessaryHallways = result.storedDungeon
            } else {
              failingIndex = index
              isValid = false
            }
          })

          if (!isValid) {
            const lastSuccessfulRoomPlaced = roomsToAddNext[failingIndex - 1]
            if (
              !lastSuccessfulRoomPlaced ||
              lastSuccessfulRoomPlaced.directionIndex + 1 > roomsToAddNext.length
            ) {
              isFinishedPlacing = true
            } else {
              // Ignore the direction that caused the failed placement from before
              lastSuccessfulRoomPlaced.directionIndex = lastSuccessfulRoomPlaced.directionIndex + 1

              // Reset all indices for other entries back to zero
              // (to ensure we reconsider directions that have been discarded)
              for (let i = failingIndex; i < roomsToAddNext.length; i++) {
                roomsToAddNext[i].directionIndex = 0
              }
              isValid = true
              dungeonWithNecessaryHallways = circularArrayCopy(tempDungeon)
            }
          } else {
            isFinishedPlacing = true
          }
        }

        if (isValid) {
          return { isSuccessful: true, storedDungeon: dungeonWithNecessaryHallways }
        }

        return { isSuccessful: false, storedDungeon: dungeon }
      }
    } else {
      while (chunkedRoomIndex < chunkedRoomsToAdd.length) {
        const currentChunk = chunkedRoomsToAdd[chunkedRoomIndex]
        const newDirections = getDirections(currentChunk.length, randomizer)
        const result = placeRooms(
          currentChunk,
          newDirections,
          tempDungeon,
          newHallwayPosition,
          gridDimensions,
          depth + 1
        )

        if (!result.isSuccessful) {
          return { isSuccessful: false, storedDungeon: dungeon }
        } else {
          tempDungeon = result.storedDungeon
          chunkedRoomIndex++
        }
      }
      return { isSuccessful: true, storedDungeon: tempDungeon }
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
    placeRoomCounter++
    if (roomsToAdd.length === 0) return { isSuccessful: true, storedDungeon: dungeon }

    if (roomsToAdd.length > 3) {
      const chunkedRooms = randChunkSplit(randomizer, roomsToAdd, 1, 1)
      return createHallways(chunkedRooms, dungeon, currentPosition, gridDimensions, depth)
    }

    if (getFreeSpacesAround(currentPosition, dungeon) < roomsToAdd.length) {
      return createHallways([roomsToAdd], dungeon, currentPosition, gridDimensions, depth)
    }

    let storedDungeon = circularArrayCopy(dungeon)

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
            directionIndex: 0,
            directionMax: newDirections.length,
          })
        })

        if (drawHistory) {
          drawDungeonLayout(storedDungeon, document.getElementById('dungeonVisual'), true)
        }
        // debugger

        let failingIndex = -1
        let isValid = true
        let isFinishedPlacing = false

        while (!isFinishedPlacing) {
          roomsToAddNext.forEach((nextRoom, index) => {
            if (!isValid) return
            const newDungeon = circularArrayCopy(storedDungeon)
            const result = placeRooms(
              nextRoom.roomsToAdd,
              nextRoom.directions.slice(nextRoom.directionIndex, nextRoom.directionMax),
              newDungeon,
              nextRoom.position,
              gridDimensions,
              depth + 1
            )

            if (result.isSuccessful) {
              storedDungeon = result.storedDungeon
            } else {
              failingIndex = index
              isValid = false
            }
          })

          if (!isValid) {
            const lastSuccessfulRoomPlaced = roomsToAddNext[failingIndex - 1]
            if (
              !lastSuccessfulRoomPlaced ||
              lastSuccessfulRoomPlaced.directionIndex + 1 > roomsToAddNext.length
            ) {
              isFinishedPlacing = true
            } else {
              // Ignore the direction that caused the failed placement from before
              lastSuccessfulRoomPlaced.directionIndex = lastSuccessfulRoomPlaced.directionIndex + 1

              // Reset all indices for other entries back to zero
              // (to ensure we reconsider directions that have been discarded)
              for (let i = failingIndex; i < roomsToAddNext.length; i++) {
                roomsToAddNext[i].directionIndex = 0
              }
              isValid = true
              storedDungeon = circularArrayCopy(dungeon)
            }
          } else {
            isFinishedPlacing = true
          }
        }

        hasAllPlacedSuccess = isValid
      }

      if (!hasAllPlacedSuccess) {
        directionIndex++
        storedDungeon = circularArrayCopy(dungeon)
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

  const directions = getDirections(shuffledRoomsToAdd.length, randomizer)

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
