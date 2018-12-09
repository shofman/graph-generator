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

  getKeys() {
    return this.keys
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
    return !!this.children
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
    this.addChild(lockNode)
    childrenNodes.forEach(child => {
      this.removeChild(child)
      lockNode.addChild(child)
    })
  }

  addObstacle(name, numberOfLocks, numberOfKeys, color, childrenToLock) {
    const addedLocks = []
    const addedKeys = []

    for (let i of Array(numberOfLocks).keys()) {
      const lockNode = new Node(
        null,
        createNode(`${name}Gate${numberOfLocks > 1 ? i + 1 : ''}`, color)
      )
      addedLocks.push(lockNode)
      lockNode.setLocked()
      this.insertLock(lockNode, numberOfLocks > 1 ? [childrenToLock[i]] : childrenToLock)
    }

    for (let i of Array(numberOfKeys).keys()) {
      const keyNode = new Node(
        null,
        createNode(`${name}${numberOfKeys > 1 ? i + 1 : ''}Key`, color)
      )
      addedKeys.push(keyNode)
      this.addChild(keyNode)
    }

    addedLocks.forEach(lock => lock.setKeys(addedKeys))
    addedKeys.forEach(key => key.setLocks(addedLocks))
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
        const lockNode = new Node(null, createNode(`${name}Gate${!isSingleLock ? i++ : ''}`, color))
        hasAdded = true
        lockNode.setLocked()
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
      const lockNode = new Node(null, createNode(`${name}Gate`, color))
      const childToLock = childrenToLock[Math.floor(randomizer() * childrenToLock.length)]
      this.insertLock(lockNode, [childToLock])
      addedLocks.push(lockNode)
    }

    if (isSingleKey) {
      const keyNode = new Node(null, createNode(`${name}Key`, color))
      this.addChild(keyNode)
      addedKeys.push(keyNode)
    } else {
      // Pick random number of keys
      const numberOfKeys = [2,3,4,5]
      const keysToGen = numberOfKeys[Math.floor(randomizer() * numberOfKeys.length)]

      for (let i of Array(keysToGen).keys()) {
        const keyNode = new Node(
          null,
          createNode(`${name}${i + 1}Key`, color)
        )
        addedKeys.push(keyNode)
        this.addChild(keyNode)
      }
    }

    addedLocks.forEach(lock => lock.setKeys(addedKeys))
    addedKeys.forEach(key => key.setLocks(addedLocks))
  }
}

class Tree {
  constructor(nodeValue) {
    this.rootValue = new Node(null, nodeValue)
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

  createBossObstacle(endNode) {
    return {
      name: 'boss',
      numberOfKeys: 1,
      numberOfLocks: 1,
      color: 'red',
      getChildrenToLock: () => [endNode]
    }
  }

  createLockObstacle(name, getChildrenToLock) {
    return {
      name,
      numberOfLocks: 1,
      numberOfKeys: 1,
      color: 'lightblue',
      getChildrenToLock,
    }
  }

  hardCode(step) {
    const endNode = new Node(this.rootValue, createNode('end', 'beige'))
    this.rootValue.addChild(endNode)

    const obstacles = [
      this.createBossObstacle(endNode),
      this.createLockObstacle('firstLock', rootValue => rootValue.getUnlockedChildren()),
      {
        name: 'arrow',
        numberOfLocks: 3,
        numberOfKeys: 1,
        color: 'lightgreen',
        getChildrenToLock: rootValue => rootValue.getChildren(),
      },
      this.createLockObstacle('secondLock', rootValue => rootValue.getUnlockedChildren()),
      {
        name: 'aLock',
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

  hardCode2(step) {
    const endNode = new Node(this.rootValue, createNode('end', 'beige'))
    this.rootValue.addChild(endNode)

    const obstacles = [
      this.createBossObstacle(endNode),
      this.createLockObstacle('firstLock', rootValue => rootValue.getLockedChildren()),
      {
        name: 'crystal',
        numberOfLocks: 1,
        numberOfKeys: 4,
        color: 'lightgreen',
        getChildrenToLock: rootValue => rootValue.getUnlockedChildren(),
      },
      {
        name: 'seedShooter',
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

  hardCode3(step) {
    const endNode = new Node(this.rootValue, createNode('end', 'beige'))
    this.rootValue.addChild(endNode)

    const obstacles = [
      this.createBossObstacle(endNode),
      this.createLockObstacle('firstLock', rootValue => rootValue.getUnlockedChildren()),
      this.createLockObstacle('secondLock', rootValue => rootValue.getFilteredChildren(['firstLockGate'])),
      {
        name: 'longshot',
        numberOfLocks: 3,
        numberOfKeys: 1,
        color: 'lightgreen',
        getChildrenToLock: rootValue => rootValue.getFilteredChildren(['secondLockKey', 'secondLockGate', 'bossGate']),
      },
      this.createLockObstacle('thirdLock', rootValue => rootValue.getFilteredChildren(['longshotKey', 'firstLockKey'])),
      this.createLockObstacle('fourthLock', rootValue => rootValue.getFilteredChildren(['thirdLockGate'])),
      {
        name: 'level3Water',
        numberOfLocks: 2,
        numberOfKeys: 1,
        color: 'orange',
        getChildrenToLock: rootValue => rootValue.getFilteredChildren(['longshotGate1', 'fourthLockGate'])
      },
      this.createLockObstacle('fifthLock', rootValue => rootValue.getFilteredChildren(['level3WaterKey'])),
      {
        name: 'level2Water',
        numberOfLocks: 1,
        numberOfKeys: 1,
        color: 'orange',
        getChildrenToLock: rootValue => rootValue.getFilteredChildren(['fifthLockGate', 'longshotGate3', 'thirdLockKey', 'fourthLockKey']),
      },
      this.createLockObstacle('sixthLock', rootValue => rootValue.getFilteredChildren(['level2WaterGate', 'level2WaterKey'])),
      {
        name: 'level1Water',
        numberOfLocks: 1,
        numberOfKeys: 1,
        color: 'orange',
        getChildrenToLock: rootValue => rootValue.getFilteredChildren(['longshotGate2', 'sixthLockGate', 'fifthLockKey', 'sixthLockKey']),
      },
    ]

    this.addDungeonObstacles(obstacles, step)

    return obstacles.length
  }

  randomCreation(step, seedName) {
    const endNode = new Node(this.rootValue, createNode('end', 'beige'))
    this.rootValue.addChild(endNode)

    const obstacles = [
      {
        name: 'boss',
        color: 'red',
        getChildrenToLock: () => [endNode],
        isSingleKey: true,
        isSingleLock: true,
        probabilityToAdd: '100',
      },
      this.createLock('firstLock'),
      {
        name: 'arrow',
        color: 'lightgreen',
        getChildrenToLock: rootValue => rootValue.getChildren(),
        isSingleKey: true,
        isSingleLock: false,
      },
      this.createLock('secondLock'),
      {
        name: 'aLock',
        color: 'orange',
        getChildrenToLock: rootValue => rootValue.getChildren(),
        isSingleKey: true,
        isSingleLock: true,
      },
      this.createLock('thirdLock'),
      this.createLock('fourthLock'),
    ]

    this.addRandomDungeonObstacle(obstacles, step, seedName)

    return obstacles.length
  }

  createLock(name) {
    return {
      name,
      color: 'lightblue',
      getChildrenToLock: rootValue => rootValue.getChildren(),
      isSingleLock: true,
      isSingleKey: true,
    }
  }

  randomCreation2(step, seedName) {
    const endNode = new Node(this.rootValue, createNode('end', 'beige'))
    this.rootValue.addChild(endNode)

    const obstacles = [
      {
        name: 'boss',
        color: 'red',
        getChildrenToLock: () => [endNode],
        isSingleKey: true,
        isSingleLock: true,
        probabilityToAdd: '100',
      },
      this.createLock('firstLock'),
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
      this.createLock('secondLock'),
      this.createLock('thirdLock'),
      this.createLock('fourthLock'),
    ]

    this.addRandomDungeonObstacle(obstacles, step, seedName)

    return obstacles.length
  }

  addDungeonObstacles(obstacles, step) {
    const obstaclesToDraw = obstacles.slice(0, step)
    obstaclesToDraw.forEach(obstacle => {
      this.rootValue.addObstacle(
        obstacle.name,
        obstacle.numberOfLocks,
        obstacle.numberOfKeys,
        obstacle.color,
        obstacle.getChildrenToLock(this.rootValue)
      )
    })
  }

  addRandomDungeonObstacle(obstacles, step, seedName) {
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

const createNode = (name, lockColor) => {
  totalSteps += 1
  return { id: name, label: name, color: lockColor }
}

const createConnection = (start, end) => ({ from: start, to: end })

let currentStep = 0
let totalSteps = 0
let drawnDungeons = []

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

const makeDungeon = (parentWrapper, containerName, seedName, createFuncString = 'randomCreation') => {
  var containerNode = document.createElement('div')

  if (!containerNode) {
    return 0
  }
  const style = containerNode.style
  style.display = 'inline-flex'
  style.border = '1px solid lightgray'
  style.width = '520'


  const tree = new Tree(createNode('start'))

  const numberOfSteps = seedName ? tree[createFuncString](currentStep, seedName) : tree[createFuncString](currentStep)

  const dungeonNodes = tree.draw()

  const nodes = new vis.DataSet(dungeonNodes.rooms)

  // create an array with edges
  const useKeys = document.getElementById('keys').checked

  let connections = dungeonNodes.connections
  if (useKeys) {
    connections = connections.concat(dungeonNodes.keyLockConnections)
  }

  const edges = new vis.DataSet(connections)

  // provide the data in the vis format
  const data = {
    nodes: nodes,
    edges: edges,
  }

  const options = {
    interaction: {
      dragNodes: false,
    },
    layout: {
      hierarchical: {
        enabled: true,
        sortMethod: 'directed'
      }
    },
  }

  parentWrapper.appendChild(containerNode)
  return {
    tree,
    containerNode,
    data,
    options,
    numberOfSteps
  }
}

const drawDungeon = () => {
  const generationElement = document.getElementById('generation')
  let newDungeons = []
  totalSteps = 0
  currentStep = generationElement.valueAsNumber

  const pageWidth = (window.innerWidth || document.body.clientWidth) - 50
  const parentWrapper = document.getElementById('mynetwork')
  parentWrapper.innerHTML = ''

  newDungeons.push(makeDungeon(parentWrapper, 'mynetwork', 'apple'))
  newDungeons.push(makeDungeon(parentWrapper, 'mynetwork2', 'apples'))
  newDungeons.push(makeDungeon(parentWrapper, 'mynetwork3', 'low'))
  newDungeons.push(makeDungeon(parentWrapper, 'mynetwork4', 'ap'))
  // newDungeons.push(makeDungeon(parentWrapper, 'mynetwork5', undefined, 'hardCode'))
  // newDungeons.push(makeDungeon(parentWrapper, 'mynetwork6', undefined, 'hardCode2'))
  // newDungeons.push(makeDungeon(parentWrapper, 'mynetwork7', undefined, 'hardCode3'))
  // newDungeons.push(makeDungeon(parentWrapper, 'mynetwork7', 'apples', 'randomCreation2'))
  // newDungeons.push(makeDungeon(parentWrapper, 'mynetwork7', 'appl', 'randomCreation2'))
  // newDungeons.push(makeDungeon(parentWrapper, 'mynetwork7', 'dome', 'randomCreation2'))
  // newDungeons.push(makeDungeon(parentWrapper, 'mynetwork7', 'rad', 'randomCreation2'))
  // newDungeons.push(makeDungeon(parentWrapper, 'mynetwork8', 'apple', 'randomCreation2')) // CREATES TOO MANY SEED SHOOTERS
  // newDungeons.push(makeDungeon(parentWrapper, 'mynetwork9', undefined, 'randomCreation2')) // CREATES TOO MANY SEED SHOOTERS
  let largestSteps = 0

  newDungeons.forEach(dungeon => {
    if (dungeon.numberOfSteps > largestSteps) {
      largestSteps = dungeon.numberOfSteps
    }
    dungeon.containerNode.style.width = pageWidth / newDungeons.length
    if (newDungeons.length === 1) {
      dungeon.containerNode.style.width = 800
    }
    new vis.Network(dungeon.containerNode, dungeon.data, dungeon.options)
  })

  generationElement.max = largestSteps

  drawnDungeons = newDungeons
}

rewind = () => {
  const generation = document.getElementById('generation')
  generation.valueAsNumber = generation.valueAsNumber - 1
  drawDungeon()
}

advance = () => {
  const generation = document.getElementById('generation')
  generation.valueAsNumber = generation.valueAsNumber + 1
  drawDungeon()
}

verify = () => {
  if (drawnDungeons.length) {
    drawnDungeons.forEach(dungeon => {
      const tree = dungeon.tree

      let complexity = 0
      const path = []
      const blockedPaths = []

      const startNode = tree.rootValue

      startNode.children.forEach(child => {
        if (!child.locked) {
          //  && child.locks.length && child.locks.some(child => startNode.children.includes(child))
          path.push(child)
        } else {
          blockedPaths.push(child)
        }
      })

      console.log('stuff', path, blockedPaths)

      console.log('dueng', tree)
    })
  }
}
