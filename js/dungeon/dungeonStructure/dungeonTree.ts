import { createNode, Node, NodeValue, Obstacle } from './treeNode.js'
import { KeyType } from './keyTypes.js'

export type Connection = {
  from: string
  to: string
}

const createConnection = (start: string, end: string) : Connection => ({ from: start, to: end })


export class Tree {
  rootValue: Node
  endValue: Node

  constructor() {
    this.rootValue = createNode('start', '#96c2fc', null)
    this.rootValue.setType(KeyType.START)
    this.endValue = this.addEndState()
  }

  draw() {
    const connections : Connection[] = []
    const keyLockConnections : Connection[] = []
    let nodes : NodeValue[] = []

    const drawQueue : Node[] = []

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

  addEndState() : Node {
    const endNode = createNode('end', 'beige', this.rootValue)
    endNode.setType(KeyType.END)
    this.rootValue.addChild(endNode)
    return endNode
  }

  createBossObstacle(){
    return {
      name: 'boss',
      type: KeyType.BOSS,
      numberOfKeys: 1,
      numberOfLocks: 1,
      color: 'red',
    }
  }

  // Ignore the hardcoded values for now
  // @ts-ignore
  createHardCodedDungeon(step, uniqueObstacles) {
    const baseObstacles = [this.createBossObstacle()]
    const obstacles = baseObstacles.concat(uniqueObstacles).slice(0, step)
    this.addDungeonObstacles(obstacles)
    return obstacles.length
  }

  createRandomDungeon(step : number, randomizer : () => number, uniqueObstacles : Obstacle[]) : number {
    const baseObstacles = [this.createRandomBossObstacle()]
    const obstacles = baseObstacles.concat(uniqueObstacles).slice(0, step)
    this.addRandomDungeonObstacles(obstacles, randomizer)

    return obstacles.length
  }

  createRandomBossObstacle() : Obstacle {
    return {
      name: 'boss',
      type: KeyType.BOSS,
      color: 'red',
      isSingleKey: true,
      isSingleLock: true,
      probabilityToAdd: '100',
    }
  }

  // Ignore the hardcoded values for now
  // @ts-ignore
  addDungeonObstacles(obstacles) {
    // @ts-ignore
    obstacles.forEach(obstacle => {
      this.rootValue.addObstacle(
        Object.assign(obstacle, {
          childrenToLock: obstacle.getChildrenToLock(this.rootValue),
        })
      )
    })
  }

  addRandomDungeonObstacles(obstacles : Obstacle[], randomizer : () => number) {
    obstacles.forEach(obstacle => {
      this.rootValue.addRandomObstacle(obstacle, randomizer, this.rootValue.getChildren())
    })
  }
}