import { KEY_TYPES } from '../dungeonStructure/keyTypes.js'

const getRandomIntInclusive = (randomizer, min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  //The maximum is inclusive and the minimum is inclusive
  return Math.floor(randomizer() * (max - min + 1)) + min
}

export const drawDungeon = (canvas, dungeonToDraw) => {
  if (!dungeonToDraw.convertedSteps) {
    return
  }
  // console.log(canvas, dungeonToDraw)

  const DUNGEON_SIZE_X = 120
  const DUNGEON_SIZE_Y = 100

  const ctx = canvas.getContext('2d')

  let minRooms = 0
  let maxRooms = 0

  // Static rooms
  const numberOfBossRooms = 4 // 1 for key, 1 for gate, 1 for victory room, 1 for boss fight
  const numberOfStartingRooms = 1

  // Variable rooms
  const singleRooms = key => key.type === KEY_TYPES.SINGLE_ROOM_PUZZLE
  const singleLocks = key => key.type === KEY_TYPES.SINGLE_LOCK_KEY
  const normalLocks = key => key.type === KEY_TYPES.NORMAL_KEY
  const externalLocks = key => key.type === KEY_TYPES.EXTERNAL_LOCK

  const numberOfSingleRooms = dungeonToDraw.convertedSteps.filter(singleRooms).length

  // Max evaluation assumes locks have two options - a single room for a lock, and single room for a key
  // Max assumes that the external lock is worthy of its own room
  const numberOfSingleLockRooms = dungeonToDraw.convertedSteps.filter(singleLocks).length * 2
  const numberOfNormalLocks = dungeonToDraw.convertedSteps.filter(normalLocks).length * 2
  const numberOfExternalRooms = dungeonToDraw.convertedSteps.filter(externalLocks).length

  // Min evaluation should take into account surrounding elements

  maxRooms =
    numberOfNormalLocks +
    numberOfStartingRooms +
    numberOfSingleRooms +
    numberOfSingleLockRooms +
    numberOfNormalLocks +
    numberOfExternalRooms
  // console.log(maxRooms)

  let dungeon = []
  for (let i = 0; i < DUNGEON_SIZE_Y; i++) {
    let setToOne = i === 0 || i === DUNGEON_SIZE_Y - 1
    dungeon.push(
      Array.apply(null, Array(DUNGEON_SIZE_X)).map((j, index) => {
        return index === 0 || index === DUNGEON_SIZE_X - 1 || setToOne ? 1 : 0
      })
    )
  }

  const MAX_ATTEMPTS = 600

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const newRoomWidth = getRandomIntInclusive(dungeonToDraw.randomizer, 15, 35)
    const newRoomHeight = getRandomIntInclusive(dungeonToDraw.randomizer, 15, 35)
    const randomX = getRandomIntInclusive(
      dungeonToDraw.randomizer,
      1,
      DUNGEON_SIZE_X - newRoomWidth - 1
    )
    const randomY = getRandomIntInclusive(
      dungeonToDraw.randomizer,
      1,
      DUNGEON_SIZE_Y - newRoomHeight - 1
    )

    let canPlace = true
    for (let y = randomY - 1; y < randomY + newRoomHeight + 1; y++) {
      for (let x = randomX - 1; x < randomX + newRoomWidth + 1; x++) {
        if (dungeon[y][x] === 1) {
          canPlace = false
        }
      }
    }

    if (!canPlace) {
      // console.log('canPlace', canPlace)
    }

    if (canPlace) {
      for (let y = randomY; y < randomY + newRoomHeight; y++) {
        for (let x = randomX; x < randomX + newRoomWidth; x++) {
          dungeon[y][x] = 1
        }
      }
    }
  }

  dungeon.forEach((row, yIndex) => {
    row.forEach((point, xIndex) => {
      if (point === 1) {
        ctx.fillStyle = '#000000'
      } else {
        ctx.fillStyle = '#FFFFFF'
      }
      ctx.fillRect(xIndex * 4, yIndex * 4, 4, 4)
    })
  })
  ctx.stroke()
}

export const drawDungeonRooms = (canvas, rooms) => {
  const ctx = canvas.getContext('2d')

  let yIndex = 0

  const HEIGHT_OF_LETTERS = 20
  const GAP_BETWEEN_BOXES = 30
  const LETTER_OFFSET = 13

  rooms.forEach(groups => {
    const boxHeight = groups.nodesInRoom.length * HEIGHT_OF_LETTERS
    ctx.strokeStyle = 'red'
    ctx.rect(0, yIndex, 150, boxHeight)
    ctx.stroke()

    groups.nodesInRoom.forEach((node, index) => {
      ctx.fillText(node.name, 5, yIndex + LETTER_OFFSET + HEIGHT_OF_LETTERS * index)
    })

    yIndex += boxHeight + GAP_BETWEEN_BOXES
  })
}
