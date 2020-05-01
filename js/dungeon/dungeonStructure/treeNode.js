import { KEY_TYPES } from './keyTypes.js'
import { getAllSubsets } from '../../utils/getAllSubsets.js'

export class Node {
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

export const createNode = (name, lockColor, parent = null) => {
  return new Node(parent, { id: name, label: name, color: lockColor })
}
