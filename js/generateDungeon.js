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

const KEY_TYPES = {
  BOSS: 'boss',
  NORMAL_KEY: 'key',
  KEY_ITEM: 'key_item',
  MULTI_KEY: 'multiKey',
  MULTI_LOCK: 'multiLock',
  SINGLE_LOCK_KEY: 'singleKeyLock',
  UNKNOWN: 'unknown',
}

const getAllSubsets = theArray => 
  theArray.reduce(
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
    return this.getChildren().filter(child => arrayOfChildren.includes(child.value.label))
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
      this.removeChild(child)
      lockNode.addChild(child)
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

    // Cluster children before iterating over the clusters?
    // Need to have a generic limit for items - shouldn't have ten locks for a single type of key
    // Group based on probability from number of entries on rootLevel

    let nodeSubsets = getAllSubsets(childrenToLock)

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
      this.insertLock(lockNode, [childToLock])
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

    addedLocks.forEach(lock => lock.setKeys(addedKeys))
    addedKeys.forEach(key => key.setLocks(addedLocks))
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

  createLockObstacle(name, getChildrenToLock) {
    return {
      name,
      type: KEY_TYPES.NORMAL_KEY,
      numberOfLocks: 1,
      numberOfKeys: 1,
      color: 'lightblue',
      getChildrenToLock,
    }
  }

  gnarledRoot(step) {
    const obstacles = [
      this.createBossObstacle(this.addEndState()),
      this.createLockObstacle('firstLock', rootValue => rootValue.getUnlockedChildren()),
      {
        name: 'arrow',
        type: KEY_TYPES.KEY_ITEM,
        numberOfLocks: 3,
        numberOfKeys: 1,
        color: 'lightgreen',
        getChildrenToLock: rootValue => rootValue.getChildren(),
      },
      this.createLockObstacle('secondLock', rootValue => rootValue.getUnlockedChildren()),
      {
        name: 'aLock',
        type: KEY_TYPES.SINGLE_LOCK_KEY,
        numberOfLocks: 1,
        numberOfKeys: 1,
        color: 'orange',
        getChildrenToLock: rootValue =>
          rootValue.getChildren().filter(child => child.value.label === 'arrowGate3'),
      },
      this.createLockObstacle('thirdLock', rootValue =>
        rootValue.getChildren().filter(
          child => child.value.label === 'aLockGate' || child.value.label === 'arrowGate2'
        )
      ),
      this.createLockObstacle('fourthLock', rootValue =>
        rootValue.getChildren().filter(
          child =>
            child.value.label === 'aLockKey' ||
            child.value.label === 'thirdLockGate' ||
            child.value.label === 'thirdLockKey'
        )
      ),
    ]

    this.addDungeonObstacles(obstacles, step)

    return obstacles.length
  }

  moonlightGrotto(step) {
    const obstacles = [
      this.createBossObstacle(this.addEndState()),
      this.createLockObstacle('firstLock', rootValue => rootValue.getLockedChildren()),
      {
        name: 'crystal',
        type: KEY_TYPES.MULTI_KEY,
        numberOfLocks: 1,
        numberOfKeys: 4,
        color: 'lightgreen',
        getChildrenToLock: rootValue => rootValue.getUnlockedChildren(),
      },
      {
        name: 'seedShooter',
        type: KEY_TYPES.KEY_ITEM,
        numberOfLocks: 2,
        numberOfKeys: 1,
        color: 'orange',
        getChildrenToLock: rootValue => rootValue.getFilteredChildren(['firstLockGate', 'crystal4Key']),
      },
      this.createLockObstacle('secondLock', rootValue => rootValue.getFilteredChildren(['seedShooterKey'])),
      this.createLockObstacle('thirdLock', rootValue => rootValue.getFilteredChildren(['secondLockGate'])),
      this.createLockObstacle('fourthLock', rootValue =>
        rootValue.getFilteredChildren(['seedShooterGate1', 'seedShooterGate2', 'crystalGate', 'crystal3Key', 'thirdLockGate', 'secondLockKey'])
      ),
    ]

    this.addDungeonObstacles(obstacles, step)

    return obstacles.length
  }

  rocsFeather(step) {
    const obstacles = [
      this.createBossObstacle(this.addEndState()),
      this.createLockObstacle('firstLock', rootValue => rootValue.getUnlockedChildren()),
      this.createLockObstacle('secondLock', rootValue => rootValue.getFilteredChildren(['bossGate'])),
      {
        name: 'switchPanel',
        type: KEY_TYPES.SINGLE_LOCK_KEY,
        numberOfLocks: 1,
        numberOfKeys: 1,
        color: 'orange',
        getChildrenToLock: rootValue => rootValue.getFilteredChildren(['firstLockGate', 'firstLockKey', 'secondLockGate']),
      },
      this.createLockObstacle('thirdLock', rootValue => rootValue.getFilteredChildren(['switchPanelGate'])),
      {
        name: 'rocsFeather',
        type: KEY_TYPES.KEY_ITEM,
        numberOfLocks: 3,
        numberOfKeys: 1,
        color: 'lightgreen',
        getChildrenToLock: rootValue => rootValue.getFilteredChildren(['switchPanelKey', 'secondLockKey', 'thirdLockKey']),
      },
      this.createLockObstacle('fourthLock', rootValue => rootValue.getFilteredChildren(['rocsFeatherGate1', 'rocsFeatherGate3', 'rocsFeatherKey', 'thirdLockGate'])),
      this.createLockObstacle('fifthLock', rootValue => rootValue.getFilteredChildren(['fourthLockGate', 'fourthLockKey'])),
    ]

    this.addDungeonObstacles(obstacles, step)

    return obstacles.length
  }

  shadowTemple(step) {
    const obstacles = [
      this.createBossObstacle(this.addEndState()),
      this.createLockObstacle('firstLock', rootValue => rootValue.getFilteredChildren(['bossGate'])),
      this.createLockObstacle('secondLock', rootValue => rootValue.getFilteredChildren(['firstLockKey', 'bossKey', 'firstLockGate'])),
      this.createLockObstacle('thirdLock', rootValue => rootValue.getFilteredChildren(['secondLockGate', 'secondLockKey'])),
      this.createLockObstacle('fourthLock', rootValue => rootValue.getFilteredChildren(['thirdLockGate', 'thirdLockKey'])),
      this.createLockObstacle('fifthLock', rootValue => rootValue.getFilteredChildren(['fourthLockGate', 'fourthLockKey'])),
      {
        name: 'hoverboots',
        type: KEY_TYPES.KEY_ITEM,
        numberOfLocks: 1,
        numberOfKeys: 1,
        color: 'lightgreen',
        getChildrenToLock: rootValue => rootValue.getFilteredChildren(['fifthLockGate', 'fifthLockKey']),
      },
    ]

    this.addDungeonObstacles(obstacles, step)

    return obstacles.length
  }

  waterTemple(step) {
    const obstacles = [
      this.createBossObstacle(this.addEndState()),
      this.createLockObstacle('firstLock', rootValue => rootValue.getUnlockedChildren()),
      this.createLockObstacle('secondLock', rootValue => rootValue.getFilteredChildren(['firstLockGate'])),
      {
        name: 'longshot',
        type: KEY_TYPES.KEY_ITEM,
        numberOfLocks: 3,
        numberOfKeys: 1,
        color: 'lightgreen',
        getChildrenToLock: rootValue => rootValue.getFilteredChildren(['secondLockKey', 'secondLockGate', 'bossGate']),
      },
      this.createLockObstacle('thirdLock', rootValue => rootValue.getFilteredChildren(['longshotKey', 'firstLockKey'])),
      this.createLockObstacle('fourthLock', rootValue => rootValue.getFilteredChildren(['thirdLockGate'])),
      {
        name: 'level3Water',
        type: KEY_TYPES.MULTI_LOCK,
        numberOfLocks: 2,
        numberOfKeys: 1,
        color: 'orange',
        getChildrenToLock: rootValue => rootValue.getFilteredChildren(['longshotGate1', 'fourthLockGate'])
      },
      this.createLockObstacle('fifthLock', rootValue => rootValue.getFilteredChildren(['level3WaterKey'])),
      {
        name: 'level2Water',
        type: KEY_TYPES.SINGLE_LOCK_KEY,
        numberOfLocks: 1,
        numberOfKeys: 1,
        color: 'orange',
        getChildrenToLock: rootValue => rootValue.getFilteredChildren(['fifthLockGate', 'longshotGate3', 'thirdLockKey', 'fourthLockKey']),
      },
      this.createLockObstacle('sixthLock', rootValue => rootValue.getFilteredChildren(['level2WaterGate', 'level2WaterKey'])),
      {
        name: 'level1Water',
        type: KEY_TYPES.SINGLE_LOCK_KEY,
        numberOfLocks: 1,
        numberOfKeys: 1,
        color: 'orange',
        getChildrenToLock: rootValue => rootValue.getFilteredChildren(['longshotGate2', 'sixthLockGate', 'fifthLockKey', 'sixthLockKey']),
      },
    ]

    this.addDungeonObstacles(obstacles, step)

    return obstacles.length
  }

  createRandomLock(name) {
    return {
      name,
      color: 'lightblue',
      getChildrenToLock: rootValue => rootValue.getChildren(),
      isSingleLock: true,
      isSingleKey: true,
    }
  }

  createRandomBossObstacle(endNode) {
    return {
      name: 'boss',
      color: 'red',
      getChildrenToLock: () => [endNode],
      isSingleKey: true,
      isSingleLock: true,
      probabilityToAdd: '100',
    }
  }

  randomCreation(step, seedName) {
    const obstacles = [
      this.createRandomBossObstacle(this.addEndState()),
      this.createRandomLock('firstLock'),
      {
        name: 'arrow',
        color: 'lightgreen',
        getChildrenToLock: rootValue => rootValue.getChildren(),
        isSingleKey: true,
        isSingleLock: false,
      },
      this.createRandomLock('secondLock'),
      {
        name: 'aLock',
        color: 'orange',
        getChildrenToLock: rootValue => rootValue.getChildren(),
        isSingleKey: true,
        isSingleLock: true,
      },
      this.createRandomLock('thirdLock'),
      this.createRandomLock('fourthLock'),
    ]

    this.addRandomDungeonObstacles(obstacles, step, seedName)

    return obstacles.length
  }

  randomCreation2(step, seedName) {
    const obstacles = [
      this.createRandomBossObstacle(this.addEndState()),
      this.createRandomLock('firstLock'),
      {
        name: 'crystal',
        color: 'lightgreen',
        getChildrenToLock: rootValue => rootValue.getChildren(),
        isSingleKey: false,
        isSingleLock: true,
      },
      {
        name: 'seedShooter',
        color: 'orange',
        getChildrenToLock: rootValue => rootValue.getChildren(),
        isSingleKey: true,
        isSingleLock: false,
      },
      this.createRandomLock('secondLock'),
      this.createRandomLock('thirdLock'),
      this.createRandomLock('fourthLock'),
    ]

    this.addRandomDungeonObstacles(obstacles, step, seedName)

    return obstacles.length
  }

  randomCreation3(step, seedName) { // Water temple
    const obstacles = [
      this.createRandomBossObstacle(this.addEndState()),
      this.createRandomLock('firstLock'),
      this.createRandomLock('secondLock'),
      {
        name: 'longshot',
        color: 'lightgreen',
        getChildrenToLock: rootValue => rootValue.getChildren(),
        isSingleKey: true,
        isSingleLock: false,
      },
      this.createRandomLock('thirdLock'),
      this.createRandomLock('fourthLock'),
      {
        name: 'level3Water',
        color: 'orange',
        getChildrenToLock: rootValue => rootValue.getChildren(),
        isSingleKey: true,
        isSingleLock: false,
      },
      this.createRandomLock('fifthLock'),
      {
        name: 'level2Water',
        color: 'orange',
        getChildrenToLock: rootValue => rootValue.getChildren(),
        isSingleKey: true,
        isSingleLock: true,
      },
      this.createRandomLock('sixthLock'),
      {
        name: 'level1Water',
        color: 'orange',
        getChildrenToLock: rootValue => rootValue.getChildren(),
        isSingleKey: true,
        isSingleLock: true,
      },
    ]

    this.addRandomDungeonObstacles(obstacles, step, seedName)

    return obstacles.length
  }

  addDungeonObstacles(obstacles, step) {
    const obstaclesToDraw = obstacles.slice(0, step)
    obstaclesToDraw.forEach(obstacle => {
      const addedObstacles = this.rootValue.addObstacle(Object.assign(obstacle, {
        childrenToLock: obstacle.getChildrenToLock(this.rootValue)
      }))
    })
  }

  addRandomDungeonObstacles(obstacles, step, seedName) {
    const random = AleaRandomizer(seedName)

    const obstaclesToDraw = obstacles.slice(0, step)
    obstaclesToDraw.forEach(obstacle => {
      this.rootValue.addRandomObstacle(
        Object.assign(obstacle, {
          randomizer: random,
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
  if (seed === undefined) {
    seed = +new Date() + Math.random()
    document.getElementById('seed').innerHTML = seed
  }
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

const makeDungeon = (currentStep, seedName, createTreeFunction = 'randomCreation') => {
  

  const tree = new Tree()

  const numberOfSteps = seedName ? 
    tree[createTreeFunction](currentStep, seedName) :
    tree[createTreeFunction](currentStep)

  const dungeonNodes = tree.draw()

  return {
    tree,
    numberOfSteps,
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
  // newDungeons.push(makeDungeon(currentStep, undefined, 'gnarledRoot'))
  // newDungeons.push(makeDungeon(currentStep, undefined, 'moonlightGrotto'))
  newDungeons.push(makeDungeon(currentStep, 'test', 'waterTemple'))
  newDungeons.push(makeDungeon(currentStep, 'test', 'shadowTemple'))
  // newDungeons.push(makeDungeon(currentStep, 'test', 'rocsFeather'))
  // newDungeons.push(makeDungeon(currentStep, 'apples', 'randomCreation2'))
  // newDungeons.push(makeDungeon(currentStep, 'appl', 'randomCreation2'))
  // newDungeons.push(makeDungeon(currentStep, 'dome', 'randomCreation2'))
  // newDungeons.push(makeDungeon(currentStep, 'rad', 'randomCreation2'))
  // newDungeons.push(makeDungeon(currentStep, 'apple', 'randomCreation2'))
  // newDungeons.push(makeDungeon(currentStep, 1544468349857.5571, 'randomCreation2'))
  // newDungeons.push(makeDungeon(currentStep, 1544468125239.0205, 'randomCreation2'))
  // newDungeons.push(makeDungeon(currentStep, 1544468247205.152, 'randomCreation2'))
  // newDungeons.push(makeDungeon(currentStep, 1544461558359.5315, 'randomCreation3'))
  // newDungeons.push(makeDungeon(currentStep, undefined, 'randomCreation3'))
  return newDungeons
}

findNode = (path, name) => {
  return path.filter(node => node.name === name).pop()
}


