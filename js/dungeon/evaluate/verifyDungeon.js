import { drawDungeonTree } from '../ui/drawGraph.js'
import { KeyType } from '../dungeonStructure/keyTypes.js'

export const verify = (verifications = 1) => {
  for (let i = 0; i < verifications; i++) {
    const newDungeons = drawDungeonTree(true)
    console.log(verifyDungeons(newDungeons))
  }
}

export const verifyDungeon = dungeon => {
  const tree = dungeon.tree

  const startNode = tree.rootValue
  const visitedPath = [startNode]
  let blockedPaths = []

  // Possibly split into key and gates here
  const keysGroupedByType = Object.values(KeyType).reduce(function(result, keyType) {
    result[keyType] = []
    return result
  }, {})

  const addChildToPaths = child => {
    let typeToUse = child.type
    if (!Array.isArray(keysGroupedByType[typeToUse])) {
      typeToUse = KeyType.UNKNOWN
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

  while (blockedPaths.length && tries++ < 100) {
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

export const verifyDungeons = createdDungeons => {
  if (createdDungeons && createdDungeons.length) {
    return createdDungeons.map(verifyDungeon)
  } else {
    alert('no dungeons to verify')
  }
}
