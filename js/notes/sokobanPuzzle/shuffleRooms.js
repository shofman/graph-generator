export const shuffleRooms = (rooms, randomizer) => {
  const shuffledRooms = []
  while (rooms.length) {
    const randomIndex = Math.floor(randomizer() * rooms.length)
    const selectedItem = rooms.splice(randomIndex, 1)[0]
    shuffledRooms.push(selectedItem)
  }
  return shuffledRooms
}
