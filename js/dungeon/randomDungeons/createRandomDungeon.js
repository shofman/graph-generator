import { AleaRandomizer } from '../../utils/AleaRandomizer.js'
import { Tree } from '../dungeonStructure/dungeonTree.js'
import { generateSeedName } from '../utils/seedName.js'
import { KEY_TYPES } from '../dungeonStructure/keyTypes.js'
import {
  createRandomLock,
  createRandomKeyItem,
  createRandomMultiLock,
  createRandomMultiKey,
  createRandomPuzzleLock,
  createRandomMiniboss,
} from './createRooms.js'
import { resultFromProbability } from '../utils/resultFromProbability.js'

const transposeStepsToRandom = arrayOfSteps => {
  return arrayOfSteps.map(step => {
    switch (step.type) {
      case KEY_TYPES.NORMAL_KEY:
      case KEY_TYPES.SINGLE_LOCK_KEY:
      case KEY_TYPES.SINGLE_ROOM_PUZZLE:
      case KEY_TYPES.EXTERNAL_KEY:
        return createRandomLock(step.name, step.type, step.color)
      case KEY_TYPES.KEY_ITEM:
        return createRandomKeyItem(step.name, step.numberOfLocks)
      case KEY_TYPES.MULTI_LOCK:
        return createRandomMultiLock(step.name, step.color)
      case KEY_TYPES.MULTI_KEY:
        return createRandomMultiKey(step.name, step.color)
      default:
        console.log('we shouldnot be here')
        return createRandomLock(step.name, step.type, step.color)
    }
  })
}

const createRandomSteps2 = (tree, currentStep, randomizer) => {
  // TODO - prevent single Locks from occuring at the same place, especially at the top of the tree
  // TODO - limit total amount of keys
  /*
    Take placement positions and create probability to add
    Probability increases the more steps there are that we add a miniboss or key item
    (should take multiKey and make it part of this rule instead, allocating its small probabilities equally between the largest three). Probability to add multiKey is 9/13 (for best dungeons) or 15/52 (for all dungeons)

    if not miniboss, and not keyItem, add another key type with the following probabilities:
        26 +  0.22 +  0.26 +  0.16 +  0.07 +  0.03
  */

  let puzzleLockId = 1
  let combatLockId = 1
  let externalLockId = 1
  let normalLockId = 1
  let singleLockId = 1

  const KEY_ITEM_PROBABILITIES = {
    1: 23,
    2: 23,
    3: 39,
    4: 15,
  }

  // Figure out key item gathering - should gather group based on the following probabilities
  // Algorithm -> check number of available children to lock. If four -> 2/13 chance to add.
  /*
    Total key: { 1: 3/13, 2: 3/13, 3: 5/13, 4: 2/13 }
 
    3-8:25
    3-13:22
    2-6:27
    1-13:28
    1-19:28
    4-11:20
    1-17:26
    3-15:24
    3-3:18
    4-10:30
    3-2:25
    2-7:16
    2-9:15
  */

  const randomObstacles = []

  let termination

  do {
    const randomProbability = randomizer()
    let newKey
    if (randomProbability < 0.27) {
      newKey = createRandomPuzzleLock(
        'puzzleLock' + puzzleLockId++,
        KEY_TYPES.SINGLE_ROOM_PUZZLE,
        'pink'
      )
      newKey.isPuzzle = true
    } else if (randomProbability < 0.27 + 0.23) {
      newKey = createRandomLock(
        'combatLock' + combatLockId++,
        KEY_TYPES.SINGLE_ROOM_PUZZLE,
        'silver'
      )
      newKey.isCombat = true
    } else if (randomProbability < 0.27 + 0.23 + 0.27) {
      newKey = createRandomLock('normalLock' + normalLockId++, KEY_TYPES.NORMAL_KEY, 'lightblue')
    } else if (randomProbability < 0.27 + 0.23 + 0.27 + 0.16) {
      newKey = createRandomLock('externalLock' + externalLockId++, KEY_TYPES.EXTERNAL_KEY, 'green')
    } else {
      newKey = createRandomLock('singleLock' + singleLockId++, KEY_TYPES.SINGLE_LOCK_KEY, 'orange')
    }
    termination = randomizer()

    randomObstacles.push(newKey)
  } while (termination > randomObstacles.length / 30 || randomObstacles.length < 15)

  const shouldAddMultiKeyProbability = randomizer()
  let insertionPoint
  if (shouldAddMultiKeyProbability < 15 / 52) {
    insertionPoint = Math.floor(randomizer() * randomObstacles.length)
    randomObstacles.splice(insertionPoint, 0, createRandomMultiKey('multiKey', 'cyan'))
  }

  insertionPoint = Math.floor(randomizer() * randomObstacles.length)
  const numberOfLocks = resultFromProbability(randomizer, KEY_ITEM_PROBABILITIES, 2)
  randomObstacles.splice(insertionPoint, 0, createRandomKeyItem('keyItem', numberOfLocks))

  insertionPoint = Math.floor(randomizer() * (randomObstacles.length / 2))
  randomObstacles.splice(insertionPoint, 0, createRandomMiniboss('miniboss'))

  const newTreeLength = tree.createRandomDungeon(currentStep, randomizer, randomObstacles)

  return {
    newTreeLength,
    obstacleSteps: randomObstacles,
  }
}

export const makeRandomDungeon = (currentStep, seedName, arrayOfSteps) => {
  if (!seedName) {
    seedName = generateSeedName()
  }
  const randomizer = AleaRandomizer(seedName)
  const tree = new Tree()
  let numberOfSteps
  let convertedSteps

  if (arrayOfSteps) {
    convertedSteps = transposeStepsToRandom(arrayOfSteps)
    numberOfSteps = tree.createRandomDungeon(currentStep, randomizer, convertedSteps)
  } else {
    const result = createRandomSteps2(tree, currentStep, randomizer)
    convertedSteps = result.obstacleSteps
    numberOfSteps = result.newTreeLength
  }

  const dungeonNodes = tree.draw()

  return {
    tree,
    randomizer,
    seedName,
    numberOfSteps,
    convertedSteps,
    nodes: dungeonNodes.nodes,
    connections: dungeonNodes.connections,
    keyLockConnections: dungeonNodes.keyLockConnections,
  }
}
