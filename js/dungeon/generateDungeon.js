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
// import { v4 } from 'uuid'
import { KEY_TYPES } from './dungeonStructure/keyTypes.js'
import { calculateDungeonScore } from './evaluate/evaluateDungeon.js'
import { verifyDungeon } from './evaluate/verifyDungeon.js'
import { createHardCodedDungeons } from './hardcodedDungeons/createHardcodedDungeons.js'
import { resultFromProbability } from './utils/resultFromProbability.js'
import { makeRandomDungeon } from './randomDungeons/createRandomDungeon.js'
import { drawDungeonRooms } from './ui/drawDungeon.js'

const createRoomsFromSteps = (steps, randomizer) => {
  console.log('steps', steps)
  let rooms = []

  const allPotentialNodes = steps.visitedPath.slice()

  const startNode = allPotentialNodes[0]
  const externalKeys = []
  let remainingKeys = []

  startNode.children.forEach(child => {
    if (child.type === KEY_TYPES.EXTERNAL_KEY && !child.locked) {
      externalKeys.push(child)
    } else {
      remainingKeys.push(child)
    }
  })

  const firstRoom = {
    nodesInRoom: [startNode, ...externalKeys],
    index: 1,
    isFirstRoom: true,
  }

  rooms.push(firstRoom)

  const isKeyWithSharedGate = (otherKeys, item) =>
    item.locked === false && item.locks.length === 1 && otherKeys.includes(item.locks[0])

  const hasSingleChild = node => node.children && node.children.length === 1

  const hasMoreDescendents = node => {
    if (node.children) {
      return node.children.some(child => child.children.length > 0)
    }
    return false
  }

  const isPuzzleNode = node => node.isPuzzle === true

  if (remainingKeys.some(item => item.type === KEY_TYPES.SINGLE_ROOM_PUZZLE)) {
    const result = remainingKeys.reduce(
      (arrayResult, item) => {
        if (item.type === KEY_TYPES.SINGLE_ROOM_PUZZLE) {
          if (isKeyWithSharedGate(remainingKeys, item)) {
            const correspondingGate = remainingKeys.find(lock => item.locks[0] === lock)
            const newRoom = { nodesInRoom: [item, correspondingGate] }

            console.log('hasMoreDescendents', hasMoreDescendents(correspondingGate))

            if (hasSingleChild(correspondingGate)) {
              if (isPuzzleNode(correspondingGate) && !hasMoreDescendents(correspondingGate)) {
                newRoom.nodesInRoom.push(correspondingGate.children[0])
              }
            }

            // if (correspondingGate.childr)
            arrayResult.singleRooms.push(newRoom)
          }
        } else {
          arrayResult.otherRooms.push(item)
        }
        return arrayResult
      },
      { singleRooms: [], otherRooms: [] }
    )

    rooms = rooms.concat(result.singleRooms)
    remainingKeys = result.otherRooms
  }

  const externalLockNewRoomProbabilities = {
    ['true']: 50,
    ['false']: 50,
  }

  if (remainingKeys.some(item => item.type === KEY_TYPES.EXTERNAL_KEY)) {
    const result = remainingKeys.reduce(
      (arrayResult, item) => {
        if (item.type === KEY_TYPES.EXTERNAL_KEY) {
          const shouldAddToExistingRoom = resultFromProbability(
            randomizer,
            externalLockNewRoomProbabilities,
            false
          )

          if (shouldAddToExistingRoom === 'true') {
            console.log('we are adding external to a new room', shouldAddToExistingRoom)
          } else {
            const newRoom = { nodesInRoom: [item] }
            arrayResult.singleRooms.push(newRoom)
          }
        } else {
          arrayResult.otherRooms.push(item)
        }
        return arrayResult
      },
      { singleRooms: [], otherRooms: [] }
    )

    rooms = rooms.concat(result.singleRooms)
    remainingKeys = result.otherRooms
  }

  const normalGatesNewRoomProbabilities = {
    ['true']: 25,
    ['false']: 75,
  }

  if (remainingKeys.some(item => item.type === KEY_TYPES.NORMAL_KEY)) {
    const result = remainingKeys.reduce(
      (arrayResult, item) => {
        if (item.type === KEY_TYPES.NORMAL_KEY) {
          const shouldAddToExistingRoom = resultFromProbability(
            randomizer,
            normalGatesNewRoomProbabilities,
            false
          )

          if (shouldAddToExistingRoom === 'true') {
            console.log('we are adding normal to a new room', shouldAddToExistingRoom)
          } else {
            const newRoom = { nodesInRoom: [item] }
            arrayResult.singleRooms.push(newRoom)
          }
        } else {
          arrayResult.otherRooms.push(item)
        }
        return arrayResult
      },
      { singleRooms: [], otherRooms: [] }
    )

    rooms = rooms.concat(result.singleRooms)
    remainingKeys = result.otherRooms
  }

  console.log('remainingKeys', remainingKeys)

  const keyItemGateProbabilities = {
    ['true']: 80,
    ['false']: 50,
  }

  if (remainingKeys.some(item => item.type === KEY_TYPES.KEY_ITEM)) {
    const result = remainingKeys.reduce(
      (arrayResult, item) => {
        if (item.type === KEY_TYPES.KEY_ITEM) {
          const shouldAddToExistingRoom = resultFromProbability(
            randomizer,
            keyItemGateProbabilities,
            false
          )

          if (shouldAddToExistingRoom === 'true') {
            const addingRooms = rooms.filter(room => !room.isFirstRoom)
            if (addingRooms.length > 3) {
              addingRooms
            }
            console.log('addingRooms', addingRooms)
            console.log('we are adding keyitem to a new room', shouldAddToExistingRoom)
          } else {
            const newRoom = { nodesInRoom: [item] }
            arrayResult.singleRooms.push(newRoom)
          }
        } else {
          arrayResult.otherRooms.push(item)
        }
        return arrayResult
      },
      { singleRooms: [], otherRooms: [] }
    )

    rooms = rooms.concat(result.singleRooms)
    remainingKeys = result.otherRooms
  }

  if (remainingKeys.length) {
    throw new Error('Still have rooms to place!')
  }

  return rooms
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
    // // 'jabujabuOracle',
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

  const fixed = true

  let dungeonInfo
  let currentDungeon

  if (fixed) {
    // const currentDungeon = makeRandomDungeon(currentStep, 1550962391952.9353)
    currentDungeon = makeRandomDungeon(currentStep, 1551628833378.7515)
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
  const rooms = createRoomsFromSteps(dungeonInfo, currentDungeon.randomizer)
  console.log('rooms', rooms)
  const groupingCanvas = document.getElementById('dungeonRooms')
  drawDungeonRooms(groupingCanvas, rooms)

  return newDungeons
}
