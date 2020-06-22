import { KeyType } from './dungeonStructure/keyTypes.js'
import { resultFromProbability } from './utils/resultFromProbability.js'
import { shuffleList } from '../utils/shuffleList.js'
import { randChunkSplit } from './utils/randChunkSplit.js'

// Helpers
const isSingleChild = node => node.parent.children.length === 1
const isKey = node => node.locked === false
const isGate = node => node.locked === true
const isParentCombat = node => node.parent.isCombat === true
const isParentPuzzle = node => node.parent.isPuzzle === true
const isParentStart = node => node.parent.type === KeyType.START
const isKeyItem = child => child.type === KeyType.KEY_ITEM
const isSingleRoomPuzzle = room => room.type === KeyType.SINGLE_ROOM_PUZZLE

const hasTypeAsNeighbors = (node, type) => {
  if (node.parent && node.parent.children.length > 1) {
    return node.parent.children.some(child => child.type === type)
  }
  return false
}

const findCorrespondingNodeAsSibling = node => {
  if (node.locked === false) {
    return node.parent.children.find(child => node.locks[0] === child)
  }
  return node.parent.children.find(child => node.keys[0] === child)
}

const hasMatchingNodeAsSibling = node => {
  if (node.locked === false) {
    return node.parent.children.some(child => node.locks[0] == child)
  }
  return node.parent.children.some(child => node.keys[0] == child)
}

// Main logic

const KEY_ITEM_SINGLE_LOCK_COMBINE_ODDS = { true: 30, false: 70 }

export const createRoomsFromSteps = (steps, randomizer) => {
  let indexId = 0
  const listOfAddedRoomNames = []

  const randomizeResult = odds => {
    return 'true' === resultFromProbability(randomizer, odds, 'false')
  }

  const createRoom = roomsToAdd => {
    const roomsArray = Array.isArray(roomsToAdd) ? [...roomsToAdd] : [roomsToAdd]
    const toAdd = roomsArray.filter(room => !listOfAddedRoomNames.includes(room.name))

    if (!toAdd.length) {
      return {}
    }

    toAdd.forEach(room => {
      listOfAddedRoomNames.push(room.name)
    })

    const possibleParents = toAdd.map(node => node.parent).filter(parent => !toAdd.includes(parent))
    const uniqueParents = [...new Set(possibleParents)]

    return {
      nodesInRoom: toAdd,
      indexId: indexId++,
      roomName: toAdd[0].name,
      parentNode: uniqueParents[0],
    }
  }

  const createSingleRoom = node => {
    roomGroups.push(createRoom(node))
  }

  let roomGroups = []

  const createRoomFromChunk = chunk => {
    if (chunk.some(isSingleRoomPuzzle)) {
      chunk
        .slice()
        .filter(isSingleRoomPuzzle)
        .forEach(room => {
          chunk.push(findCorrespondingNodeAsSibling(room))
        })
    }

    createSingleRoom(chunk)
  }

  const allPotentialNodes = steps.visitedPath.slice().reverse()

  const createMiniBossRooms = node => {
    // Minibosses should have their own room
    const nodesToAdd = node.parent.children.filter(child => child.isMiniboss)

    // But if there is a single key possibility as a sibling, sometimes add it as a reward for the miniboss
    const isKeyReward = node =>
      isKey(node) &&
      (node.type === KeyType.MULTI_KEY ||
        node.type === KeyType.NORMAL_KEY ||
        node.type === KeyType.SINGLE_LOCK_KEY ||
        node.type === KeyType.KEY_ITEM)

    // 3 used here since MINIBOSS GATE, MINIBOSS KEY + at least one key
    if (node.parent.children.length > 3 && node.parent.children.some(isKeyReward)) {
      const createKeyAsReward = randomizeResult({ true: 90, false: 10 })
      if (createKeyAsReward) {
        const possibleRewardKeys = shuffleList(node.parent.children.filter(isKeyReward), randomizer)
        nodesToAdd.push(possibleRewardKeys[0])
      }
    }
    createSingleRoom(nodesToAdd)
  }

  const createEndRooms = node => {
    // The end will always be a boss fight room + treasure
    createSingleRoom(node)
  }

  const createBossGateRooms = node => {
    let hasAlreadyAdded = false
    if (node.parent.type === KeyType.EXTERNAL_KEY && isSingleChild(node.parent)) {
      const shouldAddExternalKey = randomizeResult({
        true: 50,
        false: 50,
      })
      if (shouldAddExternalKey) {
        createSingleRoom([node, node.parent])
        hasAlreadyAdded = true
      }
    }
    if (!hasAlreadyAdded) {
      createSingleRoom(node)
    }
  }

  const createBossKeyRooms = node => {
    const lockingType = node.parent.type
    if (lockingType === KeyType.SINGLE_ROOM_PUZZLE || lockingType === KeyType.KEY_ITEM) {
      // If the node above is a combat/miniboss/puzzle room, keep bossKey as separate
      createSingleRoom(node)
    } else if (hasMatchingNodeAsSibling(node)) {
      // If the key has a boss gate as a sibling, make it a separate room
      createSingleRoom(node)

      if (lockingType === KeyType.NORMAL_KEY) {
        createSingleRoom(node.parent)
      }
    } else if (lockingType === KeyType.EXTERNAL_KEY) {
      const shouldCombine = randomizeResult({ true: 50, false: 50 })
      if (shouldCombine) {
        createSingleRoom([node, node.parent])
      } else {
        createSingleRoom(node)
      }
    } else if (lockingType === KeyType.SINGLE_LOCK_KEY) {
      createSingleRoom(node)
    } else if (lockingType === KeyType.NORMAL_KEY) {
      createSingleRoom(node)
    } else if (lockingType === KeyType.MULTI_KEY) {
      if (node.parent.children.length === 1) {
        const createTantilizingReveal = randomizeResult({ true: 50, false: 50 })
        if (createTantilizingReveal) {
          createSingleRoom([node, node.parent])
        } else {
          createSingleRoom(node)
        }
      } else {
        createSingleRoom(node)
      }
    } else if (isParentStart(node)) {
      createSingleRoom(node)
    } else {
      console.log('still to implement for node', node)
    }
  }

  const createNormalKeyLockRooms = node => {
    if (isKey(node)) {
      const isKeyReward = isParentPuzzle(node) || isParentCombat(node)

      // Standalone key should be wrapped with parent
      if (isKeyReward) {
        const matchingParentNode = findCorrespondingNodeAsSibling(node.parent)
        const roomsToAdd = [node, node.parent, matchingParentNode]

        const hasMatchingSibling = hasMatchingNodeAsSibling(node)
        let addMatchingGateToRoom = false
        if (hasMatchingSibling) {
          addMatchingGateToRoom = randomizeResult({
            ['true']: 50,
            ['false']: 50,
          })
        }

        const matchingGateToCurrentKey = findCorrespondingNodeAsSibling(node)
        if (addMatchingGateToRoom) {
          // Sometimes add the corresponding gates to the same group
          roomsToAdd.push(matchingGateToCurrentKey)
        } else {
          if (hasMatchingSibling) {
            createSingleRoom(matchingGateToCurrentKey)
          }
        }

        const hasKeyItemSibling = node.parent.children.some(isKeyItem)

        if (hasKeyItemSibling) {
          const siblingKeyItems = node.parent.children.filter(isKeyItem)

          const shouldCombineKeyItem = randomizeResult({
            true: 50,
            false: 50,
          })

          if (shouldCombineKeyItem) {
            if (siblingKeyItems.length === 1) {
              roomsToAdd.push(siblingKeyItems[0])
            }
          } else {
            siblingKeyItems.forEach(keyItem => {
              createSingleRoom(keyItem)
            })
          }
        }
        createSingleRoom(roomsToAdd)
      } else if (isSingleChild(node)) {
        createSingleRoom(node)
      } else if (hasMatchingNodeAsSibling(node)) {
        if (isParentStart(node)) {
          createSingleRoom(node)
        } else if (node.parent.children.length === 2) {
          // In rooms where we only have a matching key and a gate, split them apart
          createSingleRoom(node)
          createSingleRoom(findCorrespondingNodeAsSibling(node))
        } else {
          // Cluster group randomly
          const newRoomChunks = randChunkSplit(randomizer, node.parent.children, 1, 3)
          newRoomChunks.forEach(createRoomFromChunk)
        }
      } else if (hasTypeAsNeighbors(node, KeyType.NORMAL_KEY)) {
        const nodesToConsider = node.parent.children.filter(
          child => child.type === KeyType.NORMAL_KEY
        )
        const chunks = randChunkSplit(randomizer, nodesToConsider, 1, 3)
        chunks.forEach(createRoomFromChunk)
      } else if (node.parent.type === KeyType.NORMAL_KEY) {
        createSingleRoom(node)
      } else if (isParentStart(node)) {
        const possibleRoomTypesToAddAlongside = [
          KeyType.SINGLE_ROOM_PUZZLE,
          KeyType.SINGLE_LOCK_KEY,
        ]
        const topGrouping = node.parent.children.filter(child =>
          possibleRoomTypesToAddAlongside.includes(child.type)
        )
        topGrouping.push(node)
        const groups = randChunkSplit(randomizer, topGrouping, 1, 3)
        groups.forEach(createRoomFromChunk)
      } else if (node.parent.isMiniboss) {
        const isReward = randomizeResult({ true: 20, false: 80 })
        if (isReward) {
          createSingleRoom([node, node.parent, findCorrespondingNodeAsSibling(node.parent)])
        } else {
          createSingleRoom(node)
        }
      } else {
        console.log('still to implement key for ', node)
      }
    } else {
      if (node.parent.type === KeyType.NORMAL_KEY && node.parent.locked) {
        const combineTwoLocksIntoSingleRoom = randomizeResult({
          true: 30,
          false: 70,
        })

        if (combineTwoLocksIntoSingleRoom) {
          createSingleRoom([node, node.parent])
        } else {
          createSingleRoom(node)
        }
      } else if (isGate(node.parent)) {
        if (node.parent.children.every(child => isGate(child))) {
          if (node.parent.children.length < 3) {
            createSingleRoom(node.parent.children)
          } else {
            const roomChunks = randChunkSplit(randomizer, node.parent.children, 1, 3)
            roomChunks.forEach(createRoomFromChunk)
          }
        } else if (isParentPuzzle(node) || isParentCombat(node)) {
          const createRoomWithLockAtEnd = randomizeResult({
            true: 20,
            false: 80,
          })
          if (createRoomWithLockAtEnd) {
            createSingleRoom([node, node.parent, findCorrespondingNodeAsSibling(node.parent)])
          } else {
            createSingleRoom(node)
          }
        } else {
          if (node.parent.type === KeyType.EXTERNAL_KEY) {
            const addExternalKey = randomizeResult({ true: 50, false: 50 })
            if (addExternalKey) {
              createSingleRoom([node, node.parent])
            } else {
              createSingleRoom(node)
            }
          } else {
            createSingleRoom(node)
          }
        }
      } else if (isParentStart(node)) {
        const gatesAtStart = node.parent.children.filter(
          child => child.locked && child.type !== KeyType.KEY_ITEM
        )
        const hasMultigates = gatesAtStart.length > 1
        if (hasMultigates) {
          const chunks = randChunkSplit(randomizer, gatesAtStart, 1, 3)
          chunks.forEach(createRoomFromChunk)
        } else {
          createSingleRoom(gatesAtStart)
        }
      } else {
        console.log('still to implement gate for ', node)
      }
    }
  }

  const createCombatRoomRooms = node => {
    if (isParentCombat(node)) {
      if (node.parent.children.length !== 2) {
        throw new Error('combat node duplicate has more children')
      }

      // Count number of waves (combat rooms in a row) to figure out probability
      let combatRoomsInARow = 1
      let nodeToCheck = node.parent
      while (nodeToCheck) {
        if (nodeToCheck.isCombat) {
          combatRoomsInARow++
          nodeToCheck = nodeToCheck.parent
        } else {
          nodeToCheck = undefined
        }
      }

      const MAX_NUMBER_FOR_CONSIDERATION = 4

      const multiTieredFightsProbabilities = {
        2: {
          true: 60,
          false: 40,
        },
        3: {
          true: 70,
          false: 30,
        },
        [MAX_NUMBER_FOR_CONSIDERATION]: {
          true: 90,
          false: 10,
        },
      }

      // Second wave room here means we have two attacks of enemies before the room opens
      const createMultiWaveRoom =
        combatRoomsInARow > MAX_NUMBER_FOR_CONSIDERATION
          ? true
          : randomizeResult(multiTieredFightsProbabilities[combatRoomsInARow])

      if (createMultiWaveRoom) {
        const roomsToAdd = [...node.parent.children]
        let combatRoomNode = node.parent
        while (combatRoomNode.isCombat) {
          roomsToAdd.push(combatRoomNode)
          roomsToAdd.push(findCorrespondingNodeAsSibling(combatRoomNode))
          combatRoomNode = combatRoomNode.parent
        }
        createSingleRoom(roomsToAdd)
      } else {
        let combatRoomNode = node
        while (combatRoomNode.isCombat) {
          const roomsToAdd = [combatRoomNode, findCorrespondingNodeAsSibling(combatRoomNode)]
          createSingleRoom(roomsToAdd)
          combatRoomNode = combatRoomNode.parent
        }
      }
    } else if (isParentPuzzle(node)) {
      if (node.parent.children.length !== 2) {
        throw new Error('combat node duplicate has more children')
      }
      createSingleRoom(node.parent.children)
      createSingleRoom([node.parent, findCorrespondingNodeAsSibling(node.parent)])
    } else if (node.parent.children.length === 2 && hasMatchingNodeAsSibling(node)) {
      createSingleRoom([node, findCorrespondingNodeAsSibling(node)])
    } else if (isParentStart(node)) {
      createSingleRoom([node, findCorrespondingNodeAsSibling(node)])
    } else {
      console.log('still to implement for node', node)
    }
  }

  const createMultiKeyLockRooms = node => {
    createSingleRoom(node)
  }

  const createKeyItemRooms = node => {
    if (isParentStart(node)) {
      createSingleRoom(node)
    } else if (hasMatchingNodeAsSibling(node)) {
      // Create two rooms if the key item is locked by its sibling
      createSingleRoom(node)
      createSingleRoom(findCorrespondingNodeAsSibling(node))
    } else if (isKey(node) && (isParentCombat(node) || isParentPuzzle(node))) {
      // If the key is locked by a puzzle or combat room, it should be a separate room
      createSingleRoom(node)
    } else if (isKey(node) && node.parent.type === KeyType.NORMAL_KEY) {
      createSingleRoom(node)
    } else if (isGate(node) && node.parent.type === KeyType.NORMAL_KEY) {
      if (node.parent.children.length === 1) {
        createSingleRoom(node)
      } else if (node.parent.children.filter(isGate).length > 1) {
        const combineGatesIntoSingleRoom = randomizeResult({ true: 50, false: 50 })
        const gatesToAdd = node.parent.children.filter(isGate)
        if (combineGatesIntoSingleRoom) {
          createRoomFromChunk(gatesToAdd)
        } else {
          createSingleRoom(node)
        }
      } else {
        if (node.parent.children.length === 2) {
          // We have stated the following above:
          // a) We are a key item gate, gated by a normal key
          // b) There are no more gates apart from us
          // Therefore, we are sharing the children with another key
          const combineWithKey = randomizeResult({ true: 50, false: 50 })
          if (combineWithKey) {
            createSingleRoom(node.parent.children)
          } else {
            createSingleRoom(node)
          }
        } else {
          const chunks = randChunkSplit(randomizer, node.parent.children, 1, 3)
          chunks.forEach(createRoomFromChunk)
        }
      }
    } else if (isParentCombat(node)) {
      const combineKeyGateWithCombat = randomizeResult({ true: 30, false: 70 })
      if (combineKeyGateWithCombat) {
        createSingleRoom([node, node.parent, findCorrespondingNodeAsSibling(node.parent)])
      } else {
        createSingleRoom(node)
      }
    } else if (node.parent.type === KeyType.EXTERNAL_KEY) {
      const combineKeyWithExternal = randomizeResult({ true: 30, false: 70 })
      if (combineKeyWithExternal) {
        createSingleRoom([node, node.parent])
      } else {
        createSingleRoom(node)
      }
    } else if (isGate(node) && isParentPuzzle(node)) {
      createSingleRoom(node)
    } else if (isGate(node) && node.parent.children.filter(isGate).length > 1) {
      // We have multiple gates as children - possible tease
      const chunks = randChunkSplit(randomizer, node.parent.children.filter(isGate), 1, 3)
      chunks.forEach(createRoomFromChunk)
    } else if (isKey(node) && node.parent.type === KeyType.SINGLE_LOCK_KEY) {
      createSingleRoom(node)
    } else if (node.parent.isMiniboss) {
      createSingleRoom(node)
    } else if (isKey(node) && node.parent.type === KeyType.MULTI_KEY) {
      const createTantilizingReveal = randomizeResult({ true: 50, false: 50 })
      if (createTantilizingReveal) {
        createSingleRoom([node, node.parent])
      } else {
        createSingleRoom(node)
      }
    } else if (isGate(node) && node.parent.type === KeyType.SINGLE_LOCK_KEY) {
      if (node.parent.children.length === 1) {
        const shouldCombine = randomizeResult(KEY_ITEM_SINGLE_LOCK_COMBINE_ODDS)
        if (shouldCombine) {
          createSingleRoom([node, node.parent])
        } else {
          createSingleRoom(node)
        }
      } else if (node.parent.children.length === 2) {
        const shouldCombine = randomizeResult({ true: 50, false: 50 })
        if (shouldCombine) {
          createSingleRoom(node.parent.children)
        } else {
          createSingleRoom(node)
        }
      } else {
        const chunks = randChunkSplit(randomizer, node.parent.children, 1, 3)
        chunks.forEach(createRoomFromChunk)
      }
    } else if (isGate(node) && node.parent.type === KeyType.MULTI_KEY) {
      createSingleRoom(node)
    } else if (isGate(node) && node.parent.isMiniboss) {
      createSingleRoom(node)
    } else {
      console.log('still to implement for key item node', node)
    }
  }

  const createPuzzleRooms = node => {
    if (node.parent.children.length === 2 && hasMatchingNodeAsSibling(node)) {
      let hasAlreadyAdded = false
      if (node.parent.type === KeyType.EXTERNAL_KEY) {
        const combineExternalKeyPuzzles = randomizeResult({ true: 30, false: 70 })
        if (combineExternalKeyPuzzles) {
          hasAlreadyAdded = true
          createSingleRoom([node, findCorrespondingNodeAsSibling(node), node.parent])
        }
      }

      if (!hasAlreadyAdded) {
        createSingleRoom([node, findCorrespondingNodeAsSibling(node)])
      }
    } else if (isParentStart(node)) {
      createSingleRoom([node, findCorrespondingNodeAsSibling(node)])
    } else {
      console.log('still to implement for node', node)
    }
  }

  const createExternalItemRooms = node => {
    if (node.parent.type === KeyType.EXTERNAL_KEY) {
      const combineExternalKeyPuzzles = randomizeResult({ ['true']: 30, ['false']: 70 })

      if (combineExternalKeyPuzzles) {
        createSingleRoom([node, node.parent])
      } else {
        createSingleRoom(node)
        createSingleRoom(node.parent)
      }
    } else if (node.parent.isPuzzle) {
      const shouldCreateExternalLockPuzzle = randomizeResult({ true: 30, false: 70 })
      if (shouldCreateExternalLockPuzzle) {
        createSingleRoom([node, node.parent, findCorrespondingNodeAsSibling(node.parent)])
      } else {
        createSingleRoom(node)
      }
    } else if (node.parent.isCombat) {
      const shouldCreateExternalLockCombat = randomizeResult({ true: 40, false: 60 })
      if (shouldCreateExternalLockCombat) {
        createSingleRoom([node, node.parent, findCorrespondingNodeAsSibling(node.parent)])
      } else {
        createSingleRoom(node)
      }
    } else if (isParentStart(node)) {
      const gatesAtStart = node.parent.children.filter(
        child => child.locked && child.type !== KeyType.SINGLE_ROOM_PUZZLE
      )
      const hasMultigates = gatesAtStart.length > 1
      if (hasMultigates) {
        if (gatesAtStart.length === 2) {
          const groupGates = randomizeResult({ true: 50, false: 50 })
          if (groupGates) {
            createSingleRoom(gatesAtStart)
          } else {
            gatesAtStart.forEach(gate => {
              createSingleRoom(gate)
            })
          }
        } else {
          const chunks = randChunkSplit(randomizer, gatesAtStart, 1, 3)
          chunks.forEach(createRoomFromChunk)
        }
      } else {
        createSingleRoom(node)
      }
    } else if (node.parent.type === KeyType.NORMAL_KEY && node.parent.children.length === 1) {
      // Normal lock followed by single external lock
      const keepLockInRoom = randomizeResult({ true: 30, false: 70 })
      if (keepLockInRoom) {
        createSingleRoom([node, node.parent])
      } else {
        createSingleRoom(node)
        createSingleRoom(node.parent)
      }
    } else if (node.parent.type === KeyType.NORMAL_KEY && node.parent.children.length > 1) {
      if (node.parent.children.length === 2) {
        const combineRooms = randomizeResult({ true: 30, false: 70 })
        if (combineRooms) {
          createSingleRoom(node.parent.children)
        } else {
          createSingleRoom(node)
          createSingleRoom(node.parent)
        }
      } else {
        const chunks = randChunkSplit(randomizer, node.parent.children, 1, 3)
        chunks.forEach(createRoomFromChunk)
      }
    } else if (node.parent.isMiniboss) {
      createSingleRoom(node)
    } else if (node.parent.type === KeyType.KEY_ITEM) {
      createSingleRoom(node)
    } else if (node.parent.type === KeyType.SINGLE_LOCK_KEY) {
      const combineRooms = randomizeResult({ true: 50, false: 50 })
      if (combineRooms) {
        createSingleRoom([node, node.parent])
      } else {
        createSingleRoom(node)
      }
    } else if (node.parent.type === KeyType.MULTI_KEY) {
      const combineRooms = randomizeResult({ true: 20, false: 80 })
      if (combineRooms) {
        createSingleRoom([node, node.parent])
      } else {
        createSingleRoom(node)
      }
    } else {
      console.log('still to implement', node)
    }
  }

  const createSingleLockRooms = node => {
    const parentType = node.parent.type
    if (isKey(node)) {
      if (parentType === KeyType.SINGLE_ROOM_PUZZLE) {
        // We may want to add this as a reward
        const addAsReward = randomizeResult({ true: 70, false: 30 })
        if (addAsReward && hasMatchingNodeAsSibling(node.parent)) {
          createSingleRoom([node, node.parent, findCorrespondingNodeAsSibling(node.parent)])
        } else {
          createSingleRoom(node)
        }
      } else if (parentType === KeyType.NORMAL_KEY) {
        createSingleRoom(node)
      } else if (isParentStart(node)) {
        if (hasMatchingNodeAsSibling(node)) {
          createSingleRoom(node)
        } else {
          const isSingleLockKey = child => child.type === node.type && isKey(child)
          const hasAnotherKey = node.parent.children.some(isSingleLockKey)
          if (hasAnotherKey) {
            const gatherKeysTogether = randomizeResult({ true: 10, false: 90 })
            if (gatherKeysTogether) {
              const keyRoom = [...node.parent.children.filter(isSingleLockKey)]
              createSingleRoom(keyRoom)
            } else {
              node.parent.children.filter(isSingleLockKey).forEach(key => {
                createSingleRoom(key)
              })
            }
          } else {
            console.warn('currentNode not implemented')
          }
        }
      } else if (parentType === KeyType.SINGLE_LOCK_KEY) {
        const combineSingleLocks = randomizeResult({ true: 50, false: 50 })
        if (combineSingleLocks) {
          createSingleRoom([node, node.parent])
        } else {
          createSingleRoom(node)
        }
      } else if (parentType === KeyType.KEY_ITEM) {
        const shouldCombineWithKeyItem = randomizeResult({ true: 50, false: 50 })
        if (shouldCombineWithKeyItem) {
          createSingleRoom([node, node.parent])
        } else {
          createSingleRoom(node)
        }
      } else if (parentType === KeyType.EXTERNAL_KEY) {
        const addSingleKeyToExternalLock = randomizeResult({ true: 30, false: 70 })
        if (addSingleKeyToExternalLock) {
          createSingleRoom([node, node.parent])
        } else {
          createSingleRoom(node)
        }
      } else if (parentType === KeyType.MULTI_KEY) {
        createSingleRoom(node)
      } else {
        createSingleRoom(node)
      }
    } else {
      if (
        parentType === KeyType.SINGLE_ROOM_PUZZLE ||
        parentType === KeyType.SINGLE_LOCK_KEY ||
        parentType === KeyType.NORMAL_KEY
      ) {
        createSingleRoom(node)
      } else if (isParentStart(node)) {
        createSingleRoom(node)
      } else if (parentType === KeyType.EXTERNAL_KEY && node.parent.children.length === 1) {
        const combineRooms = randomizeResult({ true: 50, false: 50 })
        if (combineRooms) {
          createSingleRoom([node, node.parent])
        } else {
          createSingleRoom(node)
        }
      } else if (parentType === KeyType.MULTI_KEY) {
        const combineRooms = randomizeResult({ true: 20, false: 80 })
        if (combineRooms) {
          createSingleRoom([node, node.parent])
        } else {
          createSingleRoom(node)
        }
      } else if (parentType === KeyType.KEY_ITEM && node.parent.children.length === 1) {
        const combineRooms = randomizeResult(KEY_ITEM_SINGLE_LOCK_COMBINE_ODDS)
        if (combineRooms) {
          createSingleRoom([node, node.parent])
        } else {
          createSingleRoom(node)
        }
      } else {
        createSingleRoom(node)
      }
    }
  }

  let tries = 0

  const startNode = allPotentialNodes.pop()
  const externalKeys = []
  startNode.children.forEach(child => {
    if (child.type === KeyType.EXTERNAL_KEY && !child.locked) {
      externalKeys.push(child)
    }
  })

  const firstRoom = createRoom([startNode, ...externalKeys])
  firstRoom.isFirstRoom = true
  roomGroups.push(firstRoom)

  while (allPotentialNodes.length && tries++ < 1000) {
    const currentNode = allPotentialNodes.shift()

    if (listOfAddedRoomNames.includes(currentNode.name)) continue

    if (currentNode.name === 'end') {
      createEndRooms(currentNode)
    } else if (currentNode.name === 'bossGate') {
      createBossGateRooms(currentNode)
    } else if (currentNode.name === 'bossKey') {
      createBossKeyRooms(currentNode)
    } else if (currentNode.name === 'minibossGate') {
      createMiniBossRooms(currentNode)
    } else if (currentNode.type === KeyType.NORMAL_KEY) {
      createNormalKeyLockRooms(currentNode)
    } else if (currentNode.isCombat) {
      createCombatRoomRooms(currentNode)
    } else if (currentNode.type === KeyType.MULTI_KEY) {
      createMultiKeyLockRooms(currentNode)
    } else if (currentNode.type === KeyType.KEY_ITEM) {
      createKeyItemRooms(currentNode)
    } else if (currentNode.isPuzzle) {
      createPuzzleRooms(currentNode)
    } else if (currentNode.type === KeyType.EXTERNAL_KEY) {
      createExternalItemRooms(currentNode)
    } else if (currentNode.type === KeyType.SINGLE_LOCK_KEY) {
      createSingleLockRooms(currentNode)
    } else {
      console.log('currentNode not handled because we fell through', currentNode)
    }
  }

  return roomGroups.filter(room => room.nodesInRoom)
}
