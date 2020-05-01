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
import { getAllSubsets } from './utils/getAllSubsets.js'
import { KEY_TYPES } from './keyTypes.js'
import { AleaRandomizer } from './AleaRandomizer.js'
import { calculateDungeonScore } from './evaluateDungeon.js'
import { verifyDungeon } from './verifyDungeon.js'
import {
  fortressOfWinds,
  fortressOfWinds2,
  // rocsFeather,
  shadowTemple,
  shadowTemple2,
  waterTemple,
  waterTemple2,
  gnarledRoot,
  gnarledRoot2,
  snakeRemains,
  poisonMoth,
  dancingDragon,
  dancingDragon2,
  unicornsCave,
  unicornsCave2,
  ancientRuins,
  explorersCrypt,
  swordAndShield,
  swordAndShield2,
  faceShrine,
  palaceOfDarkness,
  greatBayTemple,
  explorersCave,
  stoneTowerTemple,
  tailCave,
  spiritsGrave,
  spiritsGrave2,
  wingDungeon,
  moonlightGrotto,
  moonlitGrotto,
  skullDungeon,
  crownDungeon,
  mermaidsCave,
  mermaidsCave2,
  jabujabuBelly,
  jabujabuOracle,
  ancientTomb,
  earthTemple,
  // windTemple,
  towerOfTheGods,
  deepwoodShrine,
  palaceOfWinds,
  forestTempleTwilight,
  snowPeakRuins,
  sandShip,
  skyViewTemple,
  desertPalace,
  turtleRock,
  // skullWoods,
  // towerOfHera,
  dragonRoostCavern,
  spiritTemple,
  forestTemple,
  fireTemple,
  jabujabuOcarina,
} from './hardcodedDungeons.js'

// const getAllSubsets = arrayOfChildren =>
//   arrayOfChildren
//     .reduce((subsets, value) => subsets.concat(subsets.map(set => [value, ...set])), [[]])
//     .filter(item => item.length !== 0)

class Node {
  constructor(parent, value) {
    this.parent = parent
    this.value = value
    this.name = value.label
    this.children = []
    this.locked = false
    this.keys = []
    this.locks = []
    this.type = undefined
  }

  getParent() {
    return this.value.getParent()
  }

  isLocked() {
    return this.locked
  }

  setLocked() {
    this.locked = true
  }

  getUnlockedChildren() {
    return this.children.filter(child => !child.isLocked())
  }

  getLockedChildren() {
    return this.children.filter(child => child.isLocked())
  }

  getValue() {
    return this.value
  }

  getChildren() {
    return this.children
  }

  getFilteredChildren(arrayOfChildren) {
    const allChildren = this.getChildren()
    const childrenToReturn = arrayOfChildren.map(child => {
      if (Array.isArray(child)) {
        return allChildren.filter(everyChild => child.includes(everyChild.value.label))
      } else {
        return allChildren.find(everyChild => everyChild.value.label === child)
      }
    })
    return childrenToReturn
  }

  setKeys(keys) {
    this.keys = keys
  }

  setType(type) {
    this.type = type
  }

  setPuzzle(isPuzzle = false) {
    this.isPuzzle = isPuzzle
  }

  setCombat(isCombat = false) {
    this.isCombat = isCombat
  }

  getKeys() {
    return this.keys
  }

  calculateHeight() {
    const calculatedHeight = this.parent ? this.parent.calculateHeight() + 1 : 0
    return calculatedHeight
  }

  isBossNode() {
    return this.name === ''
  }

  setLocks(locks) {
    this.locks = locks
  }

  getLocks() {
    return this.locks
  }

  displayChildren() {
    console.log(this.children.map(child => child))
  }

  hasChildren() {
    return !!this.children.length
  }

  addChild(childNode) {
    this.children.push(childNode)
    childNode.setParent(this)
  }

  removeChild(itemToRemove) {
    this.children = this.children.filter(item => item.getValue().id !== itemToRemove.getValue().id)
  }

  setParent(parentNode) {
    this.parent = parentNode
  }

  insertLock(lockNode, childrenNodes) {
    lockNode.setLocked()
    this.addChild(lockNode)

    childrenNodes.forEach(child => {
      if (Array.isArray(child)) {
        child.forEach(itemToLock => {
          this.removeChild(itemToLock)
          lockNode.addChild(itemToLock)
        })
      } else {
        this.removeChild(child)
        lockNode.addChild(child)
      }
    })
  }

  addObstacle({
    name,
    numberOfLocks,
    numberOfKeys,
    type,
    color,
    childrenToLock,
    isPuzzle,
    isCombat,
  }) {
    const addedLocks = []
    const addedKeys = []

    for (let i of Array(numberOfLocks).keys()) {
      const lockNode = createNode(`${name}Gate${numberOfLocks > 1 ? i + 1 : ''}`, color)
      addedLocks.push(lockNode)
      this.insertLock(lockNode, numberOfLocks > 1 ? [childrenToLock[i]] : childrenToLock)
    }

    for (let i of Array(numberOfKeys).keys()) {
      const keyNode = createNode(`${name}${numberOfKeys > 1 ? i + 1 : ''}Key`, color)
      addedKeys.push(keyNode)
      this.addChild(keyNode)
    }

    addedLocks.forEach(lock => {
      lock.setKeys(addedKeys)
      lock.setType(type)
      lock.setPuzzle(isPuzzle)
      lock.setCombat(isCombat)
    })
    addedKeys.forEach(key => {
      key.setLocks(addedLocks)
      key.setType(type)
      key.setPuzzle(isPuzzle)
      key.setCombat(isCombat)
    })

    return addedLocks.concat(addedKeys)
  }

  addRandomObstacle({
    name,
    type,
    isSingleLock,
    isSingleKey,
    isCombat,
    isPuzzle,
    color,
    childrenToLock,
    randomizer,
    probabilityToAdd,
  }) {
    const addedLocks = []
    const addedKeys = []

    const forceAdd = probabilityToAdd === '100'

    let hasAdded = false
    let i = 0

    let isLockingSingleRoom = false
    let isLockingSpecialLock = false

    childrenToLock = childrenToLock.filter(child => {
      if (child.type === KEY_TYPES.SINGLE_ROOM_PUZZLE) {
        isLockingSingleRoom = true
      } else if (child.type === KEY_TYPES.SINGLE_LOCK_KEY) {
        isLockingSpecialLock = true
      }
      return (
        child.type !== KEY_TYPES.EXTERNAL_KEY ||
        (child.type === KEY_TYPES.EXTERNAL_KEY && child.locked)
      )
    })

    let nodeSubsets = getAllSubsets(childrenToLock).filter(item => item.length !== 0)

    if (isLockingSingleRoom) {
      nodeSubsets = nodeSubsets.filter(subsetArray => {
        if (subsetArray.every(item => item.type !== KEY_TYPES.SINGLE_ROOM_PUZZLE)) {
          return true
        }
        return false
      })
    }

    if (isLockingSpecialLock) {
      nodeSubsets = nodeSubsets.filter(subsetArray => {})
    }

    childrenToLock.forEach(child => {
      let result
      if (forceAdd) {
        result = 1
      } else {
        result = randomizer()
      }

      if (result >= 1 / nodeSubsets.length && !(hasAdded && isSingleLock)) {
        const lockNode = createNode(`${name}Gate${!isSingleLock ? i++ : ''}`, color)
        hasAdded = true
        if (forceAdd) {
          this.insertLock(lockNode, [child])
        } else {
          const subsetToAdd = nodeSubsets[Math.floor(randomizer() * nodeSubsets.length)]
          subsetToAdd &&
            subsetToAdd.forEach(node => {
              nodeSubsets = nodeSubsets.filter(nodeSubset => !nodeSubset.includes(node))
            })
          this.insertLock(lockNode, subsetToAdd)
        }
        addedLocks.push(lockNode)
      }
    })

    if (!hasAdded) {
      // Pick one entry at random
      const lockNode = createNode(`${name}Gate`, color)
      const childToLock = childrenToLock[Math.floor(randomizer() * childrenToLock.length)]

      if (childToLock.type === KEY_TYPES.SINGLE_ROOM_PUZZLE) {
        if (childToLock.locked) {
          this.insertLock(lockNode, [childToLock, childToLock.keys[0]])
        } else {
          this.insertLock(lockNode, [childToLock, childToLock.locks[0]])
        }
      } else {
        this.insertLock(lockNode, [childToLock])
      }
      addedLocks.push(lockNode)
    }

    if (isSingleKey) {
      const keyNode = createNode(`${name}Key`, color)
      this.addChild(keyNode)
      addedKeys.push(keyNode)
    } else {
      // Pick random number of keys
      const numberOfKeys = [2, 3, 4, 5]
      const keysToGen = numberOfKeys[Math.floor(randomizer() * numberOfKeys.length)]

      for (let i of Array(keysToGen).keys()) {
        const keyNode = createNode(`${name}${i + 1}Key`, color)
        addedKeys.push(keyNode)
        this.addChild(keyNode)
      }
    }

    addedLocks.forEach(lock => {
      lock.setKeys(addedKeys)
      lock.setType(type)
      lock.setPuzzle(isPuzzle)
      lock.setCombat(isCombat)
    })
    addedKeys.forEach(key => {
      key.setLocks(addedLocks)
      key.setType(type)
      key.setPuzzle(isPuzzle)
      key.setCombat(isCombat)
    })

    return addedLocks.concat(addedKeys)
  }
}

class Tree {
  constructor() {
    this.rootValue = createNode('start', '#96c2fc', null)
  }

  draw() {
    const connections = []
    const keyLockConnections = []
    let nodes = []

    const drawQueue = []

    drawQueue.push(this.rootValue)
    nodes.push(this.rootValue.getValue())

    while (drawQueue.length) {
      const currentValue = drawQueue[0]
      const childrenToDraw = currentValue.getChildren()

      if (childrenToDraw.length) {
        const childrenNodes = childrenToDraw.map(item => {
          connections.push(createConnection(currentValue.getValue().id, item.getValue().id))
          if (item.keys.length) {
            item.keys.forEach(key =>
              keyLockConnections.push(createConnection(key.getValue().id, item.getValue().id))
            )
          }
          drawQueue.push(item)
          return item.getValue()
        })

        nodes = nodes.concat(childrenNodes)
      }
      drawQueue.shift()
    }

    const unique = [...new Set(nodes.filter(item => item.id))]

    return {
      nodes: unique,
      connections,
      keyLockConnections,
    }
  }

  addEndState() {
    const endNode = createNode('end', 'beige', this.rootValue)
    this.rootValue.addChild(endNode)
    return endNode
  }

  createBossObstacle(endNode) {
    return {
      name: 'boss',
      type: KEY_TYPES.BOSS,
      numberOfKeys: 1,
      numberOfLocks: 1,
      color: 'red',
      getChildrenToLock: () => [endNode],
    }
  }

  createHardCodedDungeon(step, uniqueObstacles) {
    const baseObstacles = [this.createBossObstacle(this.addEndState())]
    const obstacles = baseObstacles.concat(uniqueObstacles).slice(0, step)
    this.addDungeonObstacles(obstacles)
    return obstacles.length
  }

  createRandomDungeon(step, randomizer, uniqueObstacles) {
    const baseObstacles = [this.createRandomBossObstacle(this.addEndState())]
    const obstacles = baseObstacles.concat(uniqueObstacles).slice(0, step)
    this.addRandomDungeonObstacles(obstacles, randomizer)

    return obstacles.length
  }

  createRandomBossObstacle(endNode) {
    return {
      name: 'boss',
      type: KEY_TYPES.BOSS,
      color: 'red',
      getChildrenToLock: () => [endNode],
      isSingleKey: true,
      isSingleLock: true,
      probabilityToAdd: '100',
    }
  }

  addDungeonObstacles(obstacles) {
    obstacles.forEach(obstacle => {
      this.rootValue.addObstacle(
        Object.assign(obstacle, {
          childrenToLock: obstacle.getChildrenToLock(this.rootValue),
        })
      )
    })
  }

  addRandomDungeonObstacles(obstacles, randomizer) {
    obstacles.forEach(obstacle => {
      this.rootValue.addRandomObstacle(
        Object.assign(obstacle, {
          randomizer,
          childrenToLock: obstacle.getChildrenToLock(this.rootValue),
        })
      )
    })
  }
}

const createNode = (name, lockColor, parent = null) => {
  return new Node(parent, { id: name, label: name, color: lockColor })
}

const createConnection = (start, end) => ({ from: start, to: end })

const generateSeedName = () => {
  return +new Date() + Math.random()
}

const makeDungeon = (currentStep, seedName, arrayOfSteps = fortressOfWinds) => {
  if (!seedName) {
    seedName = generateSeedName()
  }
  const tree = new Tree()
  const numberOfSteps = tree.createHardCodedDungeon(currentStep, arrayOfSteps)
  const dungeonNodes = tree.draw()

  return {
    tree,
    seedName,
    numberOfSteps,
    arrayOfSteps,
    nodes: dungeonNodes.nodes,
    connections: dungeonNodes.connections,
    keyLockConnections: dungeonNodes.keyLockConnections,
  }
}

const createRandomPuzzleLock = (name, type, color) => {
  return Object.assign(createRandomLock(name, type, color), { isPuzzle: true, isCombat: false })
}

const createRandomLock = (name, type, color) => {
  return {
    name,
    type,
    color,
    getChildrenToLock: rootValue => rootValue.getChildren(),
    isSingleLock: true,
    isSingleKey: true,
  }
}

const createRandomMiniboss = name => {
  return {
    name,
    type: KEY_TYPES.SINGLE_ROOM_PUZZLE,
    color: 'purple',
    getChildrenToLock: rootValue => rootValue.getChildren(),
    isSingleKey: true,
    isSingleLock: true,
  }
}

const createRandomKeyItem = (name, numberOfLocks) => {
  return {
    name,
    type: KEY_TYPES.KEY_ITEM,
    color: 'lightgreen',
    getChildrenToLock: rootValue => rootValue.getChildren(),
    isSingleKey: true,
    isSingleLock: numberOfLocks === 1,
  }
}

const createRandomMultiLock = (name, color) => {
  return {
    name,
    type: KEY_TYPES.MULTI_LOCK,
    color,
    getChildrenToLock: rootValue => rootValue.getChildren(),
    isSingleKey: true,
    isSingleLock: false,
  }
}

const createRandomMultiKey = (name, color) => {
  return {
    name,
    type: KEY_TYPES.MULTI_KEY,
    color,
    getChildrenToLock: rootValue => rootValue.getChildren(),
    isSingleLock: true,
    isSingleKey: false,
  }
}

const transposeStepsToRandom = arrayOfSteps => {
  return arrayOfSteps.map(step => {
    switch (step.type) {
      case KEY_TYPES.NORMAL_KEY:
      case KEY_TYPES.SINGLE_LOCK_KEY:
      case KEY_TYPES.SINGLE_ROOM_PUZZLE:
      case KEY_TYPES.EXTERNAL_KEY:
        return createRandomLock(step.name, step.type, step.color)
      case KEY_TYPES.KEY_ITEM:
        return createRandomKeyItem(step.name, step.numberOfLocks)
      case KEY_TYPES.MULTI_LOCK:
        return createRandomMultiLock(step.name, step.color)
      case KEY_TYPES.MULTI_KEY:
        return createRandomMultiKey(step.name, step.color)
      default:
        console.log('we shouldnot be here')
        return createRandomLock(step.name, step.type, step.color)
    }
  })
}

const resultFromProbability = (randomizer, resultTable, pickedValue) => {
  const numberBetween0And100 = randomizer() * 100

  let currentValue = 0
  let found = false

  Object.keys(resultTable).forEach(keyType => {
    const probabilityValue = resultTable[keyType]
    if (!found) {
      currentValue += probabilityValue
      if (currentValue >= numberBetween0And100) {
        pickedValue = keyType
        found = true
      }
    }
  })

  return pickedValue
}

const createRandomSteps2 = (tree, currentStep, randomizer) => {
  // TODO - prevent single Locks from occuring at the same place, especially at the top of the tree
  // TODO - limit total amount of keys
  /*
    Take placement positions and create probability to add
    Probability increases the more steps there are that we add a miniboss or key item
    (should take multiKey and make it part of this rule instead, allocating its small probabilities equally between the largest three). Probability to add multiKey is 9/13 (for best dungeons) or 15/52 (for all dungeons)

    if not miniboss, and not keyItem, add another key type with the following probabilities:
        26 +  0.22 +  0.26 +  0.16 +  0.07 +  0.03
  */

  let puzzleLockId = 1
  let combatLockId = 1
  let externalLockId = 1
  let normalLockId = 1
  let singleLockId = 1

  const KEY_ITEM_PROBABILITIES = {
    1: 23,
    2: 23,
    3: 39,
    4: 15,
  }

  // Figure out key item gathering - should gather group based on the following probabilities
  // Algorithm -> check number of available children to lock. If four -> 2/13 chance to add.
  /*
    Total key: { 1: 3/13, 2: 3/13, 3: 5/13, 4: 2/13 }
 
    3-8:25
    3-13:22
    2-6:27
    1-13:28
    1-19:28
    4-11:20
    1-17:26
    3-15:24
    3-3:18
    4-10:30
    3-2:25
    2-7:16
    2-9:15
  */

  const randomObstacles = []

  let termination

  do {
    const randomProbability = randomizer()
    let newKey
    if (randomProbability < 0.27) {
      newKey = createRandomPuzzleLock(
        'puzzleLock' + puzzleLockId++,
        KEY_TYPES.SINGLE_ROOM_PUZZLE,
        'pink'
      )
    } else if (randomProbability < 0.27 + 0.23) {
      newKey = createRandomLock(
        'combatLock' + combatLockId++,
        KEY_TYPES.SINGLE_ROOM_PUZZLE,
        'silver'
      )
    } else if (randomProbability < 0.27 + 0.23 + 0.27) {
      newKey = createRandomLock('normalLock' + normalLockId++, KEY_TYPES.NORMAL_KEY, 'lightblue')
    } else if (randomProbability < 0.27 + 0.23 + 0.27 + 0.16) {
      newKey = createRandomLock('externalLock' + externalLockId++, KEY_TYPES.EXTERNAL_KEY, 'green')
    } else {
      newKey = createRandomLock('singleLock' + singleLockId++, KEY_TYPES.SINGLE_LOCK_KEY, 'orange')
    }
    termination = randomizer()

    randomObstacles.push(newKey)
  } while (termination > randomObstacles.length / 30 || randomObstacles.length < 15)

  const shouldAddMultiKeyProbability = randomizer()
  let insertionPoint
  if (shouldAddMultiKeyProbability < 15 / 52) {
    insertionPoint = Math.floor(randomizer() * randomObstacles.length)
    randomObstacles.splice(insertionPoint, 0, createRandomMultiKey('multiKey', 'cyan'))
  }

  insertionPoint = Math.floor(randomizer() * randomObstacles.length)
  const numberOfLocks = resultFromProbability(randomizer, KEY_ITEM_PROBABILITIES, 2)
  randomObstacles.splice(insertionPoint, 0, createRandomKeyItem('keyItem', numberOfLocks))

  insertionPoint = Math.floor(randomizer() * (randomObstacles.length / 2))
  randomObstacles.splice(insertionPoint, 0, createRandomMiniboss('miniboss'))

  const newTreeLength = tree.createRandomDungeon(currentStep, randomizer, randomObstacles)

  return {
    newTreeLength,
    obstacleSteps: randomObstacles,
  }
}

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
    isFirstRoom: true,
  }

  rooms.push(firstRoom)

  const isKeyWithSharedGate = (otherKeys, item) =>
    item.locked === false && item.locks.length === 1 && otherKeys.includes(item.locks[0])

  const hasSingleChild = node => node.children && node.children.length === 1

  const hasMoreDescendents = node => {
    if (node.children && node.children) {
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
            console.log('we are adding to a new room', shouldAddToExistingRoom)
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
            console.log('we are adding to a new room', shouldAddToExistingRoom)
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

  return rooms
}

const makeRandomDungeon = (currentStep, seedName, arrayOfSteps) => {
  if (!seedName) {
    seedName = generateSeedName()
  }
  const randomizer = AleaRandomizer(seedName)
  const tree = new Tree()
  let numberOfSteps
  let convertedSteps

  if (arrayOfSteps) {
    convertedSteps = transposeStepsToRandom(arrayOfSteps)
    numberOfSteps = tree.createRandomDungeon(currentStep, randomizer, convertedSteps)
  } else {
    const result = createRandomSteps2(tree, currentStep, randomizer)
    convertedSteps = result.obstacleSteps
    numberOfSteps = result.newTreeLength
  }

  const dungeonNodes = tree.draw()

  return {
    tree,
    randomizer,
    seedName,
    numberOfSteps,
    convertedSteps,
    nodes: dungeonNodes.nodes,
    connections: dungeonNodes.connections,
    keyLockConnections: dungeonNodes.keyLockConnections,
  }
}

export const createDungeons = currentStep => {
  let newDungeons = []
  // newDungeons.push(makeDungeon(currentStep, 'apple'))
  // newDungeons.push(makeDungeon(currentStep, 'apples'))
  // newDungeons.push(makeDungeon(currentStep, 'low'))
  // newDungeons.push(makeDungeon(currentStep, 'ap'))
  // newDungeons.push(makeDungeon(currentStep, 'skullWoods', skullWoods))
  // newDungeons.push(makeDungeon(currentStep, 'towerOfHera', towerOfHera))

  // newDungeons.push(makeDungeon(currentStep, 'rocsFeather', rocsFeather))
  // newDungeons.push(makeDungeon(currentStep, 'windTemple', windTemple))
  newDungeons.push(makeDungeon(currentStep, 'sandShip', sandShip))

  newDungeons.push(makeDungeon(currentStep, 'gnarledRoot', gnarledRoot))
  newDungeons.push(makeDungeon(currentStep, 'dancingDragon', dancingDragon))
  newDungeons.push(makeDungeon(currentStep, 'unicornsCave', unicornsCave))
  newDungeons.push(makeDungeon(currentStep, 'swordAndShield', swordAndShield))

  newDungeons.push(makeDungeon(currentStep, 'spiritsGrave', spiritsGrave))
  newDungeons.push(makeDungeon(currentStep, 'moonlightGrotto', moonlightGrotto))
  newDungeons.push(makeDungeon(currentStep, 'mermaidsCave', mermaidsCave))
  newDungeons.push(makeDungeon(currentStep, 'jabujabuOracle', jabujabuOracle))

  newDungeons.push(makeDungeon(currentStep, 'gnarledRoot2', gnarledRoot2))
  newDungeons.push(makeDungeon(currentStep, 'snakeRemains', snakeRemains))
  newDungeons.push(makeDungeon(currentStep, 'poisonMoth', poisonMoth))
  newDungeons.push(makeDungeon(currentStep, 'dancingDragon2', dancingDragon2))
  newDungeons.push(makeDungeon(currentStep, 'unicornsCave2', unicornsCave2))
  newDungeons.push(makeDungeon(currentStep, 'ancientRuins', ancientRuins))
  newDungeons.push(makeDungeon(currentStep, 'explorersCrypt', explorersCrypt))
  newDungeons.push(makeDungeon(currentStep, 'swordAndShield2', swordAndShield2))

  newDungeons.push(makeDungeon(currentStep, 'spiritsGrave2', spiritsGrave2))
  newDungeons.push(makeDungeon(currentStep, 'wingDungeon', wingDungeon))
  newDungeons.push(makeDungeon(currentStep, 'moonlitGrotto', moonlitGrotto))
  newDungeons.push(makeDungeon(currentStep, 'skullDungeon', skullDungeon))
  newDungeons.push(makeDungeon(currentStep, 'crownDungeon', crownDungeon))
  newDungeons.push(makeDungeon(currentStep, 'mermaidsCave2', mermaidsCave2))
  newDungeons.push(makeDungeon(currentStep, 'jabujabuBelly', jabujabuBelly))
  newDungeons.push(makeDungeon(currentStep, 'ancientTomb', ancientTomb))

  newDungeons.push(makeDungeon(currentStep, 'jabujabuOcarina', jabujabuOcarina))
  newDungeons.push(makeDungeon(currentStep, 'forestTemple', forestTemple))
  newDungeons.push(makeDungeon(currentStep, 'fireTemple', fireTemple))
  newDungeons.push(makeDungeon(currentStep, 'waterTemple', waterTemple))
  newDungeons.push(makeDungeon(currentStep, 'waterTemple2', waterTemple2))
  newDungeons.push(makeDungeon(currentStep, 'shadowTemple', shadowTemple))
  newDungeons.push(makeDungeon(currentStep, 'shadowTemple2', shadowTemple2))
  newDungeons.push(makeDungeon(currentStep, 'spiritTemple', spiritTemple))

  newDungeons.push(makeDungeon(currentStep, 'fortressOfWinds', fortressOfWinds))
  newDungeons.push(makeDungeon(currentStep, 'fortressOfWinds2', fortressOfWinds2))
  newDungeons.push(makeDungeon(currentStep, 'faceShrine', faceShrine))
  newDungeons.push(makeDungeon(currentStep, 'palaceOfDarkness', palaceOfDarkness))
  newDungeons.push(makeDungeon(currentStep, 'greatBayTemple', greatBayTemple))
  newDungeons.push(makeDungeon(currentStep, 'explorersCave', explorersCave))
  newDungeons.push(makeDungeon(currentStep, 'stoneTowerTemple', stoneTowerTemple))
  newDungeons.push(makeDungeon(currentStep, 'tailCave', tailCave))
  newDungeons.push(makeDungeon(currentStep, 'earthTemple', earthTemple))
  newDungeons.push(makeDungeon(currentStep, 'towerOfTheGods', towerOfTheGods))
  newDungeons.push(makeDungeon(currentStep, 'deepwoodShrine', deepwoodShrine))
  newDungeons.push(makeDungeon(currentStep, 'palaceOfWinds', palaceOfWinds))
  newDungeons.push(makeDungeon(currentStep, 'forestTempleTwilight', forestTempleTwilight))
  newDungeons.push(makeDungeon(currentStep, 'snowPeakRuins', snowPeakRuins))
  newDungeons.push(makeDungeon(currentStep, 'skyViewTemple', skyViewTemple))
  newDungeons.push(makeDungeon(currentStep, 'desertPalace', desertPalace))
  newDungeons.push(makeDungeon(currentStep, 'turtleRock', turtleRock))
  newDungeons.push(makeDungeon(currentStep, 'dragonRoostCavern', dragonRoostCavern))

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

  // newDungeons.push(makeRandomDungeon(currentStep, 'apples', swordAndShield))
  // newDungeons.push(makeRandomDungeon(currentStep, undefined, fortressOfWinds2))
  // newDungeons.push(makeRandomDungeon(currentStep, undefined, dancingDragon))
  // newDungeons.push(makeRandomDungeon(currentStep, undefined, waterTemple))
  // newDungeons.push(makeRandomDungeon(currentStep, 1544562670984.7566, waterTemple)) // Decent Water temple
  // newDungeons.push(makeRandomDungeon(currentStep, 1544562760739.3171, waterTemple)) // Impossible water temple
  // newDungeons.push(makeRandomDungeon(currentStep, undefined, waterTemple2))
  // newDungeons.push(makeRandomDungeon(currentStep, 1550663388801.0613))

  const fixed = false

  if (fixed) {
    // const currentDungeon = makeRandomDungeon(currentStep, 1550962391952.9353)
    const currentDungeon = makeRandomDungeon(currentStep, 1551628833378.7515)
    const dungeonInfo = verifyDungeon(currentDungeon)
    newDungeons.push(currentDungeon)
    const rooms = createRoomsFromSteps(dungeonInfo, currentDungeon.randomizer)
    console.log('rooms', rooms)
  } else {
    let tries = 0

    while (tries++ < 1000) {
      const currentDungeon = makeRandomDungeon(currentStep)
      const dungeonInfo = verifyDungeon(currentDungeon)
      const dungeonScore = calculateDungeonScore(dungeonInfo)
      if (dungeonScore.criticalPathDistance / dungeonScore.numberOfNodes > 5) {
        newDungeons.push(currentDungeon)
        const rooms = createRoomsFromSteps(dungeonInfo, currentDungeon.randomizer)
        console.log('rooms', rooms)
        break
      }
    }
  }

  return newDungeons
}
