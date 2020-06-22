import { shuffleList } from '../../utils/shuffleList.js'
import { drawDungeonLayout } from '../ui/drawDungeonLayout.js'
import { circularArrayCopy, arrayCopy } from '../../utils/arrayCopy.js'
import { randChunkSplit } from '../utils/randChunkSplit.js'
import { getAllPermutations } from '../utils/getAllPermutations.js'

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
  arrayOfPositions.forEach(position => {
    const { xPos: x, yPos: y } = position
    const newPoints = [{ x, y: y + 1 }, { x, y: y - 1 }, { x: x - 1, y }, { x: x + 1, y }]
    newPoints.forEach(direction => {
      const isFree = isFreeSpace(direction.x, direction.y, dungeon)
      if (isFree) {
        if (!seenPoints.includes(JSON.stringify(direction))) {
          seenPoints.push(JSON.stringify(direction))
        }
      }
    })
  })

  return seenPoints
}

const convertPermutationListToHammingString = permutation => {
  return permutation.map(item => {
    const xCoord = item.x < 10 ? `0${item.x}` : `${item.x}`
    const yCoord = item.y < 10 ? `0${item.y}` : `${item.y}`
    return xCoord + ' ' + yCoord
  })
}

const computeHammingDistance = (arrayOne, arrayTwo) => {
  if (arrayOne.length !== arrayTwo.length) return -1
  let score = 0
  arrayOne.forEach((value, index) => {
    if (arrayOne[index] !== arrayTwo[index]) {
      score++
    }
  })
  return score
}

const getPermutationsBasedOnHammingDistance = (
  permutations,
  numberOfGates,
  basePermutation,
  randomizer
) => {
  let basePermutationString = convertPermutationListToHammingString(basePermutation)
  const permutationsToConsider = []

  const resultsToReturn = numberOfGates * 2

  let hasEnough = false
  permutations.forEach(permutation => {
    if (hasEnough) return
    const currentPermutationString = convertPermutationListToHammingString(permutation)
    const differenceFromBase = computeHammingDistance(
      basePermutationString,
      currentPermutationString
    )
    if (differenceFromBase > numberOfGates) {
      permutationsToConsider.push(permutation)
      if (permutationsToConsider.length > resultsToReturn) {
        hasEnough = true
      } else if (permutationsToConsider.length % 2 === 0) {
        // Swap the base string based on the ones we are adding to increase variance
        basePermutationString = currentPermutationString
      }
    }
  })

  if (permutationsToConsider.length === 0) {
    for (let i = 0; i < resultsToReturn; i++) {
      const randomResult = permutations[Math.floor(randomizer() * permutations.length)]
      permutationsToConsider.push(randomResult)
    }
  }
  return permutationsToConsider
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
let drawHistory = false
let shouldIndicatePlaceCounter = false
let hasPlacedAggressiveHallways = false
let hasPlacedRoomHallways = false

const drawDungeon = dungeon => {
  drawDungeonLayout(dungeon, document.getElementById('dungeonVisual'), true)
}

const successfulDungeon = dungeon => ({ isSuccessful: true, storedDungeon: dungeon })
const failedDungeon = dungeon => ({ isSuccessful: false, storedDungeon: dungeon })

const createPlaceRooms = (rooms, gridDimensions, randomizer) => {
  // Placement methods
  const canPlaceRoom = (dungeon, currentPosition, currentDirection) => {
    const { x: newPosX, y: newPosY } = getNewPosition(currentPosition, currentDirection)

    if (newPosX > gridDimensions.width - 1) return false
    if (newPosY > gridDimensions.height - 1) return false
    if (newPosX < 0) return false
    if (newPosY < 0) return false

    return dungeon[newPosY][newPosX] === 0
  }

  const placeHallway = (dungeon, currentPosition, currentChunk) => {
    let hasPlacedHallway = false
    let newHallwayPosition = undefined
    const hallwayDirections = shuffleList(Object.values(directions), randomizer)

    while (!hasPlacedHallway && hallwayDirections.length) {
      const hallwayDirection = hallwayDirections.shift()

      // Check to see if we can place a hallway
      if (canPlaceRoom(dungeon, currentPosition, hallwayDirection)) {
        hasPlacedHallway = true
        const { x: hallX, y: hallY } = getNewPosition(currentPosition, hallwayDirection)
        dungeon[hallY][hallX] = createHallway(currentChunk, currentChunk.children)
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

  const createLargeHallway = (roomsToAdd, dungeon, newPosition, depth) => {
    let largeHallwayDungeon = circularArrayCopy(dungeon)
    let listOfAddedHallwayPositions = [newPosition]
    hasPlacedAggressiveHallways = true
    // Calculate how much minimum free space we need to place all the rooms
    const freeSpaceNeededFromRooms = roomsToAdd.reduce((accum, chunk) => accum + chunk.length, 0)

    let hallwayPosition = newPosition
    let currentFreeSpace = getFreeSpacesAround(hallwayPosition, dungeon)

    while (freeSpaceNeededFromRooms > currentFreeSpace) {
      const newPlacement = placeHallway(
        largeHallwayDungeon,
        hallwayPosition,
        largeHallwayDungeon[hallwayPosition.yPos][hallwayPosition.xPos]
      )

      if (newPlacement.hasPlacedHallway) {
        largeHallwayDungeon = newPlacement.dungeon
        hallwayPosition = newPlacement.newHallwayPosition
        listOfAddedHallwayPositions.push(hallwayPosition)
        currentFreeSpace = getFreeSpacesAroundArray(
          listOfAddedHallwayPositions,
          largeHallwayDungeon
        ).length
      } else {
        return failedDungeon(dungeon)
      }
    }

    const freeSpaceKeys = getFreeSpacesAroundArray(listOfAddedHallwayPositions, largeHallwayDungeon)
    const freeSpaceValues = freeSpaceKeys.map(JSON.parse)

    // Trim this list - choose only gates (nodes whose children matter)
    const rawPermutations = getAllPermutations(freeSpaceValues)

    const numberOfGates = roomsToAdd.reduce(
      (accum, curr) => accum + curr[0].nodesInRoom.some(node => node.locked),
      0
    )

    let freeSpacePermutations
    let freeSpaceIndex = 0

    if (numberOfGates > 7) {
      // We have too many gates to filter out - this program slows us down
      // Instead, we reduce our search space by only considering very different values
      // E.g. 1 2 3 4 is similar to 1 2 4 3 but different to 4 2 1 3
      // For desired number of gates, we calculate the nodes that have the greatest hamming distance score
      freeSpacePermutations = getPermutationsBasedOnHammingDistance(
        rawPermutations,
        numberOfGates,
        freeSpaceValues,
        randomizer
      )
    } else {
      const trimmedPermutations = rawPermutations.reduce(createLookup(numberOfGates), {
        result: [],
      }).result

      const shuffledSpacePermutations = shuffleList(trimmedPermutations, randomizer)
      freeSpacePermutations = shuffledSpacePermutations.map(permutation => {
        const newPermutations = permutation.slice()
        const permutationKeys = newPermutations.map(JSON.stringify)
        freeSpaceKeys.forEach(jsonKey => {
          if (!permutationKeys.includes(jsonKey)) {
            newPermutations.push(JSON.parse(jsonKey))
          }
        })
        return newPermutations
      })
    }

    // Iterate through all the free space possibilities (in case we placed a graph in a weird place)
    while (freeSpaceIndex < freeSpacePermutations.length) {
      let dungeonWithNecessaryHallways = circularArrayCopy(largeHallwayDungeon)

      const freeSpaces = freeSpacePermutations[freeSpaceIndex]

      const roomsToAddNext = []
      roomsToAdd.forEach((chunkedRoomArray, index) => {
        // Stored as an array here (from legacy decision to store as chunks)
        // Possibly revisit this later
        const currentChunkedRoom = chunkedRoomArray[0]
        const freeSpace = freeSpaces[index]
        dungeonWithNecessaryHallways[freeSpace.y][freeSpace.x] = currentChunkedRoom

        const newRoomsToAdd = []
        currentChunkedRoom.nodesInRoom.forEach(addChildrenNodesToRoomsToAdd(rooms, newRoomsToAdd))
        const newDirections = getDirections(newRoomsToAdd.length, randomizer)

        if (newRoomsToAdd.length) {
          roomsToAddNext.push({
            roomsToAdd: newRoomsToAdd,
            position: { xPos: freeSpace.x, yPos: freeSpace.y },
            directions: newDirections,
            directionIndex: 0,
            directionMax: newDirections.length,
          })
        }
      })

      // Dungeon with all the rooms placed around the new hallway
      // We revert to this snapshot when there is an issue with placing
      const freeSpaceDungeonSnapshot = circularArrayCopy(dungeonWithNecessaryHallways)
      let dungeonWithHallwayAndPlacedRooms = circularArrayCopy(freeSpaceDungeonSnapshot)

      if (drawHistory) drawDungeon(dungeonWithHallwayAndPlacedRooms)

      let isValid = true
      let isFinishedPlacing = false
      let failingIndex = -1

      const listOfSuccesfulDungeons = [circularArrayCopy(dungeonWithHallwayAndPlacedRooms)]

      const lastAttemptPlacements = []

      while (!isFinishedPlacing) {
        roomsToAddNext.forEach((nextRoom, index) => {
          if (!isValid) return
          const newDungeon = circularArrayCopy(dungeonWithHallwayAndPlacedRooms)
          const result = placeRooms(
            nextRoom.roomsToAdd,
            nextRoom.directions.slice(nextRoom.directionIndex, nextRoom.directionMax),
            newDungeon,
            nextRoom.position,
            depth + 1
          )

          if (result.isSuccessful) {
            listOfSuccesfulDungeons.push(result.storedDungeon)
            dungeonWithHallwayAndPlacedRooms = result.storedDungeon
          } else if (nextRoom.directionIndex !== 0) {
            // We have a failure when we've eliminated some directions (in a previously successful entry)
            // Attempt to place a hallway first before rejecting
            const lastAttemptToPlace = circularArrayCopy(dungeonWithHallwayAndPlacedRooms)
            const result = createHallways(
              [nextRoom.roomsToAdd],
              lastAttemptToPlace,
              nextRoom.position,
              depth + 1
            )
            lastAttemptPlacements.push(index)
            if (result.isSuccessful) {
              dungeonWithHallwayAndPlacedRooms = result.storedDungeon
            }
          } else {
            failingIndex = index
            isValid = false
          }
        })

        if (!isValid) {
          // TODO - this assumption is not valid
          const lastSuccessfulRoomPlaced = roomsToAddNext[failingIndex - 1]
          if (
            !lastSuccessfulRoomPlaced ||
            lastSuccessfulRoomPlaced.directionIndex + 1 > roomsToAddNext.length ||
            lastAttemptPlacements.includes(failingIndex - 1)
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
            dungeonWithHallwayAndPlacedRooms = circularArrayCopy(freeSpaceDungeonSnapshot)
            if (drawHistory) drawDungeon(dungeonWithNecessaryHallways)
          }
        } else {
          isFinishedPlacing = true
        }
      }

      if (isValid) {
        return successfulDungeon(dungeonWithHallwayAndPlacedRooms)
      }

      freeSpaceIndex++
    }

    return failedDungeon(dungeon)
  }

  const createHallways = (chunkedRoomsToAdd, dungeon, currentPosition, depth) => {
    const freeSpacesAroundCurrentPos = getFreeSpacesAround(currentPosition, dungeon)
    if (freeSpacesAroundCurrentPos === 0) return failedDungeon(dungeon)

    // Attempt to place a single hallway
    let tempDungeon = circularArrayCopy(dungeon)
    let chunkedRoomIndex = 0

    let { hasPlacedHallway, newHallwayPosition, dungeon: hallwayDungeon } = placeHallway(
      tempDungeon,
      currentPosition,
      dungeon[currentPosition.yPos][currentPosition.xPos]
    )
    if (!hasPlacedHallway) return failedDungeon(dungeon)

    tempDungeon = hallwayDungeon

    // Check to see how we can place - do we have enough space to place the remaining chunks, or do we need more?
    let freeSpacesAroundHallway = getFreeSpacesAround(newHallwayPosition, tempDungeon)
    if (freeSpacesAroundHallway < chunkedRoomsToAdd.length) {
      if (freeSpacesAroundHallway === 0) {
        return failedDungeon(dungeon)
      } else if (freeSpacesAroundHallway === 1) {
        return createHallways(chunkedRoomsToAdd, dungeon, newHallwayPosition, depth + 1)
      } else {
        return createLargeHallway(chunkedRoomsToAdd, tempDungeon, newHallwayPosition, depth)
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
          depth + 1
        )

        if (!result.isSuccessful) {
          return failedDungeon(dungeon)
        } else {
          tempDungeon = result.storedDungeon
          chunkedRoomIndex++
        }
      }
      return successfulDungeon(tempDungeon)
    }
  }

  const placeRooms = (roomsToAdd, arrayOfDirectionsToConsider, dungeon, currentPosition, depth) => {
    placeRoomCounter++
    if (roomsToAdd.length === 0) return successfulDungeon(dungeon)
    if (getFreeSpacesAround(currentPosition, dungeon) === 0) {
      return failedDungeon(dungeon)
    }

    if (roomsToAdd.length > 3) {
      const chunkedRooms = randChunkSplit(randomizer, roomsToAdd, 1, 1)
      return createHallways(chunkedRooms, dungeon, currentPosition, depth)
    }

    if (getFreeSpacesAround(currentPosition, dungeon) < roomsToAdd.length) {
      hasPlacedRoomHallways = true
      return createHallways([roomsToAdd], dungeon, currentPosition, depth)
    }

    let storedDungeon = circularArrayCopy(dungeon)
    let placedDungeon = undefined

    let hasAllPlacedSuccess = false

    let directionIndex = 0
    while (directionIndex < arrayOfDirectionsToConsider.length && !hasAllPlacedSuccess) {
      const directions = arrayOfDirectionsToConsider[directionIndex]

      const canPlaceAllRooms = roomsToAdd.every((room, index) => {
        const currentDirection = directions[index]
        return canPlaceRoom(storedDungeon, currentPosition, currentDirection)
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

        if (drawHistory)
          drawDungeonLayout(storedDungeon, document.getElementById('dungeonVisual'), true)
        if (shouldIndicatePlaceCounter) console.log('placeRoomCounter', placeRoomCounter)

        let failingIndex = -1
        let isValid = true
        let isFinishedPlacing = false

        placedDungeon = circularArrayCopy(storedDungeon)

        while (!isFinishedPlacing) {
          roomsToAddNext.forEach((nextRoom, index) => {
            if (!isValid) return
            const newDungeon = circularArrayCopy(placedDungeon)
            const result = placeRooms(
              nextRoom.roomsToAdd,
              nextRoom.directions.slice(nextRoom.directionIndex, nextRoom.directionMax),
              newDungeon,
              nextRoom.position,
              depth + 1
            )

            if (result.isSuccessful) {
              placedDungeon = result.storedDungeon
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
              placedDungeon = circularArrayCopy(placedDungeon)
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
      } else {
        storedDungeon = placedDungeon
      }
    }

    if (hasAllPlacedSuccess) {
      return successfulDungeon(storedDungeon)
    } else {
      return failedDungeon(storedDungeon)
    }
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

  const placeRooms = createPlaceRooms(rooms, gridDimensions, randomizer)

  const currentPosition = {
    xPos: startingRoomX,
    yPos: startingRoomY,
  }

  const roomsToAdd = []
  startingNode.nodesInRoom.forEach(addChildrenNodesToRoomsToAdd(rooms, roomsToAdd))

  const shuffledRoomsToAdd = shuffleList(roomsToAdd, randomizer)

  const directions = getDirections(shuffledRoomsToAdd.length, randomizer)

  const success = placeRooms(shuffledRoomsToAdd, directions, dungeon, currentPosition, 0, [])
  console.log('success', success)
  return {
    dungeon: success.storedDungeon,
    hasPlacedAggressiveHallways,
    hasPlacedRoomHallways,
  }
}
