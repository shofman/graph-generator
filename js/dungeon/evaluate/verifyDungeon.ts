import { drawDungeonTree } from '../ui/drawGraph.js'
import { KeyType } from '../dungeonStructure/keyTypes.js'
import { RandomDungeon } from '../randomDungeons/createRandomDungeon.js'
import { Node } from '../dungeonStructure/treeNode.js'

export const verify = (verifications = 1) => {
  for (let i = 0; i < verifications; i++) {
    const newDungeons = drawDungeonTree(true)
    console.log(verifyDungeons(newDungeons))
  }
}

type CombatProbabilities = {
  [roomCount : number]: string
}

type KeyMap = {
  [keyTyping : string] : Node[]
}

export type VerifiedDungeon = {
  dungeon: RandomDungeon
  visitedPath: Node[]
  keysGroupedByType: KeyMap
}

export const verifyDungeon = (dungeon : RandomDungeon) : VerifiedDungeon | undefined => {
  const tree = dungeon.tree

  const startNode = tree.rootValue
  const visitedPath = [startNode]
  let blockedPaths : Node[] = []


  // Possibly split into key and gates here
  const keysGroupedByType : KeyMap = Object.values(KeyType).reduce((result, keyType) => {
    result[keyType] = []
    return result
  }, {} as KeyMap)

  const addChildToPaths = (child : Node) => {
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
    const newlyAdded : Node[] = []

    blockedPaths = blockedPaths.filter(blockedPath => {
      if (blockedPath.keys.length && blockedPath.keys.some((key : Node) => visitedPath.includes(key))) {
        visitedPath.push(blockedPath)
        blockedPath.children.forEach((child : Node) => {
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

export const verifyDungeons = (createdDungeons : RandomDungeon[]) => {
  if (createdDungeons && createdDungeons.length) {
    return createdDungeons.map(verifyDungeon)
  } else {
    alert('no dungeons to verify')
  }
}
