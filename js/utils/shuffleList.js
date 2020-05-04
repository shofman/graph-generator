export const shuffleList = (list, randomizer) => {
  const shuffledList = []
  while (list.length) {
    const randomIndex = Math.floor(randomizer() * list.length)
    const selectedItem = list.splice(randomIndex, 1)[0]
    shuffledList.push(selectedItem)
  }
  return shuffledList
}
