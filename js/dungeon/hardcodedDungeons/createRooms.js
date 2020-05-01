import { KEY_TYPES } from '../dungeonStructure/keyTypes.js'

export const createLockObstacle = (name, getChildrenToLock) => {
  return {
    name,
    type: KEY_TYPES.NORMAL_KEY,
    numberOfLocks: 1,
    numberOfKeys: 1,
    color: 'lightblue',
    getChildrenToLock,
  }
}

export const createFilteredLockObstacle = (name, childrenToLock) => {
  return {
    name,
    type: KEY_TYPES.NORMAL_KEY,
    numberOfLocks: 1,
    numberOfKeys: 1,
    color: 'lightblue',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(childrenToLock),
  }
}

export const createSingleLock = (name, color, childrenToLock) => {
  return {
    name,
    type: KEY_TYPES.SINGLE_LOCK_KEY,
    numberOfLocks: 1,
    numberOfKeys: 1,
    color,
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(childrenToLock),
  }
}

export const createSingleRoomPuzzle = (name, color, childrenToLock) => {
  return {
    name,
    type: KEY_TYPES.SINGLE_ROOM_PUZZLE,
    numberOfKeys: 1,
    numberOfLocks: 1,
    color,
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(childrenToLock),
  }
}

export const createExternalLock = (name, childrenToLock) => {
  return {
    name,
    type: KEY_TYPES.EXTERNAL_KEY,
    numberOfLocks: 1,
    numberOfKeys: 1,
    color: 'green',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(childrenToLock),
  }
}

export const createMultiLock = (name, color, numberOfLocks, childrenToLock) => {
  return {
    name,
    type: KEY_TYPES.MULTI_LOCK,
    numberOfLocks,
    numberOfKeys: 1,
    color,
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(childrenToLock),
  }
}

export const createMultiKey = (name, color, numberOfKeys, childrenToLock) => {
  return {
    name,
    type: KEY_TYPES.MULTI_KEY,
    numberOfKeys,
    numberOfLocks: 1,
    color,
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(childrenToLock),
  }
}

export const createKeyItem = (name, numberOfLocks, childrenToLock) => {
  return {
    name,
    type: KEY_TYPES.KEY_ITEM,
    numberOfKeys: 1,
    numberOfLocks,
    color: 'lightgreen',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(childrenToLock),
  }
}

export const createCombatPuzzleKey = (name, childrenToLock) => {
  return {
    name,
    type: KEY_TYPES.SINGLE_ROOM_PUZZLE,
    numberOfKeys: 1,
    numberOfLocks: 1,
    color: 'silver',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(childrenToLock),
  }
}

export const createPuzzleKey = (name, childrenToLock) => {
  return {
    name,
    type: KEY_TYPES.SINGLE_ROOM_PUZZLE,
    color: 'pink',
    numberOfKeys: 1,
    numberOfLocks: 1,
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(childrenToLock),
  }
}

export const createMiniboss = (name, childrenToLock) => {
  return {
    name,
    type: KEY_TYPES.SINGLE_ROOM_PUZZLE,
    numberOfKeys: 1,
    numberOfLocks: 1,
    color: 'purple',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(childrenToLock),
  }
}
