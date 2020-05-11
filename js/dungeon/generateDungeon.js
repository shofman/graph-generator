/*
Create the entrance room
Create a tree of linked rooms (including locked doors)
Place the boss and goal rooms
Place the switch and switch-locks
Make the tree into a graph
Compute the intensity (difficulty) of rooms
Place keys within the dungeon
Optimizing linearity

/// 1. Place a number of randomly sized and positioned rooms. If a room
///    overlaps an existing room, it is discarded. Any remaining rooms are
///    carved out.

(alt step for 1 - generate a band of randomly sized rooms, and then shift them upwards so that they are no longer overlapping.
Combine both methods to create some variety)

/// 2. Any remaining solid areas are filled in with mazes. The maze generator
///    will grow and fill in even odd-shaped areas, but will not touch any
///    rooms.
/// 3. The result of the previous two steps is a series of unconnected rooms
///    and mazes. We walk the stage and find every tile that can be a
///    "connector". This is a solid tile that is adjacent to two unconnected
///    regions.
/// 4. We randomly choose connectors and open them or place a door there until
///    all of the unconnected regions have been joined. There is also a slight
///    chance to carve a connector between two already-joined regions, so that
///    the dungeon isn't single connected.
/// 5. The mazes will have a lot of dead ends. Finally, we remove those by
///    repeatedly filling in any open tile that's closed on three sides. When
///    this is done, every corridor in a maze actually leads somewhere.

Lock subtree.
Add subtree to list of locked subtrees.
Place key in any subtree not “locked”.
Repeat for any “open” subtree.


Example dungeon node - {id: 1, label: 'Node 1'},
*/
import { KEY_TYPES } from './dungeonStructure/keyTypes.js'
import { calculateDungeonScore } from './evaluate/evaluateDungeon.js'
import { verifyDungeon } from './evaluate/verifyDungeon.js'
import { createHardCodedDungeons } from './hardcodedDungeons/createHardcodedDungeons.js'
import { makeRandomDungeon } from './randomDungeons/createRandomDungeon.js'
import { drawRooms } from './ui/drawDungeon.js'
import { createRoomsFromSteps as createRoomsFromSteps2 } from './createRoomsFromSteps.js'
import { generateSeedName } from './utils/seedName.js'

const showRoomsAdded = (dungeonData, roomData) => {
  return dungeonData.map(dungeon => {
    const roomsAdded = []
    roomData.forEach(roomGroup => {
      roomGroup.nodesInRoom.forEach(room => {
        roomsAdded.push(room.name)
      })
    })

    console.log('roomsAdded', roomsAdded)

    const nodes = dungeon.nodes.map(dungeonNodes => {
      if (roomsAdded.includes(dungeonNodes.id)) {
        return { ...dungeonNodes, shape: 'box', borderWidth: 2 }
      }
      return dungeonNodes
    })

    return {
      ...dungeon,
      nodes: nodes,
      rooms: roomData,
    }
  })
}

export const createDungeons = currentStep => {
  let newDungeons = createHardCodedDungeons(currentStep)

  const toShow = [
    // 'explorersCrypt',
    // 'waterTemple2',
    // 'fireTemple',
    // 'shadowTemple2',
    // 'spiritTemple',
    // 'palaceOfDarkness'

    'spiritsGrave3',

    // 'spiritsGrave2',
    // 'fortressOfWinds3',
    // 'explorersCrypt',
    // 'waterTemple2',
    // 'forestTemple',
    // 'mermaidsCave2',
    // 'dancingDragon2',
    // 'jabujabuOracle',
    // 'unicornsCave2',
    // 'crownDungeon',
    // 'ancientTomb',
    // // 'fireTemple',
    // 'swordAndShield2',
    // 'moonlitGrotto',
    // 'snakeRemains',
  ]

  let averageKeyItemPos = 0
  let averageNumberOfSteps = 0
  let leastAmountOfSteps = 100
  let totalLength = newDungeons.length

  let showDebugInfo = false

  newDungeons = newDungeons.filter(dungeon => {
    averageNumberOfSteps += dungeon.numberOfSteps
    if (leastAmountOfSteps > dungeon.numberOfSteps) {
      leastAmountOfSteps = dungeon.numberOfSteps
    }
    dungeon.arrayOfSteps.map((step, index) => {
      if (step.type === KEY_TYPES.KEY_ITEM) {
        averageKeyItemPos += index
      }
    })
    if (!toShow.length) {
      return true
    }
    return toShow.includes(dungeon.seedName)
  })

  averageKeyItemPos /= totalLength
  averageNumberOfSteps /= totalLength

  if (showDebugInfo) {
    console.log('average position of key item is', averageKeyItemPos)
    console.log('averageNumberOfSteps', averageNumberOfSteps)
    console.log('leastAmountOfSteps', leastAmountOfSteps)
  }

  let dungeonInfo
  let currentDungeon
  let seed

  const shouldGenerate = true
  // seed = 1588517936366.1255 // Handle multiKey rooms better?
  // seed = 1588536297862.176
  // seed = 1588590758572.52
  seed = 1588707120611.39
  // currentDungeon = makeRandomDungeon(currentStep, 1588407025859.6)
  // currentDungeon = makeRandomDungeon(currentStep, 1588408837510.7258)
  // currentDungeon = makeRandomDungeon(currentStep, 1588414788646.3752) // Problem with this one - we are generating a key lock pair that is technically skippable if key-locks are treated as non-unique

  if (shouldGenerate) {
    if (seed) {
      currentDungeon = makeRandomDungeon(currentStep, seed)
      dungeonInfo = verifyDungeon(currentDungeon)
      newDungeons.push(currentDungeon)
    } else {
      let tries = 0

      while (tries++ < 1000) {
        currentDungeon = makeRandomDungeon(currentStep)
        dungeonInfo = verifyDungeon(currentDungeon)
        const dungeonScore = calculateDungeonScore(dungeonInfo)
        if (dungeonScore.criticalPathDistance / dungeonScore.numberOfNodes > 5) {
          newDungeons.push(currentDungeon)
          break
        }
      }
    }
    console.log('seed', dungeonInfo.dungeon.seedName)
    const rooms = createRoomsFromSteps2(dungeonInfo, currentDungeon.randomizer)
    console.log('rooms', rooms)
    const totalRoomsAdded = rooms.reduce((accumulator, value) => {
      return accumulator + value.nodesInRoom.length
    }, 0)

    if (totalRoomsAdded !== dungeonInfo.visitedPath.length) {
      console.log('dungeonInfo', dungeonInfo)
      console.warn(
        'we did not place all the rooms!',
        `${dungeonInfo.visitedPath.length - totalRoomsAdded} left to add`
      )
      console.log('rooms', rooms)
    }
    const groupingCanvas = document.getElementById('dungeonRooms')
    drawRooms(groupingCanvas, rooms)

    return showRoomsAdded(newDungeons, rooms)
  }

  /*
    Verification starts here
  */

  let verificationTries = 0

  let hasPushedADungeon = false

  const roomCount = {}

  while (verificationTries++ < 50000) {
    if (verificationTries % 100 === 0) console.log('attempt:', verificationTries)
    let creationTries = 0
    let newSeed = generateSeedName()
    while (creationTries++ < 100) {
      currentDungeon = makeRandomDungeon(currentStep, newSeed)
      dungeonInfo = verifyDungeon(currentDungeon)
      const dungeonScore = calculateDungeonScore(dungeonInfo)
      if (dungeonScore.criticalPathDistance / dungeonScore.numberOfNodes > 5) {
        if (!hasPushedADungeon) {
          hasPushedADungeon = true
          newDungeons.push(currentDungeon)
        }
        break
      } else {
        newSeed = generateSeedName()
      }
    }

    let rooms
    try {
      rooms = createRoomsFromSteps2(dungeonInfo, currentDungeon.randomizer)
    } catch (e) {
      console.log('newSeed', newSeed)
      console.log('e', e)
      throw new Error('Something broke in making a room')
    }

    rooms
      .filter(roomGroup => !roomGroup.isFirstRoom)
      .forEach(roomGroup => {
        const roomKey = roomGroup.nodesInRoom
          .map(node => {
            if (node.type === KEY_TYPES.SINGLE_ROOM_PUZZLE) {
              if (node.isPuzzle) return 'puzzle'
              if (node.isCombat) return 'combat'
              if (node.isMiniboss) return 'miniboss'
              return 'unknown'
            } else if (node.type === KEY_TYPES.BOSS) {
              return node.name
            } else if (node.type === KEY_TYPES.NORMAL_KEY) {
              return node.locked ? 'normalGate' : 'normalKey'
            } else {
              return node.type
            }
          })
          .sort()
          .join('+')

        if (roomCount[roomKey]) {
          roomCount[roomKey].push(newSeed)
        } else {
          roomCount[roomKey] = [newSeed]
        }
      })

    const totalRoomsAdded = rooms.reduce((accumulator, value) => {
      return accumulator + value.nodesInRoom.length
    }, 0)

    if (totalRoomsAdded !== dungeonInfo.visitedPath.length) {
      console.log('dungeonInfo', dungeonInfo)
      console.warn(
        'we did not place all the rooms!',
        `${dungeonInfo.visitedPath.length - totalRoomsAdded} left to add`,
        newSeed
      )
      console.log('rooms', rooms)
      throw new Error('NO!')
    }
  }

  console.log('roomCount', roomCount)
  const roomCountLengths = {}
  Object.keys(roomCount).forEach(key => {
    roomCountLengths[key] = roomCount[key].length
  })
  console.log('roomCountLengths', JSON.stringify(roomCountLengths))

  const rooms = createRoomsFromSteps2(dungeonInfo, currentDungeon.randomizer)
  const groupingCanvas = document.getElementById('dungeonRooms')
  drawRooms(groupingCanvas, rooms)

  return showRoomsAdded(newDungeons, rooms)
  /*
    Verification ends here
  */
}
