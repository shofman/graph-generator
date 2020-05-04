import { createNode } from './treeNode.js'
import { KEY_TYPES } from './keyTypes.js'

const createConnection = (start, end) => ({ from: start, to: end })

export class Tree {
  constructor() {
    this.rootValue = createNode('start', '#96c2fc', null)
    this.rootValue.setType(KEY_TYPES.START)
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
    endNode.setType(KEY_TYPES.END)
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
