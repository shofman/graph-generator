verify = (verifications=1) => {
  for(let i=0; i<verifications; i++) {
    const newDungeons = drawDungeon(true)
    console.log(verifyDungeons(newDungeons))
  }
}

verifyDungeon = dungeon => {
  const tree = dungeon.tree

  let complexity = 0
  const startNode = tree.rootValue
  const visitedPath = [startNode]
  let blockedPaths = []

  // Possibly split into key and gates here
  const keysGroupedByType = Object.values(KEY_TYPES).reduce(function(result, keyType) {
      result[keyType] = []
      return result
  }, {})

  const addChildToPaths = child => {
    let typeToUse = child.type
    if (!Array.isArray(keysGroupedByType[typeToUse])) {
      typeToUse = KEY_TYPES.UNKNOWN
    }

    if (!child.locked) {
      visitedPath.push(child)
      keysGroupedByType[typeToUse].push(child)
    } else {
      blockedPaths.push(child)
    }
  }

  startNode.children.forEach(addChildToPaths)

  let tries = 0

  while(blockedPaths.length && tries++ < 100) {
    const newlyAdded = []

    blockedPaths = blockedPaths.filter(blockedPath => {
      if (blockedPath.keys.length && blockedPath.keys.some(key => visitedPath.includes(key))) {
        visitedPath.push(blockedPath)
        blockedPath.children.forEach(child => {
          newlyAdded.push(child)
        })
        return false
      }
      return true
    })

    newlyAdded.forEach(addChildToPaths)
  }

  if (tries >= 100) {
    console.log(visitedPath)
    alert('failed')
    return undefined
  }

  return { dungeon, visitedPath, keysGroupedByType }
}

verifyDungeons = (drawnDungeons) => {
  if (drawnDungeons && drawnDungeons.length) {
    return drawnDungeons.map(verifyDungeon)
  } else {
    alert('no dungeons to verify')
  }
}