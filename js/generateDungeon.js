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

  randomFortressOfWinds(step, seedName) {
    return this.createRandomDungeon(step, seedName, [
      this.createRandomLock('firstLock'),
      {
        name: 'arrow',
        type: KEY_TYPES.KEY_ITEM,
        color: 'lightgreen',
        getChildrenToLock: rootValue => rootValue.getChildren(),
        isSingleKey: true,
        isSingleLock: false,
      },
      this.createRandomLock('secondLock'),
      {
        name: 'aLock',
        type: KEY_TYPES.SINGLE_LOCK_KEY,
        color: 'orange',
        getChildrenToLock: rootValue => rootValue.getChildren(),
        isSingleKey: true,
        isSingleLock: true,
      },
      this.createRandomLock('thirdLock'),
      this.createRandomLock('fourthLock'),
    ])
  }

  randomMoonlightGrotto(step, seedName) {
    const obstacles = [
      this.createRandomBossObstacle(this.addEndState()),
      this.createRandomLock('firstLock'),
      {
        name: 'crystal',
        type: KEY_TYPES.MULTI_KEY,
        color: 'lightgreen',
        getChildrenToLock: rootValue => rootValue.getChildren(),
        isSingleKey: false,
        isSingleLock: true,
      },
      {
        name: 'seedShooter',
        type: KEY_TYPES.KEY_ITEM,
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

  randomWaterTemple(step, seedName) {
    const obstacles = [
      this.createRandomBossObstacle(this.addEndState()),
      this.createRandomLock('firstLock'),
      this.createRandomLock('secondLock'),
      {
        name: 'longshot',
        type: KEY_TYPES.KEY_ITEM,
        color: 'lightgreen',
        getChildrenToLock: rootValue => rootValue.getChildren(),
        isSingleKey: true,
        isSingleLock: false,
      },
      this.createRandomLock('thirdLock'),
      this.createRandomLock('fourthLock'),
      {
        name: 'level3Water',
        type: KEY_TYPES.MULTI_LOCK,
        color: 'orange',
        getChildrenToLock: rootValue => rootValue.getChildren(),
        isSingleKey: true,
        isSingleLock: false,
      },
      this.createRandomLock('fifthLock'),
      {
        name: 'level2Water',
        type: KEY_TYPES.SINGLE_LOCK_KEY,
        color: 'orange',
        getChildrenToLock: rootValue => rootValue.getChildren(),
        isSingleKey: true,
        isSingleLock: true,
      },
      this.createRandomLock('sixthLock'),
      {
        name: 'level1Water',
        type: KEY_TYPES.SINGLE_LOCK_KEY,
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
    rooms: dungeonNodes.rooms,
    connections: dungeonNodes.connections,
    keyLockConnections: dungeonNodes.keyLockConnections,
  }
}

const transposeStepsToRandom = arrayOfSteps => {
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

  const createRandomKeyItem = (name, color, numberOfLocks) => {
    return {
      name,
      type: KEY_TYPES.KEY_ITEM,
      color,
      getChildrenToLock: rootValue => rootValue.getChildren(),
      isSingleKey: true,
      isSingleLock: numberOfLocks === 1,
    }
  }

  const createMultiLock = (name, color) => {
    return {
      name,
      type: KEY_TYPES.MULTI_LOCK,
      color,
      getChildrenToLock: rootValue => rootValue.getChildren(),
      isSingleKey: true,
      isSingleLock: false,
    }
  }

  const createMultiKey = (name, color) => {
    return {
      name,
      type: KEY_TYPES.MULTI_KEY,
      color,
      getChildrenToLock: rootValue => rootValue.getChildren(),
      isSingleLock: true,
      isSingleKey: false,
    }
  }

  return arrayOfSteps.map(step => {
    switch (step.type) {
      case KEY_TYPES.NORMAL_KEY:
      case KEY_TYPES.SINGLE_LOCK_KEY:
        return createRandomLock(step.name, step.type, step.color)
      break
      case KEY_TYPES.KEY_ITEM:
        return createRandomKeyItem(step.name, step.color, step.numberOfLocks)
      break
      case KEY_TYPES.MULTI_LOCK:
        return createMultiLock(step.name, step.color)
      case KEY_TYPES.MULTI_KEY:
        return createMultiKey(step.name, step.color)
      default:
        console.log('we shouldnot be here')
        return createRandomLock(step.name, step.type, step.color)
    }
  })
}

const makeRandomDungeon = (currentStep, seedName, arrayOfSteps = fortressOfWinds) => {
  if (!seedName) {
    seedName = generateSeedName()
  }
  const tree = new Tree()
  const convertedSteps = transposeStepsToRandom(arrayOfSteps)
  const numberOfSteps = tree.createRandomDungeon(currentStep, seedName, convertedSteps)
  const dungeonNodes = tree.draw()

  return {
    tree,
    seedName,
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
  // newDungeons.push(makeDungeon(currentStep, 'skullWoods', skullWoods))
  // newDungeons.push(makeDungeon(currentStep, 'towerOfHera', towerOfHera))
  // newDungeons.push(makeDungeon(currentStep, 'spiritTemple', spiritTemple))

  newDungeons.push(makeDungeon(currentStep, 'fortressOfWinds', fortressOfWinds))
  newDungeons.push(makeDungeon(currentStep, 'moonlightGrotto', moonlightGrotto))
  newDungeons.push(makeDungeon(currentStep, 'waterTemple', waterTemple))
  newDungeons.push(makeDungeon(currentStep, 'shadowTemple', shadowTemple))
  newDungeons.push(makeDungeon(currentStep, 'rocsFeather', rocsFeather))
  newDungeons.push(makeDungeon(currentStep, 'jabujabuOracle', jabujabuOracle))
  newDungeons.push(makeDungeon(currentStep, 'swordAndShield', swordAndShield))
  newDungeons.push(makeDungeon(currentStep, 'gnarledRoot', gnarledRoot))
  newDungeons.push(makeDungeon(currentStep, 'dancingDragon', dancingDragon))
  newDungeons.push(makeDungeon(currentStep, 'unicornsCave', unicornsCave))
  newDungeons.push(makeDungeon(currentStep, 'faceShrine', faceShrine))
  newDungeons.push(makeDungeon(currentStep, 'palaceOfDarkness', palaceOfDarkness))
  newDungeons.push(makeDungeon(currentStep, 'greatBayTemple', greatBayTemple))
  newDungeons.push(makeDungeon(currentStep, 'mermaidsCave', mermaidsCave))
  newDungeons.push(makeDungeon(currentStep, 'explorersCave', explorersCave))
  newDungeons.push(makeDungeon(currentStep, 'stoneTowerTemple', stoneTowerTemple))
  newDungeons.push(makeDungeon(currentStep, 'tailCave', tailCave))
  newDungeons.push(makeDungeon(currentStep, 'spiritsGrave', spiritsGrave))
  newDungeons.push(makeDungeon(currentStep, 'earthTemple', earthTemple))
  newDungeons.push(makeDungeon(currentStep, 'windTemple', windTemple))
  newDungeons.push(makeDungeon(currentStep, 'towerOfTheGods', towerOfTheGods))
  newDungeons.push(makeDungeon(currentStep, 'deepwoodShrine', deepwoodShrine))
  newDungeons.push(makeDungeon(currentStep, 'palaceOfWinds', palaceOfWinds))
  newDungeons.push(makeDungeon(currentStep, 'forestTempleTwilight', forestTempleTwilight))
  newDungeons.push(makeDungeon(currentStep, 'snowPeakRuins', snowPeakRuins))
  newDungeons.push(makeDungeon(currentStep, 'sandShip', sandShip))
  newDungeons.push(makeDungeon(currentStep, 'skyViewTemple', skyViewTemple))
  newDungeons.push(makeDungeon(currentStep, 'desertPalace', desertPalace))
  newDungeons.push(makeDungeon(currentStep, 'turtleRock', turtleRock))
  newDungeons.push(makeDungeon(currentStep, 'dragonRoostCavern', dragonRoostCavern))
  newDungeons.push(makeDungeon(currentStep, 'forestTemple', forestTemple))
  newDungeons.push(makeDungeon(currentStep, 'jabujabuOcarina',jabujabuOcarina))
  newDungeons.push(makeDungeon(currentStep, 'fireTemple', fireTemple))

  const toShow = [
    'spiritsGrave',
    'palaceOfDarkness'
  ]

  newDungeons = newDungeons.filter(dungeon => {
    if (!toShow.length) {
      return true
    }
    return toShow.includes(dungeon.seedName)
  })

  // newDungeons.push(makeRandomDungeon(currentStep, 'apples', swordAndShield))
  // newDungeons.push(makeRandomDungeon(currentStep, undefined, swordAndShield))
  // newDungeons.push(makeRandomDungeon(currentStep, undefined, dancingDragon))
  // newDungeons.push(makeRandomDungeon(currentStep, undefined, waterTemple))
  // newDungeons.push(makeRandomDungeon(currentStep, 1544562670984.7566, waterTemple)) // Decent Water temple
  // newDungeons.push(makeRandomDungeon(currentStep, 1544562760739.3171, waterTemple)) // Impossible water temple
  return newDungeons
}

findNode = (path, name) => {
  return path.filter(node => node.name === name).pop()
}


