import { KEY_TYPES } from '../dungeonStructure/keyTypes.js'

export const createRandomPuzzleLock = (name, type, color) => {
  return Object.assign(createRandomLock(name, type, color), { isPuzzle: true, isCombat: false })
}

export const createRandomLock = (name, type, color) => {
  return {
    name,
    type,
    color,
    getChildrenToLock: rootValue => rootValue.getChildren(),
    isSingleLock: true,
    isSingleKey: true,
  }
}

export const createRandomMiniboss = name => {
  return {
    name,
    type: KEY_TYPES.SINGLE_ROOM_PUZZLE,
    color: 'purple',
    getChildrenToLock: rootValue => rootValue.getChildren(),
    isSingleKey: true,
    isSingleLock: true,
    isMiniboss: true,
  }
}

export const createRandomKeyItem = (name, numberOfLocks) => {
  return {
    name,
    type: KEY_TYPES.KEY_ITEM,
    color: 'lightgreen',
    getChildrenToLock: rootValue => rootValue.getChildren(),
    isSingleKey: true,
    isSingleLock: numberOfLocks === 1,
  }
}

export const createRandomMultiLock = (name, color) => {
  return {
    name,
    type: KEY_TYPES.MULTI_LOCK,
    color,
    getChildrenToLock: rootValue => rootValue.getChildren(),
    isSingleKey: true,
    isSingleLock: false,
  }
}

export const createRandomMultiKey = (name, color) => {
  return {
    name,
    type: KEY_TYPES.MULTI_KEY,
    color,
    getChildrenToLock: rootValue => rootValue.getChildren(),
    isSingleLock: true,
    isSingleKey: false,
  }
}
