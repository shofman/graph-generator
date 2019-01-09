const createLockObstacle = (name, getChildrenToLock) => {
  return {
    name,
    type: KEY_TYPES.NORMAL_KEY,
    numberOfLocks: 1,
    numberOfKeys: 1,
    color: 'lightblue',
    getChildrenToLock,
  }
}

const createFilteredLockObstacle = (name, childrenToLock) => {
  return {
    name,
    type: KEY_TYPES.NORMAL_KEY,
    numberOfLocks: 1,
    numberOfKeys: 1,
    color: 'lightblue',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(childrenToLock),
  }
}

const createSingleLock = (name, color, childrenToLock) => {
  return {
    name,
    type: KEY_TYPES.SINGLE_LOCK_KEY,
    numberOfLocks: 1,
    numberOfKeys: 1,
    color,
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(childrenToLock),
  }
}

const createMultiLock = (name, color, numberOfLocks, childrenToLock) => {
  return {
    name,
    type: KEY_TYPES.MULTI_LOCK,
    numberOfLocks,
    numberOfKeys: 1,
    color,
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(childrenToLock),
  }
}

const createMultiKey = (name, color, numberOfKeys, childrenToLock) => {
  return {
    name,
    type: KEY_TYPES.MULTI_KEY,
    numberOfKeys,
    numberOfLocks: 1,
    color,
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(childrenToLock),
  }
}

const createKeyItem = (name, color, numberOfLocks, childrenToLock) => {
  return {
    name,
    type: KEY_TYPES.KEY_ITEM,
    numberOfKeys: 1,
    numberOfLocks,
    color,
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(childrenToLock),
  }
}

const fortressOfWinds = [
  createLockObstacle('firstLock', rootValue => rootValue.getUnlockedChildren()),
  createKeyItem('arrow', 'lightgreen', 3, ['firstLockGate', 'firstLockKey', 'bossGate']),
  createLockObstacle('secondLock', rootValue => rootValue.getUnlockedChildren()),
  createSingleLock('aLock', 'orange', ['arrowGate3']),
  createFilteredLockObstacle('thirdLock', ['aLockGate', 'arrowGate2']),
  createFilteredLockObstacle('fourthLock', ['aLockKey', 'thirdLockGate', 'thirdLockKey']),
]

const moonlightGrotto = [
  createLockObstacle('firstLock', rootValue => rootValue.getLockedChildren()),
  createMultiKey('crystal', 'lightgreen', 4, ['firstLockKey', 'bossKey']),
  createKeyItem('seedShooter', 'orange', 2, ['firstLockGate', 'crystal4Key']),
  createFilteredLockObstacle('secondLock', ['seedShooterKey']),
  createFilteredLockObstacle('thirdLock', ['secondLockGate']),
  createFilteredLockObstacle('fourthLock', ['seedShooterGate1', 'seedShooterGate2', 'crystalGate', 'crystal3Key', 'thirdLockGate', 'secondLockKey']),
]

const rocsFeather = [
  createLockObstacle('firstLock', rootValue => rootValue.getUnlockedChildren()),
  createLockObstacle('secondLock', rootValue => rootValue.getFilteredChildren(['bossGate'])),
  createSingleLock('switchPanel', 'orange', ['firstLockGate', 'firstLockKey', 'secondLockGate']),
  createFilteredLockObstacle('thirdLock', ['switchPanelGate']),
  {
    name: 'rocsFeather',
    type: KEY_TYPES.KEY_ITEM,
    numberOfLocks: 3,
    numberOfKeys: 1,
    color: 'lightgreen',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(['switchPanelKey', 'secondLockKey', 'thirdLockKey']),
  },
  createFilteredLockObstacle('fourthLock', ['rocsFeatherGate1', 'rocsFeatherGate3', 'rocsFeatherKey', 'thirdLockGate']),
  createFilteredLockObstacle('fifthLock', ['fourthLockGate', 'fourthLockKey']),
]

const jabujabuOracle = [
  createFilteredLockObstacle('firstLock', ['bossKey']),
  createFilteredLockObstacle('secondLock', ['firstLockGate']),
  createFilteredLockObstacle('thirdLock', ['secondLockGate']),
  createSingleLock('level3Water', 'orange', ['firstLockKey', 'secondLockKey', 'bossGate']),
  createFilteredLockObstacle('fourthLock', ['thirdLockGate', 'level3WaterKey']),
  {
    name: 'switchShot',
    type: KEY_TYPES.KEY_ITEM,
    numberOfLocks: 3,
    numberOfKeys: 1,
    color: 'lightgreen',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(['thirdLockKey', 'fourthLockKey', 'fourthLockGate'])
  },
  createFilteredLockObstacle('fifthLock', ['switchShotKey']),
  createMultiLock('level2Water', 'pink', 2, ['fifthLockKey', 'switchShotGate1']),
  createFilteredLockObstacle('sixthLock', ['level2WaterKey', 'fifthLockGate']),
  createMultiLock('level1WaterFirst', 'orange', 4, ['switchShotGate3', 'sixthLockKey', 'sixthLockGate', 'level2WaterGate2']),
  createFilteredLockObstacle('seventhLock', ['level1WaterFirstKey']),
]

const shadowTemple = [
  createFilteredLockObstacle('firstLock', ['bossGate']),
  createFilteredLockObstacle('secondLock', ['firstLockKey', 'bossKey', 'firstLockGate']),
  createFilteredLockObstacle('thirdLock', ['secondLockGate', 'secondLockKey']),
  createFilteredLockObstacle('fourthLock', ['thirdLockGate', 'thirdLockKey']),
  createFilteredLockObstacle('fifthLock', ['fourthLockGate', 'fourthLockKey']),
  {
    name: 'hoverboots',
    type: KEY_TYPES.KEY_ITEM,
    numberOfLocks: 1,
    numberOfKeys: 1,
    color: 'lightgreen',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(['fifthLockGate', 'fifthLockKey']),
  },
]

const waterTemple = [
  createLockObstacle('firstLock', rootValue => rootValue.getUnlockedChildren()),
  createLockObstacle('secondLock', rootValue => rootValue.getFilteredChildren(['firstLockGate'])),
  createKeyItem('longshot', 'lightgreen', 3, ['secondLockKey', 'secondLockGate', 'bossGate']),
  createLockObstacle('thirdLock', rootValue => rootValue.getFilteredChildren(['longshotKey', 'firstLockKey'])),
  createLockObstacle('fourthLock', rootValue => rootValue.getFilteredChildren(['thirdLockGate'])),
  createMultiLock('level3Water', 'orange', 2, ['longshotGate1', 'fourthLockGate']),
  createLockObstacle('fifthLock', rootValue => rootValue.getFilteredChildren(['level3WaterKey'])),
  createSingleLock('level2Water', 'orange', ['fifthLockGate', 'longshotGate3', 'thirdLockKey', 'fourthLockKey']),
  createLockObstacle('sixthLock', rootValue => rootValue.getFilteredChildren(['level2WaterGate', 'level2WaterKey'])),
  createSingleLock('level1Water', 'orange', ['longshotGate2', 'sixthLockGate', 'fifthLockKey', 'sixthLockKey']),
]

const swordAndShield = [
  createFilteredLockObstacle('firstLock', ['bossGate']),
  createSingleLock('frozenLava4', 'silver', ['firstLockGate']),
  createSingleLock('frozenLava3', 'silver', ['frozenLava4Gate']),
  createFilteredLockObstacle('secondLock', ['frozenLava4Key']),
  createFilteredLockObstacle('thirdLock', ['frozenLava3Key']),
  createSingleLock('frozenLava2', 'silver', ['firstLockKey']),
  createSingleLock('frozenLava1', 'silver', ['secondLockKey']),
  createFilteredLockObstacle('fourthLock', ['frozenLava1Key', 'thirdLockKey', 'frozenLava2Key', 'secondLockGate', 'thirdLockGate', 'frozenLava3Gate', 'frozenLava2Gate', 'frozenLava1Gate']),
  createFilteredLockObstacle('fifthLock', ['bossKey', 'fourthLockGate']),
  createKeyItem('hyperSlingshot', 'lightgreen', 1, ['fourthLockKey']),
  createSingleLock('nLock', 'orange', ['fifthLockKey']),
  createFilteredLockObstacle('sixthLock', ['fifthLockGate', 'hyperSlingshotGate', 'hyperSlingshotKey', 'nLockGate', 'nLockKey']),
  createFilteredLockObstacle('seventhLock', ['sixthLockGate']),
]

const gnarledRoot = [
  {
    name: 'emberSeeds',
    type: KEY_TYPES.KEY_ITEM,
    numberOfLocks: 2,
    numberOfKeys: 1,
    color: 'lightgreen',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(['bossKey', 'bossGate']),
  },
  createFilteredLockObstacle('firstLock', ['emberSeedsKey']),
  createFilteredLockObstacle('secondLock', ['firstLockGate', 'firstLockKey', 'emberSeedsGate2'])
]

const dancingDragon = [
  createFilteredLockObstacle('firstLock', ['bossGate']),
  createFilteredLockObstacle('secondLock', ['bossKey']),
  {
    name: 'slingshot',
    type: KEY_TYPES.KEY_ITEM,
    numberOfLocks: 3,
    numberOfKeys: 1,
    color: 'lightgreen',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(['firstLockGate', 'secondLockGate', 'firstLockKey']),
  },
  createFilteredLockObstacle('thirdLock', ['slingshotKey']),
  createFilteredLockObstacle('fourthLock', ['slingshotGate1', 'slingshotGate2', 'slingshotGate3', 'secondLockKey', 'thirdLockGate']),
  createFilteredLockObstacle('fifthLock', ['thirdLockKey', 'fourthLockGate']),
]

const unicornsCave = [
  createFilteredLockObstacle('firstLock', ['bossKey']),
  createFilteredLockObstacle('secondLock', ['bossGate']),
  createSingleLock('nLock', 'orange', ['firstLockGate']),
  createFilteredLockObstacle('thirdLock', ['nLockGate']),
  createFilteredLockObstacle('fourthLock', ['nLockKey', 'thirdLockGate', 'secondLockGate']),
  {
    name: 'magneticGloves',
    type: KEY_TYPES.KEY_ITEM,
    numberOfLocks: 4,
    numberOfKeys: 1,
    color: 'lightgreen',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(['firstLockKey', 'fourthLockGate', 'secondLockKey', 'thirdLockKey']),
  },
  createFilteredLockObstacle('fifthLock', ['magneticGlovesKey']),
]

const faceShrine = [
  createFilteredLockObstacle('firstLock', ['bossKey']),
  createFilteredLockObstacle('secondLock', ['firstLockGate']),
  createKeyItem('powerBracelet', 'lightgreen', 4, ['bossGate', 'firstLockKey', 'secondLockGate', 'secondLockKey']),
]

const palaceOfDarkness = [
  createKeyItem('magicHammer', 'lightgreen', 1, ['bossGate']),
  createFilteredLockObstacle('firstLock', ['magicHammerKey']),
  createFilteredLockObstacle('secondLock', ['firstLockGate']),
  createFilteredLockObstacle('thirdLock', ['magicHammerGate', 'secondLockKey']),
  createFilteredLockObstacle('fourthLock', ['bossKey']),
  createFilteredLockObstacle('fifthLock', ['thirdLockKey', 'fourthLockKey', 'fourthLockGate', 'thirdLockGate']),
]

const greatBayTemple = [
  createSingleLock('greenWaterFlow', 'green', ['bossGate']),
  createSingleLock('greenValve3', 'silver', ['greenWaterFlowKey']),
  createSingleLock('greenValve2', 'silver', ['greenValve3Gate']),
  createSingleLock('greenValve1', 'silver', ['greenValve2Gate']),
  createSingleLock('redWaterFlow', 'orange', ['greenWaterFlowGate', 'greenValve2Key', 'greenValve3Key', 'greenValve1Gate']),
  createSingleLock('redValve2', 'cyan', ['redWaterFlowKey']),
  createSingleLock('redValve1', 'cyan', ['redValve2Gate']),
  createKeyItem('iceArrows', 'lightgreen', 4, ['greenValve1Key', 'redValve2Key', 'redValve1Key', 'bossKey']),
  createFilteredLockObstacle('firstLock', ['iceArrowsKey']),
]

const mermaidsCave = [
  createFilteredLockObstacle('firstLock', ['bossGate']),
  createFilteredLockObstacle('secondLock', ['bossKey']),
  createFilteredLockObstacle('thirdLock', ['firstLockGate']),
  {
    name: 'mermaidSuit',
    type: KEY_TYPES.KEY_ITEM,
    numberOfLocks: 2,
    numberOfKeys: 1,
    color: 'lightgreen',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(['firstLockKey', 'thirdLockKey']),
  },
  createFilteredLockObstacle('fourthLock', ['mermaidSuitKey']),
  createSingleLock('timeTravelBombLock', 'orange', ['fourthLockKey', 'fourthLockGate']),
  createSingleLock('wallLock', 'orange', ['secondLockGate']),
  createFilteredLockObstacle('fifthLock', ['timeTravelBombLockKey', 'mermaidSuitGate2', 'thirdLockGate']),
]

const explorersCave = [
  createFilteredLockObstacle('firstLock', ['bossKey']),
  createFilteredLockObstacle('secondLock', ['bossGate', 'firstLockKey', 'firstLockGate']),
  createKeyItem('rocsCape', 'lightgreen', 1, ['secondLockKey']),
  createSingleLock('secondCurse', 'orange', ['rocsCapeKey', 'secondLockGate']),
  createFilteredLockObstacle('thirdLock', ['secondCurseKey']),
  createFilteredLockObstacle('fourthLock', ['secondCurseGate', 'thirdLockGate']),
  createSingleLock('firstCurse', 'orange', ['thirdLockKey', 'fourthLockGate', 'fourthLockKey', 'rocsCapeGate']),
  createFilteredLockObstacle('fifthLock', ['firstCurseKey']),
]

const stoneTowerTemple = [
  createFilteredLockObstacle('firstLock', ['bossGate']),
  createFilteredLockObstacle('secondLock', ['bossKey']),
  createSingleLock('hookshotChestSpawn', 'orange', ['firstLockGate']),
  createSingleLock('flipDungeon', 'silver', ['firstLockKey', 'secondLockKey', 'secondLockGate', 'hookshotChestSpawnKey', 'hookshotChestSpawnGate']),
  createKeyItem('lightArrows', 'lightGreen', 1, ['flipDungeonKey']),
  createFilteredLockObstacle('thirdLock', ['lightArrowsKey']),
  createFilteredLockObstacle('fourthLock', ['thirdLockGate', 'thirdLockKey']),
]

const tailCave = [
  createFilteredLockObstacle('firstLock', ['bossKey']),
  createKeyItem('rocsFeather', 'lightgreen', 2, ['bossGate', 'firstLockGate']),
  createFilteredLockObstacle('secondLock', ['rocsFeatherKey']),
  createFilteredLockObstacle('thirdLock', ['rocsFeatherGate1']),
]

const spiritsGrave = [
  createKeyItem('powerBracelet', 'lightgreen', 1, ['bossKey']),
  createFilteredLockObstacle('firstLock', ['powerBraceletKey']),
  createFilteredLockObstacle('secondLock', ['firstLockGate']),
  createFilteredLockObstacle('thirdLock', ['firstLockKey', 'secondLockKey', 'secondLockGate', 'bossGate']),
]

const earthTemple = [
  createSingleLock('mirror', 'orange', ['bossKey', 'bossGate']),
  createFilteredLockObstacle('firstLock', ['mirrorGate']),
  createKeyItem('mirrorShield', 'lightgreen', 1, ['mirrorKey', 'firstLockKey', 'firstLockGate']),
  createFilteredLockObstacle('secondLock', ['mirrorShieldKey']),
  createFilteredLockObstacle('thirdLock', ['secondLockGate', 'secondLockKey']),
]

const windTemple = [
  createFilteredLockObstacle('firstLock', ['bossGate']),
  createSingleLock('fan', 'cyan', ['firstLockKey']),
  createSingleLock('secondFloor', 'orange', ['firstLockGate']),
  createMultiLock('makar', 'green', 2, ['fanKey', 'bossKey']),
  {
    name: 'hookshot',
    type: KEY_TYPES.KEY_ITEM,
    numberOfLocks: 2,
    numberOfKeys: 1,
    color: 'lightgreen',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(['makarKey', 'secondFloorKey']),
  },
  createFilteredLockObstacle('secondLock', ['hookshotKey']),
  createSingleLock('firstFloor', 'orange', ['secondLockKey', 'secondLockGate', 'secondFloorGate', 'makarGate2']),
]

const towerOfTheGods = [
  createSingleLock('eLock', 'orange', ['bossGate', 'bossKey']),
  createFilteredLockObstacle('firstLock', ['eLockKey']),
  {
    name: 'herosBow',
    type: KEY_TYPES.KEY_ITEM,
    numberOfLocks: 1,
    numberOfKeys: 1,
    color: 'lightgreen',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(['firstLockKey', 'firstLockGate']),
  },
  createMultiLock('dLock', 'green', 2, ['herosBowGate', 'herosBowKey']),
  createSingleLock('cLock', 'silver', ['dLockKey', 'dLockGate1']),
  createSingleLock('bLock', 'cyan', ['eLockGate', 'dLockGate2', 'cLockGate']),
  createFilteredLockObstacle('secondLock', ['bLockKey']),
  createSingleLock('aLock', 'purple', ['secondLockKey']),
]

const deepwoodShrine = [
  createFilteredLockObstacle('firstLock', ['bossKey']),
  {
    name: 'arrow',
    type: KEY_TYPES.KEY_ITEM,
    numberOfLocks: 2,
    numberOfKeys: 1,
    color: 'lightgreen',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(['bossGate', 'firstLockGate']),
  },
  createFilteredLockObstacle('secondLock', ['arrowKey']),
  createFilteredLockObstacle('thirdLock', ['secondLockGate', 'secondLockKey']),
  createMultiKey('crystal', 'lightgreen', 2,['arrowGate2', 'firstLockKey', 'thirdLockKey', 'thirdLockGate'] ),
  createFilteredLockObstacle('fourthLock', ['crystal2Key', 'crystal1Key', 'crystalGate']),
]

const palaceOfWinds = [
  createFilteredLockObstacle('firstLock', ['bossGate']),
  createFilteredLockObstacle('secondLock', ['firstLockKey', 'firstLockGate']),
  createFilteredLockObstacle('thirdLock', ['secondLockGate']),
  createFilteredLockObstacle('fourthLock', ['bossKey']),
  createFilteredLockObstacle('sixthLock', ['thirdLockGate', 'thirdLockKey', 'secondLockKey', 'fourthLockGate', 'fourthLockKey']),
  createFilteredLockObstacle('seventhLock', ['sixthLockKey', 'sixthLockGate']),
  {
    name: 'arrow',
    type: KEY_TYPES.KEY_ITEM,
    numberOfLocks: 1,
    numberOfKeys: 1,
    color: 'lightgreen',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(['seventhLockGate', 'seventhLockKey']),
  },
]

const forestTempleTwilight = [
  createMultiKey('thirdMonkey', 'orange', 4, ['bossGate']),
  createFilteredLockObstacle('firstLock', ['thirdMonkey3Key']),
  createSingleLock('boomerangPuzzle', 'purple', ['thirdMonkey1Key', 'thirdMonkey2Key', 'firstLockGate', 'firstLockKey', 'thirdMonkeyGate']),
  {
    name: 'boomerang',
    type: KEY_TYPES.KEY_ITEM,
    numberOfLocks: 2,
    numberOfKeys: 1,
    color: 'lightgreen',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(['bossKey', 'boomerangPuzzleGate']),
  },
  createMultiKey('secondMonkey', 'orange', 2, ['boomerangKey', 'thirdMonkey4Key', 'boomerangPuzzleKey']),
  createFilteredLockObstacle('secondLock', ['secondMonkey2Key']),
  createFilteredLockObstacle('thirdLock', ['secondMonkey1Key']),
  createMultiKey('firstMonkey', 'orange', 2, ['secondLockKey', 'secondLockGate', 'thirdLockKey', 'thirdLockGate']),
  createFilteredLockObstacle('fourthLock', ['firstMonkey1Key']),
]

const snowPeakRuins = [
  createFilteredLockObstacle('firstLock', ['bossGate', 'bossKey']),
  createSingleLock('dLock', 'orange', ['firstLockKey']),
  createFilteredLockObstacle('secondLock', ['dLockGate', 'firstLockGate']),
  createSingleLock('cLock', 'orange', ['secondLockKey', 'secondLockGate']),
  createKeyItem('ballAndChain', 'lightgreen', 2, ['cLockKey', 'dLockKey']),
  createSingleLock('bLock', 'orange', ['ballAndChainKey', 'ballAndChainGate2']),
  createFilteredLockObstacle('thirdLock', ['bLockKey']),
  createSingleLock('aLock', 'orange', ['bLockGate', 'thirdLockGate', 'thirdLockKey']),
  createFilteredLockObstacle('fourthLock', ['aLockKey']),
]

const sandShip = [
  createFilteredLockObstacle('firstLock', ['bossKey']),
  createSingleLock('dLock', 'pink', ['firstLockKey']),
  createSingleLock('timeShift3', 'grey', ['dLockGate']),
  createSingleLock('bLock', 'orange', ['timeShift3Gate']),
  createMultiLock('cLock', 'silver', 2, ['bLockGate', 'dLockKey']),
  createSingleLock('aLock', 'cyan', ['bLockKey']),
  createSingleLock('timeShift2', 'grey', ['cLockGate1', 'timeShift3Key']),
  createSingleLock('timeShift1', 'grey', ['timeShift2Key', 'timeShift2Gate', 'cLockKey', 'cLockGate2', 'aLockGate', 'firstLockGate', 'bossGate']),
  createKeyItem('arrows', 'lightgreen', 2, ['timeShift1Key', 'aLockKey']),
  createFilteredLockObstacle('secondLock', ['arrowsKey'])
]

const skyViewTemple = [
  createFilteredLockObstacle('firstLock', ['bossGate', 'bossKey']),
  {
    name: 'arrow',
    type: KEY_TYPES.KEY_ITEM,
    numberOfLocks: 1,
    numberOfKeys: 1,
    color: 'lightgreen',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(['firstLockKey']),
  },
  createFilteredLockObstacle('secondLock', ['arrowGate', 'arrowKey', 'firstLockGate']),
  createSingleLock('aLock', 'orange', ['secondLockGate']),
  createSingleLock('bLock', 'orange', ['secondLockKey']),
]

const desertPalace = [
  createSingleLock('cLock', 'orange', ['bossGate']),
  createSingleLock('bLock', 'orange', ['bossKey']),
  createFilteredLockObstacle('firstLock', ['cLockKey']),
  createFilteredLockObstacle('secondLock', ['cLockGate', 'firstLockKey', 'firstLockGate']),
  createFilteredLockObstacle('thirdLock', ['secondLockGate', 'secondLockKey']),
  createFilteredLockObstacle('fourthLock', ['thirdLockGate', 'thirdLockKey', 'bLockKey', 'bLockGate']),
  {
    name: 'arrow',
    type: KEY_TYPES.KEY_ITEM,
    numberOfLocks: 2,
    numberOfKeys: 1,
    color: 'lightgreen',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(['fourthLockGate', 'fourthLockKey']),
  },
  createFilteredLockObstacle('fifthLock', ['arrowKey']),
  createSingleLock('aLock', 'orange', ['fifthLockKey']),
]

const turtleRock = [
  createSingleLock('bLock', 'orange', ['bossGate', 'bossKey']),
  createFilteredLockObstacle('firstLock', ['bLockKey']),
  createSingleLock('aLock', 'silver', ['firstLockKey']),
  createFilteredLockObstacle('secondLock', ['aLockKey', 'firstLockGate']),
  createFilteredLockObstacle('thirdLock', ['secondLockGate', 'secondLockKey']),
]

const skullWoods = [
  createFilteredLockObstacle('firstLock', ['bossGate', 'bossKey']),
  createFilteredLockObstacle('secondLock', ['firstLockGate', 'firstLockKey']),
  createFilteredLockObstacle('thirdLock', ['secondLockGate', 'secondLockKey']),
]

const towerOfHera = [
  createFilteredLockObstacle('firstLock', ['bossGate', 'bossKey']),
  createFilteredLockObstacle('secondLock', ['firstLockGate', 'firstLockKey']),
]

const dragonRoostCavern = [
  {
    name: 'grappleHook',
    type: KEY_TYPES.KEY_ITEM,
    numberOfLocks: 1,
    numberOfKeys: 1,
    color: 'lightgreen',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(['bossGate']),
  },
  createFilteredLockObstacle('firstLock', ['grappleHookGate', 'grappleHookKey', 'bossKey']),
  createFilteredLockObstacle('secondLock', ['firstLockGate', 'firstLockKey']),
  createFilteredLockObstacle('thirdLock', ['secondLockGate', 'secondLockKey']),
  createFilteredLockObstacle('fourthLock', ['thirdLockGate', 'thirdLockKey']),
]

const spiritTemple = []

const forestTemple = [
  createSingleLock('spinningPuzzle', 'cyan', ['bossGate']),
  createMultiKey('poeSisters', 'lightgreen', 4, ['spinningPuzzleGate', 'spinningPuzzleKey']),
  createSingleLock('fallingPuzzle', 'cyan', ['poeSisters4Key',  'poeSisters3Key']),
  createFilteredLockObstacle('fourthLock', ['fallingPuzzleKey', 'fallingPuzzleGate',]), // Floormaster
  createFilteredLockObstacle('fifthLock', ['fourthLockGate']),  // Kill Second Poe treasure
  {
    name: 'bow',
    type: KEY_TYPES.KEY_ITEM,
    numberOfLocks: 1,
    numberOfKeys: 1,
    color: 'lightgreen',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(['bossKey', 'poeSisters1Key', 'poeSisters2Key', 'fourthLockGate', 'fourthLockKey', 'fifthLockKey', 'fifthLockGate']),
  },
  createFilteredLockObstacle('thirdLock', ['bowGate', 'bowKey']), // Under well
  createSingleLock('drainWell', 'pink', ['thirdLockKey']),
  createSingleLock('timeSong', 'silver', ['thirdLockKey', 'drainWellGate', 'drainWellKey']),
  createFilteredLockObstacle('secondLock', ['thirdLockGate']), // Back room skeleton
  createSingleLock('pushBlock', 'cyan', ['secondLockGate']),
  createFilteredLockObstacle('firstLock', ['pushBlockGate', 'pushBlockKey']), // Wolfos
]

const fireTemple = [
  createSingleLock('fireMiniboss2', 'silver', ['bossKey']),
  createFilteredLockObstacle('firstLock', ['fireMiniboss2Gate', 'fireMiniboss2Key']),
  {
    name: 'hammer',
    type: KEY_TYPES.KEY_ITEM,
    numberOfLocks: 3,
    numberOfKeys: 1,
    color: 'lightgreen',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(['firstLockGate', 'firstLockKey', 'bossGate'])
  },
  createSingleLock('raceSwitch', 'pink', ['hammerKey', 'hammerGate3']),
  createSingleLock('dropBomb2', 'green', ['raceSwitchKey', 'raceSwitchGate']),
  createSingleLock('fireMiniboss1', 'silver', ['dropBomb2Gate']),
  createSingleLock('fireMaze2', 'orange', ['fireMiniboss1Gate', 'fireMiniboss1Key']),
  createFilteredLockObstacle('secondLock', ['fireMaze2Gate', 'fireMaze2Key']),
  createSingleLock('fireMaze1', 'orange', ['secondLockGate']),
  createFilteredLockObstacle('thirdLock', ['fireMaze1Gate', 'fireMaze1Key']),
  // Scarecrow puzzle
  createFilteredLockObstacle('fourthLock', ['secondLockKey', 'thirdLockGate', 'thirdLockKey']),
  // Arrows for map
  createFilteredLockObstacle('fifthLock', ['fourthLockGate']),
  createSingleLock('dropBomb1', 'green', ['fifthLockGate', 'fifthLockKey', 'fourthLockKey']),
  createSingleLock('dragBlock', 'green', ['dropBomb1Gate']),
  createFilteredLockObstacle('sixthLock', ['dragBlockGate']),
  createFilteredLockObstacle('seventhLock', ['sixthLockGate']),
  createSingleLock('bombWall', 'green', ['seventhLockKey']),
  createFilteredLockObstacle('eighthLock', ['seventhLockGate', 'sixthLockKey', 'bombWallGate']),
]

const jabujabuOcarina = [
  createSingleLock('redJelly', 'cyan', ['bossGate', 'bossKey']),
  createSingleLock('octoBoss', 'pink', ['redJellyGate', 'redJellyKey']),
  createSingleLock('greenTentacle', 'orange', ['octoBossGate', 'octoBossKey']),
  createSingleLock('blueTentacle', 'orange', ['greenTentacleKey']),
  createSingleLock('redTentacle', 'orange', ['blueTentacleKey']),
  {
    name: 'boomerang',
    type: KEY_TYPES.KEY_ITEM,
    numberOfLocks: 1,
    numberOfKeys: 1,
    color: 'lightgreen',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(['redTentacleKey']),
  },
  createSingleLock('throwRuto', 'silver', ['boomerangKey']),
  createSingleLock('slingshot', 'green', ['throwRutoKey', 'throwRutoGate', 'boomerangGate', 'greenTentacleGate', 'blueTentacleGate', 'redTentacleGate']),
]