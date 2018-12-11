isMeaningfulBranch = (node) => {
  nodeHasBranchingBinaryChildren = node => {
    return node.children.length === 2 && node.children.every(child => child.children.length >= 2)
  }
  return node.hasChildren() && (node.children.length >= 3 || nodeHasBranchingBinaryChildren(node))
}

evaluateDungeon = () => {
  const verifiedDungeons = verifyDungeons(drawDungeon())
  if (verifiedDungeons) {
    verifiedDungeons.filter(dungeon => !!dungeon.visitedPath.length).forEach(dungeon => {
      let dungeonInfo = {
        numberOfMeaningfulBranches: 0,
        maxHeight: 0,
        distanceBtwnBossKeyAndBossGate: 0,
        lockedDistanceBtwnBossKeyAndGate: 0,
        lockedRecursiveDistanceBtwnBossKeyAndGate: 0,
        avgDistanceBtwnKeyAndKeyGate: 0,
        distanceBetweenItemsAndItemGate: 0,
        distanceBtwnKeyItemAndStart: 0,
        distanceBtwnBossKeyAndStart: 0,
      }

      dungeon.visitedPath.forEach(node => {
        if (isMeaningfulBranch(node)) {
          dungeonInfo.numberOfMeaningfulBranches++
        }
        const nodeHeight = node.calculateHeight()
        if (nodeHeight > dungeonInfo.maxHeight) {
          dungeonInfo.maxHeight = nodeHeight
        }
      })
      console.log('----------------------------')

      Object.keys(dungeon.keysGroupedByType).forEach(classifiedNodeKeys => {
        const currentNodeGroup = dungeon.keysGroupedByType[classifiedNodeKeys]
        if (currentNodeGroup.length) {
          switch (classifiedNodeKeys) {
            case KEY_TYPES.BOSS: {
              currentNodeGroup.forEach(key => {
                const bossGate = key.locks[0]
                dungeonInfo.distanceBtwnBossKeyAndBossGate = getDistanceBetweenLeafs(bossGate, key).distance
                if (getDistanceBetweenLeafs(key, bossGate).distance !== dungeonInfo.distanceBtwnBossKeyAndBossGate) {
                  alert('something went wrong')
                }
                dungeonInfo.lockedDistanceBtwnBossKeyAndGate = getLockedDistanceBetweenLeafs(key, bossGate)
                dungeonInfo.lockedRecursiveDistanceBtwnBossKeyAndGate = getLockedDistanceBetweenLeafs(key, bossGate, true)
              })
            }
            default: {
            }
          }
        }
      })

      console.log('numberOfMeaningfulBranches', dungeonInfo.numberOfMeaningfulBranches)
      console.log('maxHeight',dungeonInfo.maxHeight)
      console.log('distanceBtwnBossKeyAndBossGate',dungeonInfo.distanceBtwnBossKeyAndBossGate)
      console.log('lockedDistanceBtwnBossKeyAndGate',dungeonInfo.lockedDistanceBtwnBossKeyAndGate)
      console.log('lockedRecursiveDistanceBtwnBossKeyAndGate',dungeonInfo.lockedRecursiveDistanceBtwnBossKeyAndGate)
      console.log('numberOfNodes', dungeon.visitedPath.length)
    })
  }


  // Distance needs to take into account the verticality / # of locked doors in the way
  // E.g. if two nodes share a parent, that should be scored differently than if two nodes are separated by a locked door
  // With distance as the only measurement, these would both be a 2

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