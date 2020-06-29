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
import { KeyType } from './dungeonStructure/keyTypes.js'
import { calculateDungeonScore } from './evaluate/evaluateDungeon.js'
import { verifyDungeon } from './evaluate/verifyDungeon.js'
import { createHardCodedDungeons } from './hardcodedDungeons/createHardcodedDungeons.js'
import { makeRandomDungeon, RandomDungeon } from './randomDungeons/createRandomDungeon.js'
import { drawRooms } from './ui/drawDungeon.js'
import { createRoomsFromSteps as createRoomsFromSteps2, RoomType } from './createRoomsFromSteps.js'
import { generateSeedName } from './utils/seedName.js'

const showRoomsAdded = (dungeonData : RandomDungeon[], roomData: RoomType[]) => {
  return dungeonData.map(dungeon => {
    const roomsAdded : string[] = []
    roomData.forEach(roomGroup => {
      roomGroup.nodesInRoom.forEach(room => {
        roomsAdded.push(room.name)
      })
    })

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
      totalRoomsAdded: roomsAdded,
    }
  })
}

const showHardcodedDungeons = (currentStep : number) => {
  let newDungeons = createHardCodedDungeons(currentStep)
  let averageKeyItemPos = 0
  let averageNumberOfSteps = 0
  let leastAmountOfSteps = 100
  
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
  let totalLength = newDungeons.length

  newDungeons = newDungeons.filter(dungeon => {
    averageNumberOfSteps += dungeon.numberOfSteps
    if (leastAmountOfSteps > dungeon.numberOfSteps) {
      leastAmountOfSteps = dungeon.numberOfSteps
    }
    dungeon.arrayOfSteps.map((step, index) => {
      if (step.type === KeyType.KEY_ITEM) {
        averageKeyItemPos += index
      }
    })
    if (!toShow.length) {
      return true
    }
    return toShow.includes(dungeon.seedName)
  })

  let showDebugInfo = false

  averageKeyItemPos /= totalLength
  averageNumberOfSteps /= totalLength

  if (showDebugInfo) {
    console.log('average position of key item is', averageKeyItemPos)
    console.log('averageNumberOfSteps', averageNumberOfSteps)
    console.log('leastAmountOfSteps', leastAmountOfSteps)
  }

  return newDungeons
}

export const createDungeons = (currentStep: number) => {
  let dungeonInfo
  let currentDungeon : RandomDungeon
  let seed
  let displayHardcodedDungeons = false

  let newDungeons : RandomDungeon[] = []

  if (displayHardcodedDungeons) {
    showHardcodedDungeons(currentStep)
  }

  const shouldGenerate = true
  // seed = 1588517936366.1255 // Handle multiKey rooms better?

  // Fixed seeds
  // seed = 1590228819172.405 // Missing only a couple, not using hallways
  // seed = 1589976954764.921 // Missing a couple - not contiguous?!??!
  // seed = 1590228728734.0586 // Unconnected, not using hallways

  // Fixed seed (but needs better presentation)
  // seed = 1589932401098.902 // Weirdness going on here with presentation
  // seed = 1590169084846.8787
  // seed = 1590169097825.6536 // Current problem
  // seed = 1590228706889.6035 // Did not break using hallways

  // Fixed bug where we reverted to a previous snapshot without required rooms
  // seed = 1590228771249.1765 // Big gap
  // seed = 1590168298673.6724 // Misssing small number
  // seed = 1590077310772.8684
  // seed = 1590168216706.4155
  // seed = 1590169576248.228
  // seed = 1590254083147.8586
  // seed = 1590319129786.9465
  // seed = 1590319425009.2466
  // seed = 1590319433722.451

  // Give the large hallway algorithm the ability to place a hallway to see if it fixes something
  // seed = 1590269316611.2944 // Same here
  // seed = 1590268921085.763 // Something has gone terribly wrong here
  // seed = 1590228746532.7815 // maybe interesting to debug
  // seed = 1590519823913.1116
  // seed = 1590169111302.217 // BROKEN AGAIN!!!!
  // seed = 1590228801245.274 // horrific explosion

  // Too long running programs (too many permutations)
  // Fixed
  // seed = 1590521789370.064
  // seed = 1590521836914.4592
  // seed = 1590524614564.1333
  // seed = 1590526912647.095
  // seed = 1590527000863.102
  // seed = 1590527077233.749

  // Reset the grid if randomizing the placements
  // seed = 1590529275861.6543 // missing negative number?

  // Working test
  // seed = 1590705763952.6433

  // Broken
  // seed = 1590529175745.4773 // did not place all
  // seed = 1590529229238.0076 // slow
  // seed = 1590698133823.4531 // Too much recursion error

  currentDungeon = makeRandomDungeon(currentStep, 1588407025859.6)
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
        if (!dungeonInfo) continue
        const dungeonScore = calculateDungeonScore(dungeonInfo)
        if (dungeonScore.criticalPathDistance / dungeonScore.numberOfNodes > 5) {
          newDungeons.push(currentDungeon)
          break
        }
      }
    }

    if (!dungeonInfo) {
      throw new Error('No dungeoninof')
    }

    console.log('seed', dungeonInfo.dungeon.seedName)
    const rooms = createRoomsFromSteps2(dungeonInfo, currentDungeon.randomizer)
    console.log('rooms', rooms)
    const totalRoomsAdded = rooms.reduce((accumulator, value) => {
      return accumulator + (value.nodesInRoom ? value.nodesInRoom.length : 0)
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

  interface RoomHash {
    [details: string]: number[]
  }

  interface RoomHashCount {
    [details: string]: number
  }

  const roomCount : RoomHash = {}

  while (verificationTries++ < 50000) {
    if (verificationTries % 100 === 0) console.log('attempt:', verificationTries)
    let creationTries = 0
    let newSeed = generateSeedName()
    while (creationTries++ < 100) {
      currentDungeon = makeRandomDungeon(currentStep, newSeed)
      dungeonInfo = verifyDungeon(currentDungeon)
      if (!dungeonInfo) continue
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

    if (!dungeonInfo) {
      throw new Error('No dungeoninof')
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
        const roomKey = (roomGroup.nodesInRoom ? roomGroup.nodesInRoom : [])
          .map(node => {
            if (node.type === KeyType.SINGLE_ROOM_PUZZLE) {
              if (node.isPuzzle) return 'puzzle'
              if (node.isCombat) return 'combat'
              if (node.isMiniboss) return 'miniboss'
              return 'unknown'
            } else if (node.type === KeyType.BOSS) {
              return node.name
            } else if (node.type === KeyType.NORMAL_KEY) {
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
      return accumulator + (value.nodesInRoom ? value.nodesInRoom.length : 0)
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
  const roomCountLengths : RoomHashCount = {}
  Object.keys(roomCount).forEach(key => {
    roomCountLengths[key] = roomCount[key].length
  })
  console.log('roomCountLengths', JSON.stringify(roomCountLengths))

  if (!dungeonInfo) throw new Error('Needed DungeonInfo at this point')

  const rooms = createRoomsFromSteps2(dungeonInfo, currentDungeon.randomizer)
  const groupingCanvas = document.getElementById('dungeonRooms')
  drawRooms(groupingCanvas, rooms)

  return showRoomsAdded(newDungeons, rooms)
  /*
    Verification ends here
  */
}
