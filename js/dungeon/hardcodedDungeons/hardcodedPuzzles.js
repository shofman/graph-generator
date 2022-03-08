import {
  createLockObstacle,
  // createSingleRoomPuzzle,
  createKeyItem,
  createSingleLock,
  createFilteredLockObstacle,
  createMultiLock,
  // createExternalLock,
  // createCombatPuzzleKey,
  // createMiniboss,
  // createPuzzleKey,
  // createMultiKey,
  // createMultiLock,
} from './createRooms.js'

// Puzzles can hopefully reuse the same logic
export const testPuzzle = [
  createMultiLock('jammer2', 'teal', 1, ['bossGate', 'bossKey']),
  // createLockObstacle('firstLock', rootValue => rootValue.getUnlockedChildren()),
  // createKeyItem('arrow', 3, ['firstLockGate', 'firstLockKey', 'bossGate']),
  // createLockObstacle('secondLock', rootValue => rootValue.getUnlockedChildren()),
  // createSingleLock('aLock', 'orange', ['arrowGate3']),
  // createFilteredLockObstacle('thirdLock', ['aLockGate', 'arrowGate2']),
  // createFilteredLockObstacle('fourthLock', ['aLockKey', 'thirdLockGate', 'thirdLockKey']),
]