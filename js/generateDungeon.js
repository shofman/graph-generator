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

const getAllSubsets = arrayOfChildren => 
  arrayOfChildren.reduce(
    (subsets, value) => subsets.concat(
     subsets.map(set => [value,...set])
    ),
    [[]]
  ).filter(item => item.length !== 0)

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

  getKeys() {
    return this.keys
  }

  calculateHeight() {
    const calculatedHeight = !!this.parent ? this.parent.calculateHeight() + 1 : 0
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

  addObstacle({ name, numberOfLocks, numberOfKeys, type, color, childrenToLock }) {
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
    })
    addedKeys.forEach(key => {
      key.setLocks(addedLocks)
      key.setType(type)
    })

    return addedLocks.concat(addedKeys)
  }

  addRandomObstacle({
    name,
    type,
    isSingleLock,
    isSingleKey,
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

    childrenToLock = childrenToLock.filter(child => {
      if (child.type === KEY_TYPES.SINGLE_ROOM_PUZZLE) {
        isLockingSingleRoom = true
      }
      return (child.type !== KEY_TYPES.EXTERNAL_KEY) || (child.type === KEY_TYPES.EXTERNAL_KEY && child.locked)
    })

    let nodeSubsets = getAllSubsets(childrenToLock)

    if (isLockingSingleRoom) {
      nodeSubsets = nodeSubsets.filter(subsetArray => {
        const result = subsetArray.reduce((total, key) => {
          if (key.type === KEY_TYPES.SINGLE_ROOM_PUZZLE) {
            return total + 1
          }
          return total
        }, 0)
        if (result === 2) {
          return true
        }
        if (subsetArray.every(item => item.type !== KEY_TYPES.SINGLE_ROOM_PUZZLE)) {
          return true
        }
        return false
      })
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
          subsetToAdd && subsetToAdd.forEach(node => {
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
      const numberOfKeys = [2,3,4,5]
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
    })
    addedKeys.forEach(key => {
      key.setLocks(addedLocks)
      key.setType(type)
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
    let rooms = []

    const drawQueue = []

    drawQueue.push(this.rootValue)
    rooms.push(this.rootValue.getValue())

    while (drawQueue.length) {
      const currentValue = drawQueue[0]
      if (currentValue.isLocked()) {
      }
      const childrenToDraw = currentValue.getChildren()

      if (childrenToDraw.length) {
        const childrenNodes = childrenToDraw.map(item => {
          connections.push(createConnection(currentValue.getValue().id, item.getValue().id))
          if (item.keys.length) {
            item.keys.forEach(key => keyLockConnections.push(createConnection(key.getValue().id, item.getValue().id)))
          }
          drawQueue.push(item)
          return item.getValue()
        })

        rooms = rooms.concat(childrenNodes)
      }
      drawQueue.shift()
    }

    const unique = [...new Set(rooms.filter(item => item.id))]

    return {
      rooms: unique,
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
      getChildrenToLock: () => [endNode]
    }
  }

  createHardCodedDungeon(step, uniqueObstacles) {
    const baseObstacles = [this.createBossObstacle(this.addEndState())]
    const obstacles = baseObstacles.concat(uniqueObstacles)
    this.addDungeonObstacles(obstacles, step)
    return obstacles.length
  }

  createRandomDungeon(step, seedName, uniqueObstacles) {
    const baseObstacles = [this.createRandomBossObstacle(this.addEndState())]
    const obstacles = baseObstacles.concat(uniqueObstacles)
    this.addRandomDungeonObstacles(obstacles, step, seedName)

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

  addDungeonObstacles(obstacles, step) {
    const obstaclesToDraw = obstacles.slice(0, step)
    obstaclesToDraw.forEach(obstacle => {
      const addedObstacles = this.rootValue.addObstacle(Object.assign(obstacle, {
        childrenToLock: obstacle.getChildrenToLock(this.rootValue)
      }))
    })
  }

  addRandomDungeonObstacles(obstacles, step, randomizer) {
    const obstaclesToDraw = obstacles.slice(0, step)
    obstaclesToDraw.forEach(obstacle => {
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

const AleaRandomizer = seed => {
  function Mash() {
    var n = 4022871197
    return function(r) {
      for (var t, s, u = 0, e = 0.02519603282416938; u < r.length; u++)
        (s = r.charCodeAt(u)),
          (f = e * (n += s) - ((n * e) | 0)),
          (n = 4294967296 * ((t = f * ((e * n) | 0)) - (t | 0)) + (t | 0))
      return (n | 0) * 2.3283064365386963e-10
    }
  }
  return (function() {
    var m = Mash(),
      a = m(' '),
      b = m(' '),
      c = m(' '),
      x = 1,
      y
    ;(seed = seed.toString()), (a -= m(seed)), (b -= m(seed)), (c -= m(seed))
    a < 0 && a++, b < 0 && b++, c < 0 && c++
    return function() {
      var y = x * 2.3283064365386963e-10 + a * 2091639
      ;(a = b), (b = c)
      return (c = y - (x = y | 0))
    }
  })()
}

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
    rooms: dungeonNodes.rooms,
    connections: dungeonNodes.connections,
    keyLockConnections: dungeonNodes.keyLockConnections,
  }
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
      break
      case KEY_TYPES.KEY_ITEM:
        return createRandomKeyItem(step.name, step.numberOfLocks)
      break
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

const createRandomSteps = (randomizer) => {
  // TODO - change this to be dependent on `dungeon difficulty`
  // TODO - change the probabilities to be based off number of current nodes
   // TODO - add in new dungeon types (miniboss, puzzle rooms, combat rooms)
   // TODO - Allow for key items to be used further along within the dungeon 
   //     (e.g. create key item, and then add to a point further down - see dancing dragon dungeon for slingshot example)
  const ADD_MULTI_LOCK_PROBABILITY = .1
  const ADD_MULTI_KEY_PROBABILITY = .15
  const NORMAL_KEY_PROBABILITIES = [1, .9, .8, .6, .3, .2, .1, .1]
  const KEY_ITEM_PROBABILITIES = {
    1: 20,
    2: 50,
    3: 20,
    4: 10,
  }

  // Need to add miniboss potential here
  // Need to worry about floating point precision here (hooray Javascript)
  // multiLock should be prioritized in the middle,
  // Mulitkey can be whenever
  // Need to determine whether the single room puzzle is more agility/combat focussed, or a problem to solve
  const stillNeedToAddKeyItemProbability = {
    [KEY_TYPES.NORMAL_KEY]: 20,
    [KEY_TYPES.KEY_ITEM]: 50,
    [KEY_TYPES.SINGLE_ROOM_PUZZLE]: 10,
    [KEY_TYPES.SINGLE_LOCK_KEY]: 10,
    [KEY_TYPES.EXTERNAL_KEY]: 5,
  }
  // TODO - come up with non-tired name
  const nonKeyItemProbability = {
   [KEY_TYPES.NORMAL_KEY]: 30,
   [KEY_TYPES.SINGLE_ROOM_PUZZLE]: 20,
   [KEY_TYPES.SINGLE_LOCK_KEY]: 20,
   [KEY_TYPES.EXTERNAL_KEY]: 15, 
  }
  const addableItems = [KEY_TYPES.NORMAL_KEY, KEY_TYPES.KEY_ITEM, KEY_TYPES.SINGLE_ROOM_PUZZLE, KEY_TYPES.SINGLE_LOCK_KEY, KEY_TYPES.EXTERNAL_KEY]

  // TODO - handle case where we have both multiLock and multiKey = probability is over 1
  const shouldHaveMultiLock = randomizer() <= ADD_MULTI_LOCK_PROBABILITY
  if (shouldHaveMultiLock) {
    addableItems.push(KEY_TYPES.MULTI_LOCK)
    stillNeedToAddKeyItemProbability[KEY_TYPES.MULTI_LOCK] = 5
    nonKeyItemProbability[KEY_TYPES.MULTI_LOCK] = 15
  }

  const shouldHaveMultiKey = randomizer() <= ADD_MULTI_KEY_PROBABILITY
  if (shouldHaveMultiKey) { 
    addableItems.push(KEY_TYPES.MULTI_KEY)
    stillNeedToAddKeyItemProbability[KEY_TYPES.MULTI_KEY] = 10
    stillNeedToAddKeyItemProbability[KEY_TYPES.SINGLE_LOCK_KEY] = 5
    nonKeyItemProbability[KEY_TYPES.MULTI_KEY] = 15
  }

  if (!shouldHaveMultiKey && !shouldHaveMultiLock) {
    stillNeedToAddKeyItemProbability[KEY_TYPES.SINGLE_LOCK_KEY] += 5
    stillNeedToAddKeyItemProbability[KEY_TYPES.SINGLE_ROOM_PUZZLE] += 5
    stillNeedToAddKeyItemProbability[KEY_TYPES.NORMAL_KEY] -= 5

    nonKeyItemProbability[KEY_TYPES.SINGLE_ROOM_PUZZLE] = 25
    nonKeyItemProbability[KEY_TYPES.SINGLE_LOCK_KEY] = 25
    nonKeyItemProbability[KEY_TYPES.EXTERNAL_KEY] = 20 
  }

  const keyNames = ['firstLock', 'secondLock', 'thirdLock', 'fourthLock', 'fifthLock', 'sixthLock', 'seventhLock', 'eighthLock']
  let finishedGenerating = false
  let finishedAddingNormalKeys = false
  let finishedAddingMultiKeys = false
  let finishedAddingMultiLocks = false
  let finishedAddingKeyItem = false

  if (keyNames.length !== NORMAL_KEY_PROBABILITIES.length) {
    alert('something is wrong')
  }

  const addedNormalKeys = []
  const randomObstacles = []

  const maxTries = 100
  let tries = 0

  let singlePuzzleId = 1
  let singleLockId = 1
  let externalId = 1
  let multiLockId = 1
  let multiKeyId = 1

  do {
    // Pick an eligible candidate to add 
    // TODO - Adjust probabilities based off current children groups as well (e.g. avoid having a flat row of keys)
    // Check if the probability of adding it is good
      // Yes - 
    const probabilityToUse = finishedAddingKeyItem ? nonKeyItemProbability : stillNeedToAddKeyItemProbability
    const keyTypeToAdd = resultFromProbability(randomizer, probabilityToUse, KEY_TYPES.NORMAL_KEY)

    if (keyTypeToAdd === KEY_TYPES.NORMAL_KEY) {
      const keyResult = randomizer()

      if (keyResult >= 1-NORMAL_KEY_PROBABILITIES[addedNormalKeys.length] && !finishedAddingNormalKeys) {
        const keyName = keyNames[addedNormalKeys.length]
        const newKey = createRandomLock(keyName, keyTypeToAdd, 'lightblue')
        addedNormalKeys.push(newKey)
        randomObstacles.push(newKey)
      } else {
        finishedAddingNormalKeys = true
      }
    } else if (keyTypeToAdd === KEY_TYPES.SINGLE_ROOM_PUZZLE) {
      const newKey = createRandomLock('puzzle' + singlePuzzleId++, keyTypeToAdd, 'silver')
      randomObstacles.push(newKey)
    } else if (keyTypeToAdd === KEY_TYPES.SINGLE_LOCK_KEY) {
      const newKey = createRandomLock('singleLock' + singleLockId++, keyTypeToAdd, 'orange')
      randomObstacles.push(newKey)
    } else if (keyTypeToAdd === KEY_TYPES.KEY_ITEM) {
      const numberOfLocks = resultFromProbability(randomizer, KEY_ITEM_PROBABILITIES, 2)
      const newKey = createRandomKeyItem('keyItem')
      randomObstacles.push(newKey)

      // Remove from pool once added
      // delete stillNeedToAddKeyItemProbability[keyTypeToAdd]
      finishedAddingKeyItem = true
    } else if (keyTypeToAdd === KEY_TYPES.EXTERNAL_KEY) {
      const newKey = createRandomLock('externalKey' + externalId++, keyTypeToAdd, 'green')
      randomObstacles.push(newKey)
    } else if (keyTypeToAdd === KEY_TYPES.MULTI_LOCK) {
      const newKey = createRandomLock('multiLock' + multiLockId++, keyTypeToAdd, 'cyan')
      randomObstacles.push(newKey)
    } else if (keyTypeToAdd === KEY_TYPES.MULTI_KEY) {
      const newKey = createRandomLock('multiKey' + multiKeyId++, keyTypeToAdd, 'cyan')
      randomObstacles.push(newKey)
    } else {
      console.log('gotta handle this', keyTypeToAdd)
    }

    finishedGenerating = finishedAddingNormalKeys && finishedAddingKeyItem
  } while (++tries < maxTries && !finishedGenerating)

  return randomObstacles

  // Rules
  // Max eight locks per dungeon - once this limit is reached, we can only return other types of locks
  // One key item per dungeon - try to place earlier (so that it is found later)
  // Ensure that external items cannot be locked off (e.g. bombs must be available at the start (since they are not the key item))
  // Figure out a way of encouraging a sophisticated form of locking - maybe to do with prioritizing keys over gates, or increasing the probabilities of locking for items without children
  // If including single room puzzles, ensure that the key and the lock are tied together (both locked and accessible at the same time)
  // Only one multi-lock per dungeon
  // Only one multi-key per dungeon (barring the monkey aggregation one)
  // If there is a multi-lock already, then the probability to include a multikey should be reduced. The opposite is also true
  
}

const makeRandomDungeon = (currentStep, seedName, arrayOfSteps) => {
  if (!seedName) {
    seedName = generateSeedName()
  }
  const randomizer = AleaRandomizer(seedName)
  const tree = new Tree()
  let convertedSteps
  if (arrayOfSteps) {
    convertedSteps = transposeStepsToRandom(arrayOfSteps)
  } else {
    convertedSteps = createRandomSteps(randomizer)
  }
  const numberOfSteps = tree.createRandomDungeon(currentStep, randomizer, convertedSteps)
  const dungeonNodes = tree.draw()

  return {
    tree,
    seedName,
    numberOfSteps,
    convertedSteps,
    rooms: dungeonNodes.rooms,
    connections: dungeonNodes.connections,
    keyLockConnections: dungeonNodes.keyLockConnections,
  }
}

const createDungeons = (currentStep) => {
  let newDungeons = []
  // newDungeons.push(makeDungeon(currentStep, 'apple'))
  // newDungeons.push(makeDungeon(currentStep, 'apples'))
  // newDungeons.push(makeDungeon(currentStep, 'low'))
  // newDungeons.push(makeDungeon(currentStep, 'ap'))
  // newDungeons.push(makeDungeon(currentStep, 'skullWoods', skullWoods))
  // newDungeons.push(makeDungeon(currentStep, 'towerOfHera', towerOfHera))

  // newDungeons.push(makeDungeon(currentStep, 'rocsFeather', rocsFeather))
  // newDungeons.push(makeDungeon(currentStep, 'windTemple', windTemple))
  // newDungeons.push(makeDungeon(currentStep, 'sandShip', sandShip))
  
  // newDungeons.push(makeDungeon(currentStep, 'gnarledRoot', gnarledRoot))
  // newDungeons.push(makeDungeon(currentStep, 'dancingDragon', dancingDragon))
  // newDungeons.push(makeDungeon(currentStep, 'unicornsCave', unicornsCave))
  // newDungeons.push(makeDungeon(currentStep, 'swordAndShield', swordAndShield))

  // newDungeons.push(makeDungeon(currentStep, 'spiritsGrave', spiritsGrave))
  // newDungeons.push(makeDungeon(currentStep, 'moonlightGrotto', moonlightGrotto))
  // newDungeons.push(makeDungeon(currentStep, 'mermaidsCave', mermaidsCave))
  // newDungeons.push(makeDungeon(currentStep, 'jabujabuOracle', jabujabuOracle))
  
  // newDungeons.push(makeDungeon(currentStep, 'gnarledRoot2', gnarledRoot2))
  // newDungeons.push(makeDungeon(currentStep, 'snakeRemains', snakeRemains))
  // newDungeons.push(makeDungeon(currentStep, 'poisonMoth', poisonMoth))
  newDungeons.push(makeDungeon(currentStep, 'dancingDragon2', dancingDragon2))
  newDungeons.push(makeDungeon(currentStep, 'unicornsCave2', unicornsCave2))
  // newDungeons.push(makeDungeon(currentStep, 'ancientRuins', ancientRuins))
  newDungeons.push(makeDungeon(currentStep, 'explorersCrypt', explorersCrypt))
  newDungeons.push(makeDungeon(currentStep, 'swordAndShield2', swordAndShield2))
  
  // newDungeons.push(makeDungeon(currentStep, 'spiritsGrave2', spiritsGrave2))
  // newDungeons.push(makeDungeon(currentStep, 'wingDungeon', wingDungeon))
  // newDungeons.push(makeDungeon(currentStep, 'moonlitGrotto', moonlitGrotto))
  // newDungeons.push(makeDungeon(currentStep, 'skullDungeon', skullDungeon))
  newDungeons.push(makeDungeon(currentStep, 'crownDungeon', crownDungeon))
  newDungeons.push(makeDungeon(currentStep, 'mermaidsCave2', mermaidsCave2))
  // newDungeons.push(makeDungeon(currentStep, 'jabujabuBelly', jabujabuBelly))
  newDungeons.push(makeDungeon(currentStep, 'ancientTomb', ancientTomb))
  
  // newDungeons.push(makeDungeon(currentStep, 'jabujabuOcarina',jabujabuOcarina))
  newDungeons.push(makeDungeon(currentStep, 'forestTemple', forestTemple))
  newDungeons.push(makeDungeon(currentStep, 'fireTemple', fireTemple))
  // newDungeons.push(makeDungeon(currentStep, 'waterTemple', waterTemple))
  newDungeons.push(makeDungeon(currentStep, 'waterTemple2', waterTemple2))
  // // newDungeons.push(makeDungeon(currentStep, 'shadowTemple', shadowTemple))
  // newDungeons.push(makeDungeon(currentStep, 'shadowTemple2', shadowTemple2))
  // newDungeons.push(makeDungeon(currentStep, 'spiritTemple', spiritTemple))
  
  // newDungeons.push(makeDungeon(currentStep, 'fortressOfWinds', fortressOfWinds))
  // newDungeons.push(makeDungeon(currentStep, 'faceShrine', faceShrine))
  // newDungeons.push(makeDungeon(currentStep, 'palaceOfDarkness', palaceOfDarkness))
  // newDungeons.push(makeDungeon(currentStep, 'greatBayTemple', greatBayTemple))
  // newDungeons.push(makeDungeon(currentStep, 'explorersCave', explorersCave))
  // newDungeons.push(makeDungeon(currentStep, 'stoneTowerTemple', stoneTowerTemple))
  // newDungeons.push(makeDungeon(currentStep, 'tailCave', tailCave))
  // newDungeons.push(makeDungeon(currentStep, 'earthTemple', earthTemple))
  // newDungeons.push(makeDungeon(currentStep, 'towerOfTheGods', towerOfTheGods))
  // newDungeons.push(makeDungeon(currentStep, 'deepwoodShrine', deepwoodShrine))
  // newDungeons.push(makeDungeon(currentStep, 'palaceOfWinds', palaceOfWinds))
  // newDungeons.push(makeDungeon(currentStep, 'forestTempleTwilight', forestTempleTwilight))
  // newDungeons.push(makeDungeon(currentStep, 'snowPeakRuins', snowPeakRuins))
  // newDungeons.push(makeDungeon(currentStep, 'skyViewTemple', skyViewTemple))
  // newDungeons.push(makeDungeon(currentStep, 'desertPalace', desertPalace))
  // newDungeons.push(makeDungeon(currentStep, 'turtleRock', turtleRock))
  // newDungeons.push(makeDungeon(currentStep, 'dragonRoostCavern', dragonRoostCavern))

  const toShow = [
    // 'explorersCrypt',
    // 'waterTemple2',
    // 'shadowTemple2',
    // 'spiritTemple',
    // 'palaceOfDarkness'
  ]

  let averageKeyItemPos = 0
  let averageNumberOfSteps = 0
  let leastAmountOfSteps = 100
  let totalLength = newDungeons.length

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

  // console.log('average position of key item is', averageKeyItemPos)
  // console.log('averageNumberOfSteps', averageNumberOfSteps)
  // console.log('leastAmountOfSteps', leastAmountOfSteps)

  // newDungeons.push(makeRandomDungeon(currentStep, 'apples', swordAndShield))
  // newDungeons.push(makeRandomDungeon(currentStep, undefined, swordAndShield))
  // newDungeons.push(makeRandomDungeon(currentStep, undefined, dancingDragon))
  // newDungeons.push(makeRandomDungeon(currentStep, undefined, waterTemple))
  // newDungeons.push(makeRandomDungeon(currentStep, 1544562670984.7566, waterTemple)) // Decent Water temple
  // newDungeons.push(makeRandomDungeon(currentStep, 1544562760739.3171, waterTemple)) // Impossible water temple
  // newDungeons.push(makeRandomDungeon(currentStep, undefined, waterTemple2))

  let tries = 0

  while (tries++ < 1000) {
    const currentDungeon = makeRandomDungeon(currentStep)
    if (calculateDungeonScore(verifyDungeon(currentDungeon)).criticalPathDistance > 140) {
      newDungeons.push(currentDungeon)
      break
    }
  }
  return newDungeons
}

findNode = (path, name) => {
  return path.filter(node => node.name === name).pop()
}


