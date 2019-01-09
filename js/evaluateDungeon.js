isMeaningfulBranch = (node) => {
  nodeHasBranchingBinaryChildren = node => {
    return node.children.length === 2 && node.children.every(child => child.children.length >= 2)
  }
  return node.hasChildren() && (node.children.length >= 3 || nodeHasBranchingBinaryChildren(node))
}

calculateVisitedPathCost = (visitedPath) => {
  let index1 = 0
  let index2 = 1

  let distance = 0

  while (index2 < visitedPath.length) {
    const firstNode = visitedPath[index1++]
    const secondNode = visitedPath[index2++]

    distance += getDistanceBetweenLeafs(firstNode, secondNode).distance
  }

  return distance
}

evaluateDungeon = () => {
  const verifiedDungeons = verifyDungeons(drawDungeon(true))
  if (verifiedDungeons) {
    const evaluations = verifiedDungeons.filter(dungeon => !!dungeon.visitedPath.length).map(dungeon => {
      let dungeonInfo = {
        aName: dungeon.dungeon.seedName,
        keys: {
          bossKey: {
            distanceToStart: 0,
            distanceToGate: 0,
            lockedDistance: 0,
            lockedDistanceToStart: 0,
          },
          keyItem: {
            distanceToStart: 0,
            avgDistanceToGate: 0,
            avgLockedDistance: 0,
          },
          normalKey: {
            avgDistance: 0,
            lockedDistance: 0,
          },
          specialKey: {
            avgDistance: 0,
            avgLockedDistance: 0,
          },
          multiKey: {
            avgDistance: 0,
            avgLockedDistance: 0,
          },
          multiLock: {
            avgDistance: 0,
            avgLockedDistance: 0,
          },
        },
        numberOfMeaningfulBranches: 0,
        treeStructure: {},
        maxHeight: 0,
        criticalPathDistance: calculateVisitedPathCost(dungeon.visitedPath),
        numberOfNodes: dungeon.visitedPath.length
      }

      dungeon.visitedPath.forEach(node => {
        if (isMeaningfulBranch(node)) {
          dungeonInfo.numberOfMeaningfulBranches++
        }


        const nodeHeight = node.calculateHeight()
        if (nodeHeight > dungeonInfo.maxHeight) {
          dungeonInfo.maxHeight = nodeHeight
        }
        if (dungeonInfo.treeStructure[nodeHeight]) {
          dungeonInfo.treeStructure[nodeHeight] += 1
        } else {
          dungeonInfo.treeStructure[nodeHeight] = 1
        }
      })

      Object.keys(dungeon.keysGroupedByType).forEach(classifiedNodeKeys => {
        const currentNodeGroup = dungeon.keysGroupedByType[classifiedNodeKeys]
        if (currentNodeGroup.length) {
          switch (classifiedNodeKeys) {
            case KEY_TYPES.BOSS: {
              currentNodeGroup.forEach(key => {
                const bossGate = key.locks[0]
                dungeonInfo.keys.bossKey.distanceToGate = getDistanceBetweenLeafs(bossGate, key).distance
                dungeonInfo.keys.bossKey.lockedDistance = getLockedDistanceBetweenLeafs(key, bossGate)
                dungeonInfo.keys.bossKey.distanceToStart = key.calculateHeight()
                dungeonInfo.keys.bossKey.lockedDistanceToStart = getLockedDistanceBetweenLeafs(key, dungeon.visitedPath[0])
              })
              break
            }

            case KEY_TYPES.KEY_ITEM: {
              let totalKeyItemDistanceFromStart = 0
              currentNodeGroup.forEach(key => {
                totalKeyItemDistanceFromStart += key.calculateHeight()

                const keyItemLocks = key.locks
                keyItemLocks.forEach(keyItemLock => {
                  dungeonInfo.keys.keyItem.avgDistanceToGate += getDistanceBetweenLeafs(keyItemLock, key).distance
                  dungeonInfo.keys.keyItem.avgLockedDistance += getLockedDistanceBetweenLeafs(keyItemLock, key)
                })
                
                dungeonInfo.keys.keyItem.avgDistanceToGate = dungeonInfo.keys.keyItem.avgDistanceToGate / keyItemLocks.length
                dungeonInfo.keys.keyItem.avgLockedDistance = dungeonInfo.keys.keyItem.avgLockedDistance / keyItemLocks.length
              })

              dungeonInfo.keys.keyItem.distanceToStart = totalKeyItemDistanceFromStart / currentNodeGroup.length
              break
            }

            case KEY_TYPES.MULTI_KEY: {
              currentNodeGroup.forEach(key => {
                const locks = key.locks
                locks.forEach(lock => {
                  dungeonInfo.keys.multiKey.avgDistance += getDistanceBetweenLeafs(lock, key).distance
                  dungeonInfo.keys.multiKey.avgLockedDistance += getLockedDistanceBetweenLeafs(lock, key)
                })
                
              })

              dungeonInfo.keys.multiKey.avgDistance = dungeonInfo.keys.multiKey.avgDistance  / currentNodeGroup.length
              dungeonInfo.keys.multiKey.avgLockedDistance = dungeonInfo.keys.multiKey.avgLockedDistance  / currentNodeGroup.length
              break
            }

            case KEY_TYPES.MULTI_LOCK: {
              currentNodeGroup.forEach(key => {
                const locks = key.locks
                locks.forEach(lock => {
                  dungeonInfo.keys.multiLock.avgDistance += getDistanceBetweenLeafs(lock, key).distance
                  dungeonInfo.keys.multiLock.avgLockedDistance += getLockedDistanceBetweenLeafs(lock, key)
                })

                dungeonInfo.keys.multiLock.avgDistance = dungeonInfo.keys.multiLock.avgDistance  / locks.length
                dungeonInfo.keys.multiLock.avgLockedDistance = dungeonInfo.keys.multiLock.avgLockedDistance  / locks.length
              })

              break
            }

            case KEY_TYPES.NORMAL_KEY: {
              currentNodeGroup.forEach(key => {
                const locks = key.locks
                locks.forEach(lock => {
                  dungeonInfo.keys.normalKey.avgDistance += getDistanceBetweenLeafs(lock, key).distance
                  dungeonInfo.keys.normalKey.lockedDistance += getLockedDistanceBetweenLeafs(lock, key)
                })
                
              })
              dungeonInfo.keys.normalKey.avgDistance = dungeonInfo.keys.normalKey.avgDistance / currentNodeGroup.length
              dungeonInfo.keys.normalKey.lockedDistance = dungeonInfo.keys.normalKey.lockedDistance / currentNodeGroup.length
              break
            }

            case KEY_TYPES.SINGLE_LOCK_KEY: {
              currentNodeGroup.forEach(key => {
                const locks = key.locks
                locks.forEach(lock => {
                  dungeonInfo.keys.specialKey.avgDistance += getDistanceBetweenLeafs(lock, key).distance
                  dungeonInfo.keys.specialKey.avgLockedDistance += getLockedDistanceBetweenLeafs(lock, key)
                })
                
                dungeonInfo.keys.specialKey.avgDistance = dungeonInfo.keys.specialKey.avgDistance / locks.length
                dungeonInfo.keys.specialKey.avgLockedDistance = dungeonInfo.keys.specialKey.avgLockedDistance / locks.length
              })
              break
            }
            default: {
            }
          }
        }
      })

      let avgTreeWidth = 0
      let maxTreeWidth = 0

      Object.values(dungeonInfo.treeStructure).forEach(levelResult => {
        avgTreeWidth += levelResult
        if (levelResult > maxTreeWidth) {
          maxTreeWidth = levelResult
        }
      })

      avgTreeWidth /= Object.values(dungeonInfo.treeStructure).length

      return Object.assign(dungeonInfo, { maxTreeWidth })
    })

    const calcScore = (aScore,bScore) => {
      if (aScore > bScore) {
        return 1
      } else if (aScore < bScore) {
        return -1
      }
      return 0
    }

    const sortByNormalizedCriticalPath = (a,b) => {
      const aScore = a.criticalPathDistance / a.numberOfNodes
      const bScore = b.criticalPathDistance / b.numberOfNodes
      return calcScore(aScore, bScore)
    }

    // This one does not seem to be as important - obviously, we want increase this value, but not as important as critical path
    const sortByBossKey = (a,b) => {
      const aKey = a.keys.bossKey
      const aScore = ((aKey.distanceToStart + aKey.distanceToGate) / a.maxHeight) + ((aKey.lockedDistance + aKey.lockedDistanceToStart) / a.numberOfNodes)
      
      const bKey = b.keys.bossKey
      const bScore = ((bKey.distanceToStart + bKey.distanceToGate) / b.maxHeight) + ((bKey.lockedDistance + bKey.lockedDistanceToStart) / b.numberOfNodes)
      return calcScore(aScore, bScore)
    }

    const sortByKeyItem = (a,b) => {
      const aKey = a.keys.keyItem
      const aScore = ((aKey.distanceToStart + aKey.avgDistanceToGate) / a.maxHeight) + (aKey.avgLockedDistance / a.numberOfNodes)

      const bKey = b.keys.keyItem
      const bScore = ((bKey.distanceToStart + bKey.avgDistanceToGate) / b.maxHeight) + (bKey.avgLockedDistance / b.numberOfNodes)

      return calcScore(aScore, bScore)
    }

    // evaluations.sort(sortByNormalizedCriticalPath).forEach(dungeon => console.log(dungeon))
    // evaluations.sort(sortByBossKey).forEach(dungeon => console.log(dungeon))
    evaluations.sort(sortByKeyItem).forEach(dungeon => console.log(dungeon))
  }


  // Distance needs to take into account the verticality / # of locked doors in the way
  // E.g. if two nodes share a parent, that should be scored differently than if two nodes are separated by a locked door
  // With distance as the only measurement, these would both be a 2

  // Handle the key scoring better - keys are universal, so distance to unlock may not be indicative of true difficulty

  // Should I include the aggregate distances? E.g. if a boss key and gate are separated by a lot of locks, should I add these to the scores


  // so far Critical path btwn boss key and gate  is always composed of several gates (4-6)

  // Can evaluate how we are doing at each step of the creation phase to determine how aggressive the generation needs to be

  // Handle first key assumption in lockedDistance func
  // Also compare the use of recursion or not

  // distance between boss key and where it is used - highest priority
  // distance between item and where it is used - higher priority than keys
  // distance between key and where it is used - lower priority than item
  // distance between boss key and entrance. Should be greater than 1
  // Total branching (how many children exist at a level). Water temple has a max of eight 
  // Complete path length - between 17 -27 segments long

}