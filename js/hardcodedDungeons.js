const createLockFunc = childrenToLock => rootValue => rootValue.getFilteredChildren(childrenToLock)

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

const createSingleRoomPuzzle = (name, color, childrenToLock) => {
  return {
    name,
    type: KEY_TYPES.SINGLE_ROOM_PUZZLE,
    numberOfKeys: 1,
    numberOfLocks: 1,
    color,
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(childrenToLock),
  }
}

const createExternalLock = (name, childrenToLock) => {
  return {
    name,
    type: KEY_TYPES.EXTERNAL_KEY,
    numberOfLocks: 1,
    numberOfKeys: 1,
    color: 'green',
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

const createKeyItem = (name, numberOfLocks, childrenToLock) => {
  return {
    name,
    type: KEY_TYPES.KEY_ITEM,
    numberOfKeys: 1,
    numberOfLocks,
    color: 'lightgreen',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(childrenToLock),
  }
}

const createCombatPuzzleKey = (name, childrenToLock) => {
  return {
    name,
    type: KEY_TYPES.COMBAT_KEY,
    numberOfKeys: 1,
    numberOfLocks: 1,
    color: 'silver',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(childrenToLock),
  }
}

const createPuzzleKey = (name, childrenToLock) => {
  return {
    name,
    type: KEY_TYPES.SINGLE_ROOM_PUZZLE,
    color: 'pink',
    numberOfKeys: 1,
    numberOfLocks: 1,
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(childrenToLock),
  }
}

const createMiniboss = (name, childrenToLock) => {
  return {
    name,
    type: KEY_TYPES.MINI_BOSS_KEY,
    numberOfKeys: 1,
    numberOfLocks: 1,
    color: 'purple',
    getChildrenToLock: rootValue => rootValue.getFilteredChildren(childrenToLock),
  }
}

const fortressOfWinds = [
  createLockObstacle('firstLock', rootValue => rootValue.getUnlockedChildren()),
  createKeyItem('arrow', 3, ['firstLockGate', 'firstLockKey', 'bossGate']),
  createLockObstacle('secondLock', rootValue => rootValue.getUnlockedChildren()),
  createSingleLock('aLock', 'orange', ['arrowGate3']),
  createFilteredLockObstacle('thirdLock', ['aLockGate', 'arrowGate2']),
  createFilteredLockObstacle('fourthLock', ['aLockKey', 'thirdLockGate', 'thirdLockKey']),
]

const rocsFeather = [
  createLockObstacle('firstLock', rootValue => rootValue.getUnlockedChildren()),
  createLockObstacle('secondLock', rootValue => rootValue.getFilteredChildren(['bossGate'])),
  createSingleLock('switchPanel', 'orange', ['firstLockGate', 'firstLockKey', 'secondLockGate']),
  createFilteredLockObstacle('thirdLock', ['switchPanelGate']),
  createKeyItem('rocsFeather', 3, ['switchPanelKey', 'secondLockKey', 'thirdLockKey']),
  createFilteredLockObstacle('fourthLock', ['rocsFeatherGate1', 'rocsFeatherGate3', 'rocsFeatherKey', 'thirdLockGate']),
  createFilteredLockObstacle('fifthLock', ['fourthLockGate', 'fourthLockKey']),
]

const shadowTemple = [
  createFilteredLockObstacle('firstLock', ['bossGate']),
  createFilteredLockObstacle('secondLock', ['firstLockKey', 'bossKey', 'firstLockGate']),
  createFilteredLockObstacle('thirdLock', ['secondLockGate', 'secondLockKey']),
  createFilteredLockObstacle('fourthLock', ['thirdLockGate', 'thirdLockKey']),
  createFilteredLockObstacle('fifthLock', ['fourthLockGate', 'fourthLockKey']),
  createKeyItem('hoverboots', 1, ['fifthLockGate', 'fifthLockKey']),
]

const shadowTemple2 = [
  createSingleRoomPuzzle('statueFall', 'silver', ['bossGate']),
  createSingleRoomPuzzle('fireWall', 'pink', ['bossKey']),
  createSingleRoomPuzzle('invisibleWall', 'silver', ['fireWallGate', 'fireWallKey']),
  createSingleRoomPuzzle('ship', 'pink', ['invisibleWallKey', 'invisibleWallGate', 'statueFallGate', 'statueFallKey']),
  createFilteredLockObstacle('firstLock', ['shipGate', 'shipKey']),
  createSingleRoomPuzzle('bombableFloor', 'silver', ['firstLockKey']),
  createSingleLock('ironBootsWind', 'green', ['bombableFloorGate', 'bombableFloorKey', 'firstLockGate']),
  createFilteredLockObstacle('secondLock', ['ironBootsWindGate']),
  createSingleRoomPuzzle('bombSkullHead', 'green', ['secondLockKey']),
  createSingleRoomPuzzle('silverRupee3', 'cyan', ['bombSkullHeadGate']),
  createFilteredLockObstacle('thirdLock', ['silverRupee3Key', 'silverRupee3Gate', 'secondLockGate'])

]

// Dins fire
// Longshot to get across - catacombs + spin puzzle + hoverboots gate
// Catacombs
// Hand dead guy - hoverboots
// Past hoverboot gate - one locked gate, one compass, one collect rupee puzzle
// Collect 5 rupees - small key
// Use small key on locked gate
// After locked gate - one silver rupee puzzle, one locked gate
// Beat silver rupee puzzle - push block falling room
// Beat that, small key
// Use small key on gate
// Next room - collect rupee puzzle, locked gate
// Beat silver rupee puzzle, bomb puzzle
// Bomb puzzle - small use

// 

const waterTemple = [
  createLockObstacle('firstLock', rootValue => rootValue.getUnlockedChildren()),
  createLockObstacle('secondLock', rootValue => rootValue.getFilteredChildren(['firstLockGate'])),
  createKeyItem('longshot', 3, ['secondLockKey', 'secondLockGate', 'bossGate']),
  createLockObstacle('thirdLock', rootValue => rootValue.getFilteredChildren(['longshotKey', 'firstLockKey'])),
  createLockObstacle('fourthLock', rootValue => rootValue.getFilteredChildren(['thirdLockGate'])),
  createMultiLock('level3Water', 'orange', 2, ['longshotGate1', 'fourthLockGate']),
  createLockObstacle('fifthLock', rootValue => rootValue.getFilteredChildren(['level3WaterKey'])),
  createSingleLock('level2Water', 'orange', ['fifthLockGate', 'longshotGate3', 'thirdLockKey', 'fourthLockKey']),
  createLockObstacle('sixthLock', rootValue => rootValue.getFilteredChildren(['level2WaterGate', 'level2WaterKey'])),
  createSingleLock('level1Water', 'orange', ['longshotGate2', 'sixthLockGate', 'fifthLockKey', 'sixthLockKey']),
]

const waterTemple2 = [
  createSingleLock('level3WaterSecond', 'orange', ['bossGate']), // Is this true?
  createFilteredLockObstacle('firstLock', ['bossKey']),
  createCombatPuzzleKey('waterSpout2', ['firstLockGate']),
  createPuzzleKey('bombableWallPuzzle', ['waterSpout2Gate', 'waterSpout2Key']),
  createCombatPuzzleKey('rollingBoulders', ['bombableWallPuzzleGate', 'bombableWallPuzzleKey']),
  createFilteredLockObstacle('secondLock', ['rollingBouldersKey', 'rollingBouldersGate']),
  createCombatPuzzleKey('whirlpoolMaze', ['firstLockKey']),
  createExternalLock('songOfTime', ['whirlpoolMazeGate', 'whirlpoolMazeKey']),
  createMultiKey('pullBlock', 'cyan', 2, ['secondLockKey']),
  createKeyItem('longshot', 4, ['pullBlock1Key', 'pullBlockGate', 'secondLockGate', 'level3WaterSecondGate']),
  createSingleLock('level2WaterSecond', 'orange', ['level3WaterSecondKey', 'longshotGate3', 'longshotGate4']),
  createSingleLock('level1WaterSecond', 'orange', ['level2WaterSecondKey', 'level2WaterSecondGate']),
  createMiniboss('darkLink', ['longshotKey', 'songOfTimeGate']),
  createPuzzleKey('raisingStatues', ['darkLinkGate', 'darkLinkKey']),
  createFilteredLockObstacle('thirdLock', ['raisingStatuesGate', 'raisingStatuesKey']),
  createCombatPuzzleKey('waterfallPlatforms', ['thirdLockGate']),
  createFilteredLockObstacle('fourthLock', ['waterfallPlatformsKey', 'waterfallPlatformsGate']),
  createSingleLock('level3WaterFirst', 'orange', ['fourthLockGate', 'level1WaterSecondKey']),
  createPuzzleKey('waterElevator', ['level3WaterFirstGate', 'level1WaterSecondGate']),
  createFilteredLockObstacle('fifthLock', ['waterElevatorGate', 'waterElevatorKey']),
  createExternalLock('bombableRutoWall', ['thirdLockKey']),
  createSingleRoomPuzzle('killDropEnemies', 'purple', ['fourthLockKey']),
  createSingleLock('level2WaterFirst', 'orange', ['bombableRutoWallGate', 'killDropEnemiesGate', 'killDropEnemiesKey', 'fifthLockGate', 'level3WaterFirstKey']),
  createFilteredLockObstacle('sixthLock', ['level2WaterFirstGate', 'level2WaterFirstKey']),
  createPuzzleKey('whirlpoolPuzzle', ['fifthLockKey']),
  createCombatPuzzleKey('waterSpout1', ['whirlpoolPuzzleGate', 'whirlpoolPuzzleKey']),
  createPuzzleKey('blockIntoWater', ['waterSpout1Gate', 'waterSpout1Key']),
  createExternalLock('fireArrow', ['sixthLockKey']),
  createSingleLock('level1WaterFirst', 'orange', ['fireArrowGate', 'blockIntoWaterGate', 'blockIntoWaterKey', 'sixthLockGate']),
  createExternalLock('hookshotEntrance', ['level1WaterFirstGate', 'level1WaterFirstKey', 'longshotGate2', 'longshotGate1', 'pullBlock2Key'])
]

const gnarledRoot = [
  createKeyItem('emberSeeds', 2, ['bossKey', 'bossGate']),
  createFilteredLockObstacle('firstLock', ['emberSeedsKey']),
  createFilteredLockObstacle('secondLock', ['firstLockGate', 'firstLockKey', 'emberSeedsGate2'])
]

const gnarledRoot2 = [
  createCombatPuzzleKey('enemies1', ['bossKey']),
  createKeyItem('emberSeeds', 2, [['enemies1Key', 'enemies1Gate'], 'bossGate']),
  createMiniboss('miniboss', ['emberSeedsKey']),
  createFilteredLockObstacle('firstLock', ['minibossKey', 'minibossGate']),
  createCombatPuzzleKey('enemyMaze', ['firstLockGate']),
  createSingleLock('bombWall', 'orange', ['enemyMazeGate', 'enemyMazeKey']),
  createCombatPuzzleKey('simpleMaze', ['firstLockKey']),
  createSingleLock('minecartSwitch', 'cyan', ['bombWallGate', 'bombWallKey', 'simpleMazeKey', 'simpleMazeGate']),
  createFilteredLockObstacle('secondLock', ['emberSeedsGate1', 'minecartSwitchGate', 'minecartSwitchKey']),
  createCombatPuzzleKey('enemies2', ['secondLockKey']),
  createPuzzleKey('pushBlock', ['enemies2Gate', 'enemies2Key', 'emberSeedsGate2' ])
]

const snakeRemains = [
  createMultiKey('spinner', 'orange', 2, ['bossGate']),
  createPuzzleKey('movingPlatform', ['bossKey']),
  createFilteredLockObstacle('firstLock', ['spinner2Key', 'movingPlatformKey', 'movingPlatformGate']),
  createExternalLock('bombWall', ['spinner1Key', 'spinnerGate']),
  createMiniboss('miniboss', ['bombWallGate', 'firstLockGate']),
  createFilteredLockObstacle('secondLock', ['minibossGate', 'minibossKey']),
  createPuzzleKey('bombRace', ['firstLockKey']),
  createPuzzleKey('pushblockPuzzle', ['secondLockGate']),
  createKeyItem('powerBracelet', 2, [['bombRaceGate', 'bombRaceKey'], ['pushblockPuzzleGate', 'pushblockPuzzleKey']]),
  createPuzzleKey('bombThrow', ['powerBraceletKey']),
  createCombatPuzzleKey('enemies1', ['bombThrowGate', 'bombThrowKey']),
  createFilteredLockObstacle('thirdLock', ['enemies1Gate', 'enemies1Key']),
  createPuzzleKey('matchPattern', ['secondLockKey', 'powerBraceletGate1', 'powerBraceletGate2']),
  createExternalLock('lightTorches', ['thirdLockGate', 'matchPatternGate', 'matchPatternKey']),
  createCombatPuzzleKey('enemies2', ['thirdLockKey'])
]

const poisonMoth = [
  createPuzzleKey('pushblockPuzzle', ['bossKey']),
  createMiniboss('miniboss', ['bossGate', 'pushblockPuzzleGate', 'pushblockPuzzleKey']),
  createFilteredLockObstacle('firstLock', ['minibossKey', 'minibossGate']),
  createPuzzleKey('trampolinePuzzle', ['firstLockKey']),
  createKeyItem('rocsFeather', 2, [['trampolinePuzzleKey', 'trampolinePuzzleGate'], 'firstLockGate']),
  createFilteredLockObstacle('secondLock', ['rocsFeatherKey']),
  createPuzzleKey('pushblockPuzzle2', ['secondLockGate']),
  createExternalLock('rollingPushBlock', ['secondLockKey']),
  createPuzzleKey('potPush', [['pushblockPuzzle2Gate', 'pushblockPuzzle2Key'], ['rollingPushBlockGate'], 'rocsFeatherGate2']),
  createCombatPuzzleKey('enemies1', ['rocsFeatherGate1', 'potPushGate', 'potPushKey']),
]

const dancingDragon = [
  createFilteredLockObstacle('firstLock', ['bossGate']),
  createFilteredLockObstacle('secondLock', ['bossKey']),
  createKeyItem('slingshot', 3, ['firstLockGate', 'secondLockGate', 'firstLockKey']),
  createFilteredLockObstacle('thirdLock', ['slingshotKey']),
  createFilteredLockObstacle('fourthLock', ['slingshotGate1', 'slingshotGate2', 'slingshotGate3', 'secondLockKey', 'thirdLockGate']),
  createFilteredLockObstacle('fifthLock', ['thirdLockKey', 'fourthLockGate']),
]

const dancingDragon2 = [
  createPuzzleKey('eyePuzzle', ['bossKey']),
  createFilteredLockObstacle('firstLock', ['eyePuzzleGate', 'eyePuzzleKey']),
  createCombatPuzzleKey('running1', ['firstLockGate']),
  createPuzzleKey('bridge', ['bossGate']),
  createFilteredLockObstacle('secondLock', ['bridgeGate']),
  createCombatPuzzleKey('enemies1', ['secondLockGate']),
  createPuzzleKey('minecartSwitch1', ['enemies1Key', 'enemies1Gate']),
  createKeyItem('slingshot', 3, ['firstLockKey', ['running1Key', 'running1Gate'], ['minecartSwitch1Key', 'minecartSwitch1Gate']]),
  createCombatPuzzleKey('running2', ['slingshotKey', 'bridgeKey']),
  createFilteredLockObstacle('thirdLock', ['running2Gate', 'running2Key']),
  createMiniboss('miniboss', ['slingshotGate3', 'slingshotGate2', 'thirdLockGate']),
  createMultiKey('doubleJump', 'green', 2, ['slingshotGate1', 'secondLockKey', 'minibossGate', 'minibossKey']),
  createCombatPuzzleKey('enemies2', ['doubleJumpGate']),
  createFilteredLockObstacle('fourthLock', ['enemies2Gate', 'enemies2Key']),
  createCombatPuzzleKey('enemies3', ['thirdLockKey']),
  createSingleLock('minecartSwitch2', 'orange', ['enemies3Gate', 'enemies3Key']),
  createExternalLock('jump', ['minecartSwitch2Key', 'minecartSwitch2Gate', 'fourthLockGate']),
  createCombatPuzzleKey('rollingPins', ['jumpGate']),
  createFilteredLockObstacle('fifthLock', ['rollingPinsKey', 'rollingPinsGate']),
  createPuzzleKey('darkeningRoom', ['fourthLockKey']),
  createCombatPuzzleKey('jumpPlatform', ['darkeningRoomGate', 'darkeningRoomKey']),
  createPuzzleKey('puzzleSwitch', ['jumpPlatformKey', 'jumpPlatformGate']),
  createSingleLock('minecartSwitch3', 'orange', ['puzzleSwitchKey', 'puzzleSwitchGate']),
  createPuzzleKey('pushPot', ['fifthLockKey']),
  createExternalLock('bombWall', ['pushPotGate', 'pushPotKey']),
]

const unicornsCave = [
  createFilteredLockObstacle('firstLock', ['bossKey']),
  createFilteredLockObstacle('secondLock', ['bossGate']),
  createSingleLock('nLock', 'orange', ['firstLockGate']),
  createFilteredLockObstacle('thirdLock', ['nLockGate']),
  createFilteredLockObstacle('fourthLock', ['nLockKey', 'thirdLockGate', 'secondLockGate']),
  createKeyItem('magneticGloves', 4, ['firstLockKey', 'fourthLockGate', 'secondLockKey', 'thirdLockKey']),
  createFilteredLockObstacle('fifthLock', ['magneticGlovesKey']),
]

const unicornsCave2 = [
  createPuzzleKey('magneticPuzzle3', ['bossGate']),
  createCombatPuzzleKey('magneticJumper2', ['magneticPuzzle3Key', 'magneticPuzzle3Gate']),
  createFilteredLockObstacle('firstLock', ['magneticJumper2Gate', 'magneticJumper2Key']),
  createCombatPuzzleKey('conveyerBelt', ['bossKey']),
  createCombatPuzzleKey('magneticJumper1', ['conveyerBeltGate', 'conveyerBeltKey']),
  createFilteredLockObstacle('secondLock', ['magneticJumper1Gate', 'magneticJumper1Key']),
  createMultiKey('magneticBallFire', 'orange', 2, ['secondLockGate']),
  createPuzzleKey('magneticPuzzle2', ['magneticBallFire2Key']),
  createFilteredLockObstacle('thirdLock', ['magneticPuzzle2Gate', 'magneticPuzzle2Key']),
  createCombatPuzzleKey('enemies3', ['magneticBallFire1Key']),
  createMiniboss('miniboss', ['thirdLockGate', 'firstLockGate', 'enemies3Gate', 'enemies3Key']),
  createFilteredLockObstacle('fourthLock', ['minibossKey', 'minibossGate']),
  createKeyItem('magneticGloves', 3, [['firstLockKey', 'fourthLockGate'], 'secondLockKey', 'thirdLockKey']),
  createFilteredLockObstacle('fifthLock', ['magneticGlovesKey']),
  createPuzzleKey('stoneEnemies', ['fourthLockKey']),
  createCombatPuzzleKey('enemies2', ['stoneEnemiesGate', 'stoneEnemiesKey']),
  createCombatPuzzleKey('enemies1', ['enemies2Gate', 'enemies2Key']),
  createPuzzleKey('pushBlock', ['enemies1Gate', 'enemies1Key']),
  createCombatPuzzleKey('dodging', ['pushBlockKey', 'pushBlockGate']),
  createExternalLock('bombStone', ['dodgingGate', 'dodgingKey']),
  createExternalLock('fireJump', ['bombStoneGate', 'fifthLockGate']),
  createSingleLock('minecartSwitch', 'orange', ['fifthLockKey']),
]

const ancientRuins = [
  createPuzzleKey('jumpPuzzle', ['bossGate']),
  createPuzzleKey('boomerangPuzzle', ['jumpPuzzleGate', 'jumpPuzzleKey']),
  createCombatPuzzleKey('dodgingObstacle', ['boomerangPuzzleGate']),
  createMiniboss('miniboss', ['dodgingObstacleKey', 'dodgingObstacleGate']),
  createFilteredLockObstacle('firstLock', ['minibossGate', 'minibossKey']),
  createCombatPuzzleKey('runGauntlet', ['bossKey', 'firstLockGate', 'firstLockKey']),
  createExternalLock('seedShooterPuzzle', ['runGauntletKey', 'runGauntletGate']),
  createKeyItem('magicBoomerang', 1, ['seedShooterPuzzleGate']),
  createExternalLock('bombableWall', ['magicBoomerangKey', 'boomerangPuzzleKey']),
  createCombatPuzzleKey('runningPuzzle', ['bombableWallGate']),
  createCombatPuzzleKey('jumpPuzzle2', ['runningPuzzleGate', 'runningPuzzleKey']),
  createFilteredLockObstacle('secondLock', ['jumpPuzzle2Gate', 'jumpPuzzle2Key']),
  createExternalLock('magneticPuzzle2', ['secondLockKey']),
  createSingleLock('swivel', 'orange', ['magneticPuzzle2Gate']),
  createFilteredLockObstacle('thirdLock', ['swivelKey']),
  createExternalLock('magneticPuzzle1', ['thirdLockKey'])
]

const explorersCrypt = [
  createCombatPuzzleKey('jumpPuzzle3', ['bossKey']),
  createFilteredLockObstacle('firstLock', ['jumpPuzzle3Key', 'jumpPuzzle3Gate']),
  createExternalLock('magneticPuzzle3', ['firstLockKey']),
  createCombatPuzzleKey('stairMaze', ['bossGate', 'magneticPuzzle3Gate', 'firstLockGate']),
  createMiniboss('miniboss', ['stairMazeKey', 'stairMazeGate']),
  createExternalLock('superJump', ['minibossKey', 'minibossGate']),
  createCombatPuzzleKey('enemies3', ['superJumpGate']),
  createExternalLock('jumpPuzzle2', ['enemies3Gate', 'enemies3Key']),
  createFilteredLockObstacle('secondLock', ['jumpPuzzle2Gate']),
  createMultiKey('magneticBall', 'cyan', 2, ['secondLockKey']),
  createPuzzleKey('trampolinePuzzle2', ['magneticBall2Key']),
  createCombatPuzzleKey('enemies2', ['trampolinePuzzle2Gate', 'trampolinePuzzle2Key']),
  createKeyItem('rocsCape', 1, ['enemies2Gate', 'enemies2Key']),
  createCombatPuzzleKey('jumpPuzzle1', ['rocsCapeKey']),
  createPuzzleKey('trampolinePuzzle1', ['jumpPuzzle1Gate', 'jumpPuzzle1Key']),
  createPuzzleKey('magneticPuzzle2', ['trampolinePuzzle1Key', 'trampolinePuzzle1Gate']),
  createCombatPuzzleKey('enemies1', ['magneticPuzzle2Key']),
  createFilteredLockObstacle('thirdLock', ['enemies1Gate', 'enemies1Key', 'magneticPuzzle2Gate', 'secondLockGate']),
  createCombatPuzzleKey('curse2', ['thirdLockGate']),
  createPuzzleKey('cursePuzzle', ['curse2Key']),
  createFilteredLockObstacle('fourthLock', ['cursePuzzleKey', 'cursePuzzleGate']),
  createFilteredLockObstacle('fifthLock', ['fourthLockGate', 'curse2Gate']),
  createPuzzleKey('slidingPuzzle', ['thirdLockKey']),
  createPuzzleKey('magneticPuzzle1', ['slidingPuzzleGate', 'slidingPuzzleKey', 'rocsCapeGate']),
  createPuzzleKey('statuePuzzle', ['fifthLockGate', 'magneticPuzzle1Gate', 'magneticPuzzle1Key']),
  createPuzzleKey('trampolinePuzzle', ['fourthLockKey']),
  createPuzzleKey('curse1', ['statuePuzzleKey', 'statuePuzzleGate', 'magneticBall1Key', 'trampolinePuzzleGate', 'trampolinePuzzleKey', 'magneticBallGate']),
  createFilteredLockObstacle('sixthLock', ['curse1Key'])
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
  createKeyItem('hyperSlingshot', 1, ['fourthLockKey']),
  createSingleLock('nLock', 'orange', ['fifthLockKey']),
  createFilteredLockObstacle('sixthLock', ['fifthLockGate', 'hyperSlingshotGate', 'hyperSlingshotKey', 'nLockGate', 'nLockKey']),
  createFilteredLockObstacle('seventhLock', ['sixthLockGate']),
]

const swordAndShield2 = [
  createFilteredLockObstacle('firstLock', ['bossGate']),
  createSingleLock('frozenLava4', 'silver', ['firstLockGate']),
  createSingleLock('frozenLava3', 'silver', ['frozenLava4Gate']),
  createPuzzleKey('potPuzzle', ['bossKey']),
  createCombatPuzzleKey('ice2d', ['potPuzzleGate', 'potPuzzleKey']),
  createPuzzleKey('pushBlock', ['ice2dGate', 'ice2dKey']),
  createSingleLock('frozenLava2', 'silver', ['firstLockKey']),
  createSingleLock('minecartSwitch', 'orange', ['frozenLava2Gate']),
  createFilteredLockObstacle('secondLock', ['frozenLava4Key']),
  createFilteredLockObstacle('thirdLock', ['frozenLava3Key']),
  createSingleLock('frozenLava1', 'silver', ['secondLockKey']),
  createPuzzleKey('followGhost', ['thirdLockKey']),
  createExternalLock('bombableWall', ['followGhostKey', 'followGhostGate']),
  createFilteredLockObstacle('fourthLock', ['bombableWallGate', 'frozenLava1Gate', 'frozenLava1Key', 'frozenLava2Key', 'frozenLava3Gate', 'secondLockGate', 'thirdLockGate', 'minecartSwitchGate', 'minecartSwitchKey']),
  createPuzzleKey('lightTorches', ['fourthLockGate', 'pushBlockKey', 'pushBlockGate']),
  createMiniboss('miniboss', ['lightTorchesGate', 'lightTorchesKey']),
  createFilteredLockObstacle('fifthLock', ['minibossKey', 'minibossGate']),
  createCombatPuzzleKey('bombableMaze', ['fourthLockKey']),
  createKeyItem('hyperSlingshot', 1, ['bombableMazeKey', 'bombableMazeGate']),
  createExternalLock('magneticPuzzle', ['hyperSlingshotGate', 'fifthLockGate']),
  createSingleLock('switch', 'orange', ['fifthLockKey']),
  createMultiKey('magneticPuzzle2', 'cyan', 2, ['switchKey']),
  createPuzzleKey('silentPuzzle', ['magneticPuzzle22Key']),
  createFilteredLockObstacle('sixthLock', ['switchGate', 'magneticPuzzleGate', 'magneticPuzzle2Gate', 'magneticPuzzle21Key', 'silentPuzzleGate', 'silentPuzzleKey', 'hyperSlingshotKey']),
  createCombatPuzzleKey('dodgeEnemies', ['sixthLockGate']),
  createFilteredLockObstacle('seventhLock', ['dodgeEnemiesGate', 'dodgeEnemiesKey']),
  createPuzzleKey('slingshotPuzzle', ['sixthLockKey']),
  createCombatPuzzleKey('enemies', ['seventhLockKey']),
]

const faceShrine = [
  createFilteredLockObstacle('firstLock', ['bossKey']),
  createFilteredLockObstacle('secondLock', ['firstLockGate']),
  createKeyItem('powerBracelet', 4, ['bossGate', 'firstLockKey', 'secondLockGate', 'secondLockKey']),
]

const palaceOfDarkness = [
  createKeyItem('magicHammer', 1, ['bossGate']),
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
  createKeyItem('iceArrows', 4, ['greenValve1Key', 'redValve2Key', 'redValve1Key', 'bossKey']),
  createFilteredLockObstacle('firstLock', ['iceArrowsKey']),
]

const explorersCave = [
  createFilteredLockObstacle('firstLock', ['bossKey']),
  createFilteredLockObstacle('secondLock', ['bossGate', 'firstLockKey', 'firstLockGate']),
  createKeyItem('rocsCape', 1, ['secondLockKey']),
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
  createKeyItem('lightArrows', 1, ['flipDungeonKey']),
  createFilteredLockObstacle('thirdLock', ['lightArrowsKey']),
  createFilteredLockObstacle('fourthLock', ['thirdLockGate', 'thirdLockKey']),
]

const tailCave = [
  createFilteredLockObstacle('firstLock', ['bossKey']),
  createKeyItem('rocsFeather', 2, ['bossGate', 'firstLockGate']),
  createFilteredLockObstacle('secondLock', ['rocsFeatherKey']),
  createFilteredLockObstacle('thirdLock', ['rocsFeatherGate1']),
]

const spiritsGrave = [
  createKeyItem('powerBracelet', 1, ['bossKey']),
  createFilteredLockObstacle('firstLock', ['powerBraceletKey']),
  createFilteredLockObstacle('secondLock', ['firstLockGate']),
  createFilteredLockObstacle('thirdLock', ['firstLockKey', 'secondLockKey', 'secondLockGate', 'bossGate']),
]

const spiritsGrave2 = [
  createKeyItem('powerBracelet', 1, ['bossKey']),
  createExternalLock('fireSeeds', ['powerBraceletKey']),
  createFilteredLockObstacle('firstLock', ['fireSeedsGate']),
  createMiniboss('miniboss', ['firstLockGate']),
  createFilteredLockObstacle('secondLock', ['minibossGate', 'minibossKey']),
  createFilteredLockObstacle('thirdLock', ['firstLockKey', 'secondLockKey', 'secondLockGate', 'bossGate'])
]

const wingDungeon = [
  createFilteredLockObstacle('firstLock', ['bossGate']),
  createCombatPuzzleKey('camoEnemies', ['bossKey']),
  createFilteredLockObstacle('secondLock', ['camoEnemiesGate', 'camoEnemiesKey']),
  createPuzzleKey('colorMovement', ['firstLockKey']),
  createExternalLock('pushBlockPuzzle', ['colorMovementGate', 'colorMovementKey', 'secondLockGate', 'firstLockGate']),
  createPuzzleKey('minecartPuzzle', ['pushBlockPuzzleGate']),
  createFilteredLockObstacle('thirdLock', ['minecartPuzzleKey', 'minecartPuzzleGate']),
  createExternalLock('bombableWall', ['thirdLockKey']),
  createPuzzleKey('jumpPuzzle', ['bombableWallGate']),
  createKeyItem('rocsFeather', 3, ['thirdLockGate', 'secondLockKey', ['jumpPuzzleGate', 'jumpPuzzleKey']]),
  createMiniboss('miniboss', ['rocsFeatherGate1', 'rocsFeatherGate2', 'rocsFeatherGate3', 'rocsFeatherKey']),
  createFilteredLockObstacle('fourthLock', ['minibossKey', 'minibossGate']),
  createExternalLock('bombableWall2', ['fourthLockKey']),
  createFilteredLockObstacle('fifthLock', ['fourthLockGate', 'bombableWall2Gate']),
  createPuzzleKey('colorGate', ['fifthLockKey']),
]

const moonlightGrotto = [
  createLockObstacle('firstLock', rootValue => rootValue.getLockedChildren()),
  createMultiKey('crystal', 'orange', 4, ['firstLockKey', 'bossKey']),
  createKeyItem('seedShooter', 2, ['firstLockGate', 'crystal4Key']),
  createFilteredLockObstacle('secondLock', ['seedShooterKey']),
  createFilteredLockObstacle('thirdLock', ['secondLockGate']),
  createFilteredLockObstacle('fourthLock', ['seedShooterGate1', 'seedShooterGate2', 'crystalGate', 'crystal3Key', 'thirdLockGate', 'secondLockKey']),
]

const moonlitGrotto = [
  createPuzzleKey('seedShooterPuzzle', ['bossGate']),
  createFilteredLockObstacle('firstLock', ['seedShooterPuzzleGate', 'seedShooterPuzzleKey']),
  createPuzzleKey('pushBlock', ['firstLockKey']),
  createPuzzleKey('seedShooterPuzzle2', ['bossKey']),
  createMiniboss('miniboss', ['seedShooterPuzzle2Gate', 'seedShooterPuzzle2Key', 'pushBlockGate', 'pushBlockKey']),
  createMultiKey('crystal', 'orange', 4, ['minibossKey', 'minibossGate']),
  createKeyItem('seedShooter', 2, ['firstLockGate', 'crystal4Key']),
  createCombatPuzzleKey('enemies1', ['seedShooterKey']),
  createFilteredLockObstacle('secondLock', ['enemies1Gate', 'enemies1Key']),
  createFilteredLockObstacle('thirdLock', ['secondLockGate']),
  createPuzzleKey('blockPush', ['secondLockKey']),
  createPuzzleKey('bombSwitch', ['blockPushGate', 'blockPushKey']),
  createPuzzleKey('bombPuzzle', ['bombSwitchGate', 'bombSwitchKey', 'crystal3Key']),
  createExternalLock('bombStatues', ['thirdLockKey']),
  createFilteredLockObstacle('fourthLock', ['thirdLockGate', 'seedShooterGate2', 'seedShooterGate1', 'bombStatuesGate', 'bombPuzzleGate', 'bombPuzzleKey', 'crystalGate']),
  createPuzzleKey('bombPushBlock', ['fourthLockKey']),
]

const skullDungeon = [
  createPuzzleKey('potPuzzle', ['bossKey']),
  createCombatPuzzleKey('lavaRace3', ['potPuzzleKey', 'potPuzzleGate']),
  createCombatPuzzleKey('lavaRace2', ['lavaRace3Key', 'lavaRace3Gate']),
  createFilteredLockObstacle('firstLock', ['lavaRace2Key', 'lavaRace2Gate']),
  createCombatPuzzleKey('jumpingPuzzle', ['firstLockGate']),
  createCombatPuzzleKey('jumpingSwitchshot', ['bossGate', 'jumpingPuzzleGate', 'jumpingPuzzleKey']),
  createPuzzleKey('colorSwitch', ['firstLockKey']),
  createPuzzleKey('switchshotPuzzle3', ['colorSwitchGate', 'colorSwitchKey', 'jumpingSwitchshotGate', 'jumpingSwitchshotKey']),
  createPuzzleKey('switchshotPuzzle2', ['switchshotPuzzle3Gate', 'switchshotPuzzle3Key']),
  createPuzzleKey('switchshotPuzzle1', ['switchshotPuzzle2Gate', 'switchshotPuzzle2Key']),
  createKeyItem('switchshot', 1, ['switchshotPuzzle1Gate', 'switchshotPuzzle1Key']),
  createPuzzleKey('coverTile', ['switchshotKey']),
  createExternalLock('bombableWall', ['coverTileKey', 'coverTileGate']),
  createMiniboss('miniboss', ['bombableWallGate']),
  createFilteredLockObstacle('secondLock', ['minibossKey', 'minibossGate', 'switchshotGate']),
  createPuzzleKey('colorJump', ['secondLockKey']),
  createCombatPuzzleKey('movingPlatform', ['secondLockGate', 'colorJumpKey', 'colorJumpGate']),
  createCombatPuzzleKey('minecartShooting', ['movingPlatformGate', 'movingPlatformKey']),
  createSingleLock('minecart', 'orange', ['minecartShootingKey', 'minecartShootingGate']),
  createFilteredLockObstacle('thirdLock', ['minecartKey']),
  createExternalLock('seedshooterJump', ['thirdLockKey']),
  createPuzzleKey('minecartPushBlock', ['seedshooterJumpGate', 'minecartGate', 'thirdLockGate']),
  createPuzzleKey('jumpPuzzle', ['minecartPushBlockGate', 'minecartPushBlockKey']),
  createCombatPuzzleKey('lavaRace1', ['jumpPuzzleGate', 'jumpPuzzleKey']),
  createExternalLock('jumping', ['lavaRace1Gate', 'lavaRace1Key']),
  createFilteredLockObstacle('fourthLock', ['jumpingGate']),
  createPuzzleKey('seedShooterPuzzle', ['fourthLockKey']),
  createCombatPuzzleKey('bombPuzzle', ['seedShooterPuzzleGate', 'seedShooterPuzzleKey']),
  createSingleLock('minecart2', 'orange', ['bombPuzzleGate', 'bombPuzzleKey']),
  createSingleLock('minecart3', 'orange', ['fourthLockGate']),
  createFilteredLockObstacle('fifthLock', ['minecart2Gate', 'minecart3Gate', 'minecart2Key', 'minecart3Key']),
  createPuzzleKey('colorPuzzle', ['fifthLockKey']),
  createCombatPuzzleKey('jump', ['fifthLockGate']),
]

const crownDungeon = [
  createPuzzleKey('colorPush', ['bossKey']),
  createExternalLock('blockJumping', ['colorPushGate', 'colorPushKey']),
  createPuzzleKey('colorSwitch3', ['blockJumpingGate']),
  createFilteredLockObstacle('firstLock', ['colorSwitch3Gate', 'colorSwitch3Key']),
  createPuzzleKey('colorSwitch2', ['firstLockGate']),
  createFilteredLockObstacle('secondLock', ['colorSwitch2Gate', 'colorSwitch2Key']),
  createPuzzleKey('colorSwitch1', ['secondLockGate']),
  createFilteredLockObstacle('thirdLock', ['colorSwitch1Gate', 'colorSwitch1Key']),
  createExternalLock('jumpCanePuzzle', ['firstLockKey']),
  createExternalLock('seedShooterPuzzle', ['jumpCanePuzzleGate']),
  createKeyItem('somariaCane', 4, ['thirdLockKey', 'secondLockKey', 'seedShooterPuzzleKey', 'thirdLockGate']),
  createMiniboss('miniboss', ['somariaCaneGate4']),
  createPuzzleKey('colorMatch', ['somariaCaneKey']),
  createExternalLock('seedShooterFire', ['colorMatchGate', 'colorMatchKey']),
  createFilteredLockObstacle('fourthLock', ['somariaCaneGate2', 'seedShooterFireGate']),
  createFilteredLockObstacle('fifthLock', ['minibossGate', 'minibossKey']),
  createSingleLock('colorSwitch0', 'cyan', ['somariaCaneGate1']),
  createExternalLock('seedshooterPouch', ['fourthLockKey']),
  createPuzzleKey('colorAirlock', ['seedshooterPouchGate']),
  createPuzzleKey('colorSwitcher', ['somariaCaneGate3', 'fifthLockKey', 'fourthLockGate', 'colorAirlockGate', 'colorAirlockKey']),
]

const mermaidsCave = [
  createFilteredLockObstacle('firstLock', ['bossGate']),
  createFilteredLockObstacle('secondLock', ['bossKey']),
  createFilteredLockObstacle('thirdLock', ['firstLockGate']),
  createKeyItem('mermaidSuit', 2, ['firstLockKey', 'thirdLockKey']),
  createFilteredLockObstacle('fourthLock', ['mermaidSuitKey']),
  createSingleLock('timeTravelBombLock', 'orange', ['fourthLockKey', 'fourthLockGate']),
  createSingleLock('wallLock', 'orange', ['secondLockGate']),
  createFilteredLockObstacle('fifthLock', ['timeTravelBombLockKey', 'mermaidSuitGate2', 'thirdLockGate']),
]

// 249 with external locks
// 293 with external locks beside use
const mermaidsCave2 = [
  // Past
  createExternalLock('caneSeedShooter', ['bossGate']),
  createFilteredLockObstacle('firstLock', ['caneSeedShooterGate']),
  createFilteredLockObstacle('secondLock', ['firstLockGate']),
  createExternalLock('switchShotPuzzle', ['firstLockKey']),
  createCombatPuzzleKey('currentsPuzzle', ['secondLockKey']),
  createKeyItem('mermaidSuit', 2, [['currentsPuzzleKey', 'currentsPuzzleGate'], ['switchShotPuzzleGate']]),

  // Present
  createExternalLock('throwingBombs', ['mermaidSuitKey']),
  createMiniboss('miniboss', ['throwingBombsGate']),
  createFilteredLockObstacle('fourthLock', ['minibossGate', 'minibossKey']),
  createSingleLock('timeWallLock2', 'silver', ['fourthLockKey', 'fourthLockGate']),
  createFilteredLockObstacle('fifthLock', ['bossKey']),
  createExternalLock('jumpPuzzle3', ['fifthLockGate']),
  createExternalLock('switchShot', ['jumpPuzzle3Gate']),
  createFilteredLockObstacle('sixthLock', ['switchShotGate']),
  createCombatPuzzleKey('candleEnemies', ['sixthLockGate']),
  createSingleLock('timeWallLock1', 'silver', ['candleEnemiesGate', 'candleEnemiesKey']),
  createPuzzleKey('snakeScent', ['fifthLockKey']),
  createPuzzleKey('colorPuzzle', ['sixthLockKey']),
  createExternalLock('bombableWall', ['colorPuzzleGate', 'colorPuzzleKey']),
  createExternalLock('seedShooter', ['bombableWallGate', 'snakeScentGate', 'snakeScentKey', 'timeWallLock2Gate']),

  // Past
  createSingleLock('timeTravelWall2', 'orange', ['secondLockGate', 'mermaidSuitGate2', 'timeWallLock2Key']),
  createExternalLock('jumpPuzzle', ['timeTravelWall2Gate']),
  createExternalLock('canePuzzle', ['jumpPuzzleGate']),
  createFilteredLockObstacle('thirdLock', ['canePuzzleGate']),
  createExternalLock('jumpPuzzle2', ['thirdLockKey']),
  createExternalLock('lightFirePuzzle', ['mermaidSuitGate1']),
  createSingleLock('timeTravelWall1', 'orange', ['lightFirePuzzleGate', 'timeWallLock1Key']),
]

const jabujabuBelly = [
  createFilteredLockObstacle('firstLock', ['bossKey']),
  createFilteredLockObstacle('secondLock', ['firstLockGate']),
  createFilteredLockObstacle('thirdLock', ['secondLockGate']),
  createPuzzleKey('topSwitchshot', ['firstLockKey']),
  createSingleLock('raiseWaterSwitch2', 'orange', ['secondLockKey', 'bossGate', 'topSwitchshotGate', 'topSwitchshotKey']),
  createFilteredLockObstacle('fourthLock', ['thirdLockGate', 'raiseWaterSwitch2Key', 'raiseWaterSwitch2Gate']),
  createKeyItem('switchShot', 3, ['thirdLockKey', 'fourthLockKey', 'fourthLockGate']),
  createFilteredLockObstacle('fifthLock', ['switchShotKey']),
  createMiniboss('miniboss', ['fifthLockGate']),
  createCombatPuzzleKey('enemies1', ['fifthLockKey']),
  createSingleLock('raiseWaterSwitch1', 'cyan', ['enemies1Gate', 'enemies1Key', 'minibossGate', 'minibossKey', 'switchShotGate2']),
  createFilteredLockObstacle('sixthLock', ['raiseWaterSwitch1Gate', 'raiseWaterSwitch1Key']),
  createPuzzleKey('switchShotPuzzle', ['sixthLockGate', 'switchShotGate1']),
  createExternalLock('canePuzzle', ['switchShotPuzzleGate', 'switchShotPuzzleKey']),
  createSingleLock('drainWater', 'pink', ['sixthLockKey', 'canePuzzleGate']),
  createFilteredLockObstacle('seventhLock', ['drainWaterGate', 'drainWaterKey']),
  createPuzzleKey('switchShotMoving', ['seventhLockKey']),
]

const jabujabuOracle = [
  createFilteredLockObstacle('firstLock', ['bossKey']),
  createFilteredLockObstacle('secondLock', ['firstLockGate']),
  createFilteredLockObstacle('thirdLock', ['secondLockGate']),
  createSingleLock('level3Water', 'orange', ['firstLockKey', 'secondLockKey', 'bossGate']),
  createFilteredLockObstacle('fourthLock', ['thirdLockGate', 'level3WaterKey']),
  createKeyItem('switchShot', 3, ['thirdLockKey', 'fourthLockKey', 'fourthLockGate']),
  createFilteredLockObstacle('fifthLock', ['switchShotKey']),
  createMultiLock('level2Water', 'pink', 2, ['fifthLockKey', 'switchShotGate1']),
  createFilteredLockObstacle('sixthLock', ['level2WaterKey', 'fifthLockGate']),
  createMultiLock('level1WaterFirst', 'orange', 4, ['switchShotGate3', 'sixthLockKey', 'sixthLockGate', 'level2WaterGate2']),
  createFilteredLockObstacle('seventhLock', ['level1WaterFirstKey']),
]

const ancientTomb = [
  createPuzzleKey('lightFire', ['bossGate']),
  createMultiKey('sarcophogus', 'orange', 4, ['lightFireKey', 'lightFireGate']),
  createCombatPuzzleKey('lavaRun', ['sarcophogus4Key']),
  createFilteredLockObstacle('firstLock', ['lavaRunKey', 'lavaRunGate']),
  createCombatPuzzleKey('waterfallPuzzle', ['sarcophogus3Key']),
  createCombatPuzzleKey('icePuzzle', ['waterfallPuzzleKey', 'waterfallPuzzleGate']),
  createPuzzleKey('movingWall', ['sarcophogus2Key']),
  createCombatPuzzleKey('enemies1', ['movingWallGate', 'movingWallKey']),
  createPuzzleKey('minecartPuzzle', ['enemies1Key', 'enemies1Gate']),
  createExternalLock('switchshotPuzzle1', ['bossKey']),
  createPuzzleKey('powerGlovePuzzle', ['switchshotPuzzle1Gate', 'minecartPuzzleKey']),
  createExternalLock('switchshotPuzzle2', ['firstLockKey', 'sarcophogus1Key']),
  createExternalLock('switchshotPuzzle3', ['switchshotPuzzle2Gate']),
  createExternalLock('jumpPuzzle1', ['minecartPuzzleGate', 'icePuzzleGate', 'icePuzzleKey']),
  createMiniboss('miniboss', ['switchshotPuzzle3Gate', 'sarcophogusGate', 'firstLockGate', 'jumpPuzzle1Gate', 'powerGlovePuzzleKey', 'powerGlovePuzzleGate']),
  createExternalLock('jumpPuzzle2', ['minibossGate', 'minibossKey']),
  createKeyItem('powerGlove', 1, ['jumpPuzzle2Gate']),
  createPuzzleKey('fillColor', ['powerGloveKey']),
  createFilteredLockObstacle('secondLock', ['powerGloveGate']),
  createFilteredLockObstacle('thirdLock', ['fillColorGate', 'fillColorKey']),
  createPuzzleKey('colorSwitch', ['thirdLockGate', 'secondLockGate', 'secondLockKey']),
  createExternalLock('bombableWall', ['thirdLockKey']),
  createFilteredLockObstacle('fourthLock', ['colorSwitchGate', 'colorSwitchKey', 'bombableWallGate']),
  createPuzzleKey('multiSwitch', ['fourthLockGate', 'fourthLockKey']),
  createFilteredLockObstacle('fifthLock', ['multiSwitchGate', 'multiSwitchKey']),
  createExternalLock('bombMaze', ['fifthLockKey', 'fifthLockGate'])
]

const earthTemple = [
  createSingleLock('mirror', 'orange', ['bossKey', 'bossGate']),
  createFilteredLockObstacle('firstLock', ['mirrorGate']),
  createKeyItem('mirrorShield', 1, ['mirrorKey', 'firstLockKey', 'firstLockGate']),
  createFilteredLockObstacle('secondLock', ['mirrorShieldKey']),
  createFilteredLockObstacle('thirdLock', ['secondLockGate', 'secondLockKey']),
]

const windTemple = [
  createFilteredLockObstacle('firstLock', ['bossGate']),
  createSingleLock('fan', 'cyan', ['firstLockKey']),
  createSingleLock('secondFloor', 'orange', ['firstLockGate']),
  createMultiLock('makar', 'green', 2, ['fanKey', 'bossKey']),
  createKeyItem('hookshot', 2, ['makarKey', 'secondFloorKey']),
  createFilteredLockObstacle('secondLock', ['hookshotKey']),
  createSingleLock('firstFloor', 'orange', ['secondLockKey', 'secondLockGate', 'secondFloorGate', 'makarGate2']),
]

const towerOfTheGods = [
  createSingleLock('eLock', 'orange', ['bossGate', 'bossKey']),
  createFilteredLockObstacle('firstLock', ['eLockKey']),
  createKeyItem('herosBow', 1, ['firstLockKey', 'firstLockGate']),
  createMultiLock('dLock', 'green', 2, ['herosBowGate', 'herosBowKey']),
  createSingleLock('cLock', 'silver', ['dLockKey', 'dLockGate1']),
  createSingleLock('bLock', 'cyan', ['eLockGate', 'dLockGate2', 'cLockGate']),
  createFilteredLockObstacle('secondLock', ['bLockKey']),
  createSingleLock('aLock', 'purple', ['secondLockKey']),
]

const deepwoodShrine = [
  createFilteredLockObstacle('firstLock', ['bossKey']),
  createKeyItem('arrow', 2, ['bossGate', 'firstLockGate']),
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
  createKeyItem('arrow', 1, ['seventhLockGate', 'seventhLockKey']),
]

const forestTempleTwilight = [
  createMultiKey('thirdMonkey', 'orange', 4, ['bossGate']),
  createFilteredLockObstacle('firstLock', ['thirdMonkey3Key']),
  createSingleLock('boomerangPuzzle', 'purple', ['thirdMonkey1Key', 'thirdMonkey2Key', 'firstLockGate', 'firstLockKey', 'thirdMonkeyGate']),
  createKeyItem('boomerang', 2, ['bossKey', 'boomerangPuzzleGate']),
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
  createKeyItem('ballAndChain', 2, ['cLockKey', 'dLockKey']),
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
  createKeyItem('arrows', 2, ['timeShift1Key', 'aLockKey']),
  createFilteredLockObstacle('secondLock', ['arrowsKey'])
]

const skyViewTemple = [
  createFilteredLockObstacle('firstLock', ['bossGate', 'bossKey']),
  createKeyItem('arrow', 1, ['firstLockKey']),
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
  createKeyItem('arrow', 2, ['fourthLockGate', 'fourthLockKey']),
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
  createKeyItem('grappleHook', 1, ['bossGate']),
  createFilteredLockObstacle('firstLock', ['grappleHookGate', 'grappleHookKey', 'bossKey']),
  createFilteredLockObstacle('secondLock', ['firstLockGate', 'firstLockKey']),
  createFilteredLockObstacle('thirdLock', ['secondLockGate', 'secondLockKey']),
  createFilteredLockObstacle('fourthLock', ['thirdLockGate', 'thirdLockKey']),
]

const spiritTemple = [
  createSingleLock('mirrorPuzzle', 'silver', ['bossGate']),
  createSingleLock('hookshotSwitch', 'silver', ['bossKey']),
  createSingleLock('arrowSwitch', 'green', ['hookshotSwitchKey']),
  createSingleLock('bombDoor', 'green', ['arrowSwitchGate']),
  createSingleLock('zeldaDoor', 'green', ['hookshotSwitchGate', 'bombDoorGate']),
  createSingleLock('climbWall', 'pink', ['zeldaDoorGate', 'mirrorPuzzleGate', 'mirrorPuzzleKey']),
  createFilteredLockObstacle('firstLock', ['climbWallGate', 'climbWallKey']),
  createSingleLock('mirrorShield', 'lightGreen', ['firstLockKey']),
  createSingleLock('ironKnuckle2', 'purple', ['mirrorShieldKey']),
  createSingleLock('statueSwitch', 'silver', ['ironKnuckle2Gate', 'ironKnuckle2Key']),
  createSingleLock('anubis2', 'pink', ['firstLockGate', 'mirrorShieldGate', 'statueSwitchKey', 'statueSwitchGate']),
  createFilteredLockObstacle('secondLock', ['anubis2Gate', 'anubis2Key']),
  createSingleLock('lullabyHand', 'green', ['secondLockKey']),
  createSingleLock('fourMirrors', 'silver', ['lullabyHandKey', 'lullabyHandGate', 'secondLockGate']),
  createSingleLock('fiveRupees2', 'silver', ['fourMirrorsGate', 'fourMirrorsKey'])
]

// Try as adult - fail
// Come back as child
// Crawlhole - available locked gate, light two fires, boomerang crystal
// beat boomerang crystal
// anubis fire puzzle
// collect silver rupees - unlocks two light fires key
// two light fires rewards small key
// use small key on locked gate
// Bombchu puzzle to light sun
// Collect silver rupees
// Light torches - small key
// Light sun
// Locked gate - use small key
// Armoured dude
// Silver gauntlets
// Adult
// Push block
// Switch to unlock gates - compass, and small key available
// Zeldas lullaby and longshot to get compass (wolfos room)
// Collect 5 silver rupees (rolling boulders room) - small key
// Four sun mirror puzzle (to open door) - locked gate, lullaby hand avaialbe
// Lullaby on hand to get key
// Use small key on locked gate


const forestTemple = [
  createSingleLock('spinningPuzzle', 'cyan', ['bossGate']),
  createMultiKey('poeSisters', 'orange', 4, ['spinningPuzzleGate', 'spinningPuzzleKey']),
  createCombatPuzzleKey('killPoeSister', ['poeSisters4Key']),
  createCombatPuzzleKey('killPoeSister2', ['killPoeSisterGate', 'killPoeSisterKey']),
  createCombatPuzzleKey('fallingPuzzle', ['killPoeSister2Gate', 'killPoeSister2Key', 'poeSisters3Key']),
  createFilteredLockObstacle('fourthLock', ['fallingPuzzleKey', 'fallingPuzzleGate',]), // Floormaster
  createCombatPuzzleKey('fallingRoof', ['fourthLockGate']),
  createPuzzleKey('arrowIntoIce', ['fallingRoofKey', 'fallingRoofGate']),
  createFilteredLockObstacle('fifthLock', ['arrowIntoIceGate', 'arrowIntoIceKey']),  // Kill Second Poe treasure
  createCombatPuzzleKey('enemies2', ['poeSisters1Key', 'fifthLockKey']),
  createPuzzleKey('pictureShot1', ['enemies2Key', 'enemies2Gate']),
  createCombatPuzzleKey('enemies3', ['poeSisters2Key']),
  createPuzzleKey('pictureShot2', ['enemies3Key', 'enemies3Gate']),
  createCombatPuzzleKey('enemies5', ['fourthLockKey']),
  createKeyItem('bow', 3, [['bossKey', 'enemies5Key', 'enemies5Gate'], ['pictureShot1Gate', 'pictureShot1Key'], ['pictureShot2Gate', 'pictureShot2Key']]),
  createCombatPuzzleKey('enemies4', ['bowKey']),
  createFilteredLockObstacle('thirdLock', ['bowGate2', 'bowGate3', 'fifthLockGate', 'enemies4Gate', 'enemies4Key']), // Under well
  createSingleLock('drainWell', 'pink', ['thirdLockKey']),
  createCombatPuzzleKey('climbWall', ['drainWellGate', 'drainWellKey']),
  createExternalLock('timeSong', ['climbWallKey', 'climbWallGate']),
  createFilteredLockObstacle('secondLock', ['thirdLockGate']), // Back room skeleton
  createCombatPuzzleKey('enemies1', ['secondLockKey']),
  createPuzzleKey('pushBlock', ['secondLockGate', 'bowGate1']),
  createFilteredLockObstacle('firstLock', ['pushBlockGate', 'pushBlockKey']), // Wolfos
]

const fireTemple = [
  createSingleLock('fireMiniboss2', 'silver', ['bossKey']),
  createFilteredLockObstacle('firstLock', ['fireMiniboss2Gate', 'fireMiniboss2Key']),
  createKeyItem('hammer', 3, ['firstLockGate', 'firstLockKey', 'bossGate']),
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
  createKeyItem('boomerang', 1, ['redTentacleKey']), 
  createSingleLock('throwRuto', 'silver', ['boomerangKey']),
  createSingleLock('slingshot', 'green', ['throwRutoKey', 'throwRutoGate', 'boomerangGate', 'greenTentacleGate', 'blueTentacleGate', 'redTentacleGate']),
]
