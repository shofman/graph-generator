export const getRandomIntInclusive = (randomizer, min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  //The maximum is inclusive and the minimum is inclusive
  return Math.floor(randomizer() * (max - min + 1)) + min
}
