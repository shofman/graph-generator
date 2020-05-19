export const randChunkSplit = (randomizer, rooms, min, max) => {
  if (typeof randomizer !== 'function') throw new Error('Randomizer must be a function')
  const roomsToChunk = rooms.slice()
  const newChunks = []
  let size = 1
  while (roomsToChunk.length > 0) {
    size = Math.min(max, Math.floor(randomizer() * max + min))
    newChunks.push(roomsToChunk.splice(0, size))
  }
  return newChunks
}
