import { KeyType } from './keyTypes.js'
import { getAllSubsets } from '../../utils/getAllSubsets.js'

export type NodeValue = {
  id: string
  label: string
  color: string
}

export type Obstacle = {
  name: string,
  color: string,
  type: KeyType,
  isSingleLock: boolean
  isSingleKey: boolean
  isCombat?: boolean
  isPuzzle?: boolean
  isMiniboss?: boolean
  probabilityToAdd?: string,
}

export type HardCodedObstacle  = Obstacle & {
  numberOfLocks: number
  numberOfKeys: number
  childrenToLock: Node[]
}

export class Node {
  parent: Nullable<Node>
  locked: boolean
  name: string
  value: NodeValue
  children: Array<Node>
  type: KeyType

  isCombat: boolean
  isPuzzle: boolean
  isMiniboss: boolean

  locks: Array<Node>
  keys: Array<Node>

  constructor(parent : Nullable<Node>, value : NodeValue) {
    this.parent = parent
    this.value = value
    this.name = value.label
    this.children = []
    this.locked = false
    this.keys = []
    this.locks = []
    this.type = KeyType.UNKNOWN
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

  getChildren() : Node[] {
    return this.children
  }

  getFilteredChildren(arrayOfChildren: Node[]) : any {
    const allChildren = this.getChildren()
    const childrenToReturn = arrayOfChildren.map((child : any) => {
      if (Array.isArray(child)) {
        return allChildren.filter(everyChild => child.includes(everyChild.value.label))
      } else {
        return allChildren.find(everyChild => everyChild.value.label === child)
      }
    })
    return childrenToReturn
  }

  setKeys(keys : Node[]) : void {
    this.keys = keys
  }

  setType(type : KeyType) : void {
    this.type = type
  }

  setPuzzle(isPuzzle: boolean = false) : void {
    this.isPuzzle = isPuzzle
  }

  setMiniboss(isMiniboss: boolean = false) : void {
    this.isMiniboss = isMiniboss
  }

  setCombat(isCombat: boolean = false) : void {
    this.isCombat = isCombat
  }

  calculateHeight() : number {
    const calculatedHeight = this.parent ? this.parent.calculateHeight() + 1 : 0
    return calculatedHeight
  }

  setLocks(locks : Node[]) : void {
    this.locks = locks
  }

  hasChildren() : boolean {
    return !!this.children.length
  }

  addChild(childNode : Node) : void {
    this.children.push(childNode)
    childNode.setParent(this)
  }

  removeChild(itemToRemove : Node) : void {
    this.children = this.children.filter(item => item.getValue().id !== itemToRemove.getValue().id)
  }

  setParent(parentNode : Node) : void {
    this.parent = parentNode
  }

  insertLock(lockNode : Node, childrenNodes : Node[]) {
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
    isMiniboss,
  }: HardCodedObstacle ) {
    const addedLocks : Node[] = []
    const addedKeys : Node[] = []

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
      lock.setMiniboss(isMiniboss)
    })
    addedKeys.forEach(key => {
      key.setLocks(addedLocks)
      key.setType(type)
      key.setPuzzle(isPuzzle)
      key.setCombat(isCombat)
      key.setMiniboss(isMiniboss)
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
    isMiniboss,
    color,
    probabilityToAdd,
  } : Obstacle, randomizer: () => number, childrenToLock: Node[]) {
    const addedLocks : Node[] = []
    const addedKeys : Node[] = []

    const forceAdd = probabilityToAdd === '100'

    let hasAdded = false
    let i = 0

    let isLockingSingleRoom = false
    let isLockingSpecialLock = false

    const validChildren = childrenToLock.filter(child => {
      if (child.type === KeyType.SINGLE_ROOM_PUZZLE) {
        isLockingSingleRoom = true
      } else if (child.type === KeyType.SINGLE_LOCK_KEY) {
        isLockingSpecialLock = true
      }
      return (
        child.type !== KeyType.EXTERNAL_KEY ||
        (child.type === KeyType.EXTERNAL_KEY && child.locked)
      )
    })

    let nodeSubsets = getAllSubsets(validChildren).filter((item : Node[]) => item.length !== 0)

    if (isLockingSingleRoom) {
      nodeSubsets = nodeSubsets.filter((subsetArray : Node[]) => {
        if (subsetArray.every(item => item.type !== KeyType.SINGLE_ROOM_PUZZLE)) {
          return true
        }
        return false
      })
    }

    validChildren.forEach(child => {
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
            subsetToAdd.forEach((node : Node) => {
              nodeSubsets = nodeSubsets.filter((nodeSubset : Node[]) => !nodeSubset.includes(node))
            })
          this.insertLock(lockNode, subsetToAdd)
        }
        addedLocks.push(lockNode)
      }
    })

    if (!hasAdded) {
      // Pick one entry at random
      const lockNode = createNode(`${name}Gate`, color)
      const childToLock = validChildren[Math.floor(randomizer() * validChildren.length)]

      if (childToLock.type === KeyType.SINGLE_ROOM_PUZZLE) {
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
      lock.setMiniboss(isMiniboss)
    })
    addedKeys.forEach(key => {
      key.setLocks(addedLocks)
      key.setType(type)
      key.setPuzzle(isPuzzle)
      key.setCombat(isCombat)
      key.setMiniboss(isMiniboss)
    })

    return addedLocks.concat(addedKeys)
  }
}

export const createNode = (name: string, lockColor: string, parent: Nullable<Node> = null) : Node => {
  return new Node(parent, { id: name, label: name, color: lockColor })
}
