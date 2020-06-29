import { KeyType } from '../dungeonStructure/keyTypes.js'
import { Obstacle } from '../dungeonStructure/treeNode.js'

export const createRandomPuzzleLock = (name : string, type : KeyType, color: string) : Obstacle => {
  return Object.assign(createRandomLock(name, type, color), { isPuzzle: true, isCombat: false })
}

export const createRandomLock = (name: string, type : KeyType, color: string) : Obstacle => {
  return {
    name,
    type,
    color,
    isSingleLock: true,
    isSingleKey: true,
  }
}

export const createRandomMiniboss = (name : string) : Obstacle => {
  return {
    name,
    type: KeyType.SINGLE_ROOM_PUZZLE,
    color: 'purple',
    isSingleKey: true,
    isSingleLock: true,
    isMiniboss: true,
  }
}

export const createRandomKeyItem = (name : string, numberOfLocks: number) : Obstacle => {
  return {
    name,
    type: KeyType.KEY_ITEM,
    color: 'lightgreen',
    isSingleKey: true,
    isSingleLock: numberOfLocks === 1,
  }
}

export const createRandomMultiLock = (name : string, color : string) : Obstacle => {
  return {
    name,
    type: KeyType.MULTI_LOCK,
    color,
    isSingleKey: true,
    isSingleLock: false,
  }
}

export const createRandomMultiKey = (name : string, color : string) : Obstacle => {
  return {
    name,
    type: KeyType.MULTI_KEY,
    color,
    isSingleLock: true,
    isSingleKey: false,
  }
}
