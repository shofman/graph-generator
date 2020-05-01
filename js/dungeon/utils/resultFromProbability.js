export const resultFromProbability = (randomizer, resultTable, pickedValue) => {
  const numberBetween0And100 = randomizer() * 100

  let currentValue = 0
  let found = false

  Object.keys(resultTable).forEach(keyType => {
    const probabilityValue = resultTable[keyType]
    if (!found) {
      currentValue += probabilityValue
      if (currentValue >= numberBetween0And100) {
        pickedValue = keyType
        found = true
      }
    }
  })

  return pickedValue
}
