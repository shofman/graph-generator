const unzip = (results = {}) => {
  let targetRow = initialGrid.findIndex(row => row.some(block => block === target))
  let targetCol = initialGrid[targetRow].findIndex(block => block === target)
  let key = generateKey(targetCol, targetRow)
  let intersectionPoints = []

  do {
    let lineWithTarget = undefined
    let lineWithTargetIndex

    // Assert there is only one direction this could have come from
    const validDirections = Object.keys(lineGrid).filter(direction => {
      return lineGrid[direction].filter((line, index) => {
        const containsTarget = line.includes(key)
        if (containsTarget) {
          lineWithTarget = JSON.parse(JSON.stringify(line))
          lineWithTargetIndex = [direction, index]
        }
        return containsTarget
      }).length === 1
    })
    if (validDirections.length > 1 || lineWithTarget === undefined) {
      console.log('we are returning early', validDirections.length > 1, lineWithTarget === undefined)
      return results
    }

    let indexOfTarget = lineWithTarget.indexOf(key)

    // Assert that the target is at the beginning/end of a line
    if (indexOfTarget !== 0 && indexOfTarget !== lineWithTarget.length - 1) {
      // If not, we need to split the current line into multiple sections
      const randomResult = randomizer()
      let firstChunk
      let secondChunk

      // TODO - check to see if odd vs even makes a differnence here
      if (randomResult > .5) {
        firstChunk = lineWithTarget.slice(0, indexOfTarget)
        secondChunk = lineWithTarget.slice(indexOfTarget)
      } else {
        firstChunk = lineWithTarget.slice(0, indexOfTarget + 1)
        secondChunk = lineWithTarget.slice(indexOfTarget + 1)
      }
      const currentDirection = lineWithTargetIndex[0]
      // remove the current troublesome line
      lineGrid[currentDirection].splice(lineWithTargetIndex[1], 1)

      // replace with two new lines
      lineGrid[currentDirection].push(firstChunk)
      lineGrid[currentDirection].push(secondChunk)

      const chunkToUse = firstChunk.indexOf(key) !== -1 ? firstChunk : secondChunk

      // Update our details to use the target
      lineWithTarget = JSON.parse(JSON.stringify(chunkToUse))
      indexOfTarget = chunkToUse.indexOf(key)
      lineWithTargetIndex = [currentDirection, lineGrid[currentDirection].indexOf(chunkToUse)]
    }

    let blockValue = 0

    const methodOfRemoval = indexOfTarget === 0 ? 'shift' : 'pop'

    lineWithTarget[methodOfRemoval]()
    while(lineWithTarget.length) {
      const currentEntry = lineWithTarget[methodOfRemoval]()
      if (!lineWithTarget.length) {
        // we are at the last entry - our currentTotal is the max it needs to be
        blockValue += 1
        results[currentEntry] = blockValue

      } else if (Object.keys(lineGrid).every(direction => lineGrid[direction].some(row => row.some(block => block === currentEntry)))) {
        intersectionPoints.push(currentEntry)
      } else {
        const splitPoint = currentEntry.split(',')
        const removalCol = splitPoint[0]
        const removalRow = splitPoint[1]

        currentGrid[removalRow][removalCol] = emptySpace

        blockValue += 1
      }
    }

    // Remove processed line
    lineGrid[lineWithTargetIndex[0]].splice(lineWithTargetIndex[1], 1)

    draw()
    debugger // eslint-disable-line

    if (intersectionPoints.length) {
      const currentPoint = intersectionPoints.pop()
      const splitPoint = currentPoint.split(',')
      targetCol = splitPoint[0]
      targetRow = splitPoint[1]
      currentGrid[targetRow][targetCol] = emptySpace
      key = generateKey(targetCol, targetRow)
    }

    draw()
    debugger // eslint-disable-line

  } while(lineGrid['vertical'].length > 0 || lineGrid['horizontal'].length > 0  || intersectionPoints.length > 0)

  console.log('results', results)
  return results
}