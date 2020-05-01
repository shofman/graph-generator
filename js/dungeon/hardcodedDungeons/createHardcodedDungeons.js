import {
  fortressOfWinds,
  fortressOfWinds2,
  // rocsFeather,
  shadowTemple,
  shadowTemple2,
  waterTemple,
  waterTemple2,
  gnarledRoot,
  gnarledRoot2,
  snakeRemains,
  poisonMoth,
  dancingDragon,
  dancingDragon2,
  unicornsCave,
  unicornsCave2,
  ancientRuins,
  explorersCrypt,
  swordAndShield,
  swordAndShield2,
  faceShrine,
  palaceOfDarkness,
  greatBayTemple,
  explorersCave,
  stoneTowerTemple,
  tailCave,
  spiritsGrave,
  spiritsGrave2,
  wingDungeon,
  moonlightGrotto,
  moonlitGrotto,
  skullDungeon,
  crownDungeon,
  mermaidsCave,
  mermaidsCave2,
  jabujabuBelly,
  jabujabuOracle,
  ancientTomb,
  earthTemple,
  // windTemple,
  towerOfTheGods,
  deepwoodShrine,
  palaceOfWinds,
  forestTempleTwilight,
  snowPeakRuins,
  sandShip,
  skyViewTemple,
  desertPalace,
  turtleRock,
  // skullWoods,
  // towerOfHera,
  dragonRoostCavern,
  spiritTemple,
  forestTemple,
  fireTemple,
  jabujabuOcarina,
} from './hardcodedDungeons.js'
import { Tree } from '../dungeonStructure/dungeonTree.js'
import { generateSeedName } from '../utils/seedName.js'

const makeDungeon = (currentStep, seedName, arrayOfSteps = fortressOfWinds) => {
  if (!seedName) {
    seedName = generateSeedName()
  }
  const tree = new Tree()
  const numberOfSteps = tree.createHardCodedDungeon(currentStep, arrayOfSteps)
  const dungeonNodes = tree.draw()

  return {
    tree,
    seedName,
    numberOfSteps,
    arrayOfSteps,
    nodes: dungeonNodes.nodes,
    connections: dungeonNodes.connections,
    keyLockConnections: dungeonNodes.keyLockConnections,
  }
}

export const createHardCodedDungeons = currentStep => {
  const newDungeons = []
  // newDungeons.push(makeDungeon(currentStep, 'apple'))
  // newDungeons.push(makeDungeon(currentStep, 'apples'))
  // newDungeons.push(makeDungeon(currentStep, 'low'))
  // newDungeons.push(makeDungeon(currentStep, 'ap'))
  // newDungeons.push(makeDungeon(currentStep, 'skullWoods', skullWoods))
  // newDungeons.push(makeDungeon(currentStep, 'towerOfHera', towerOfHera))

  // newDungeons.push(makeDungeon(currentStep, 'rocsFeather', rocsFeather))
  // newDungeons.push(makeDungeon(currentStep, 'windTemple', windTemple))
  newDungeons.push(makeDungeon(currentStep, 'sandShip', sandShip))

  newDungeons.push(makeDungeon(currentStep, 'gnarledRoot', gnarledRoot))
  newDungeons.push(makeDungeon(currentStep, 'dancingDragon', dancingDragon))
  newDungeons.push(makeDungeon(currentStep, 'unicornsCave', unicornsCave))
  newDungeons.push(makeDungeon(currentStep, 'swordAndShield', swordAndShield))

  newDungeons.push(makeDungeon(currentStep, 'spiritsGrave', spiritsGrave))
  newDungeons.push(makeDungeon(currentStep, 'moonlightGrotto', moonlightGrotto))
  newDungeons.push(makeDungeon(currentStep, 'mermaidsCave', mermaidsCave))
  newDungeons.push(makeDungeon(currentStep, 'jabujabuOracle', jabujabuOracle))

  newDungeons.push(makeDungeon(currentStep, 'gnarledRoot2', gnarledRoot2))
  newDungeons.push(makeDungeon(currentStep, 'snakeRemains', snakeRemains))
  newDungeons.push(makeDungeon(currentStep, 'poisonMoth', poisonMoth))
  newDungeons.push(makeDungeon(currentStep, 'dancingDragon2', dancingDragon2))
  newDungeons.push(makeDungeon(currentStep, 'unicornsCave2', unicornsCave2))
  newDungeons.push(makeDungeon(currentStep, 'ancientRuins', ancientRuins))
  newDungeons.push(makeDungeon(currentStep, 'explorersCrypt', explorersCrypt))
  newDungeons.push(makeDungeon(currentStep, 'swordAndShield2', swordAndShield2))

  newDungeons.push(makeDungeon(currentStep, 'spiritsGrave2', spiritsGrave2))
  newDungeons.push(makeDungeon(currentStep, 'wingDungeon', wingDungeon))
  newDungeons.push(makeDungeon(currentStep, 'moonlitGrotto', moonlitGrotto))
  newDungeons.push(makeDungeon(currentStep, 'skullDungeon', skullDungeon))
  newDungeons.push(makeDungeon(currentStep, 'crownDungeon', crownDungeon))
  newDungeons.push(makeDungeon(currentStep, 'mermaidsCave2', mermaidsCave2))
  newDungeons.push(makeDungeon(currentStep, 'jabujabuBelly', jabujabuBelly))
  newDungeons.push(makeDungeon(currentStep, 'ancientTomb', ancientTomb))

  newDungeons.push(makeDungeon(currentStep, 'jabujabuOcarina', jabujabuOcarina))
  newDungeons.push(makeDungeon(currentStep, 'forestTemple', forestTemple))
  newDungeons.push(makeDungeon(currentStep, 'fireTemple', fireTemple))
  newDungeons.push(makeDungeon(currentStep, 'waterTemple', waterTemple))
  newDungeons.push(makeDungeon(currentStep, 'waterTemple2', waterTemple2))
  newDungeons.push(makeDungeon(currentStep, 'shadowTemple', shadowTemple))
  newDungeons.push(makeDungeon(currentStep, 'shadowTemple2', shadowTemple2))
  newDungeons.push(makeDungeon(currentStep, 'spiritTemple', spiritTemple))

  newDungeons.push(makeDungeon(currentStep, 'fortressOfWinds', fortressOfWinds))
  newDungeons.push(makeDungeon(currentStep, 'fortressOfWinds2', fortressOfWinds2))
  newDungeons.push(makeDungeon(currentStep, 'faceShrine', faceShrine))
  newDungeons.push(makeDungeon(currentStep, 'palaceOfDarkness', palaceOfDarkness))
  newDungeons.push(makeDungeon(currentStep, 'greatBayTemple', greatBayTemple))
  newDungeons.push(makeDungeon(currentStep, 'explorersCave', explorersCave))
  newDungeons.push(makeDungeon(currentStep, 'stoneTowerTemple', stoneTowerTemple))
  newDungeons.push(makeDungeon(currentStep, 'tailCave', tailCave))
  newDungeons.push(makeDungeon(currentStep, 'earthTemple', earthTemple))
  newDungeons.push(makeDungeon(currentStep, 'towerOfTheGods', towerOfTheGods))
  newDungeons.push(makeDungeon(currentStep, 'deepwoodShrine', deepwoodShrine))
  newDungeons.push(makeDungeon(currentStep, 'palaceOfWinds', palaceOfWinds))
  newDungeons.push(makeDungeon(currentStep, 'forestTempleTwilight', forestTempleTwilight))
  newDungeons.push(makeDungeon(currentStep, 'snowPeakRuins', snowPeakRuins))
  newDungeons.push(makeDungeon(currentStep, 'skyViewTemple', skyViewTemple))
  newDungeons.push(makeDungeon(currentStep, 'desertPalace', desertPalace))
  newDungeons.push(makeDungeon(currentStep, 'turtleRock', turtleRock))
  newDungeons.push(makeDungeon(currentStep, 'dragonRoostCavern', dragonRoostCavern))

  return newDungeons
}
