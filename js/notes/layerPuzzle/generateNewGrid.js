import { OBSTACLE, TARGET, EMPTY } from './blockTypes.js'
import { generateKey, getValuesFromKey } from './generateKey.js'
import { createLines } from './createLinesOnGrid.js'
import { getOtherDirection } from './helpers.js'
import {
  increaseGridYLength,
  increaseGridXLength,
  isWithinXGrid,
  isWithinYGrid,
} from './gridDimensions.js'

export const evaluateDensity = grid => {
  let totalEmpty = 0
  let totalFilled = 0

  grid.forEach(row => {
    row.forEach(columnEntry => {
      if (columnEntry === OBSTACLE || columnEntry === TARGET) {
        totalFilled++
      } else if (columnEntry === EMPTY) {
        totalEmpty++
      }
    })
  })
  return totalFilled / (totalFilled + totalEmpty)
}

// Calc score - avg distance / number of filled blocks
const calcScore = (grid, distanceGraph) => {
  let totalFilled = 0
  let totalDistance = 0

  grid.forEach((row, rowIndex) => {
    row.forEach((columnEntry, colIndex) => {
      if (columnEntry === OBSTACLE || columnEntry === TARGET) {
        totalDistance += distanceGraph[rowIndex][colIndex].distance
        totalFilled++
      }
    })
  })

  const avgDistance = totalDistance / totalFilled
  return avgDistance
}

const prepareVisitationGraph = grid => {
  const newGrid = grid.map(row => {
    const newRows = row.map(block => {
      if (block === OBSTACLE || block === TARGET) {
        return { visited: false, block: true, distance: 0 }
      } else {
        return { block: false }
      }
    })
    return newRows
  })
  return newGrid
}

const depthFirstSearch = (x, y, visitedGraph, searchGroup) => {
  if (!isWithinXGrid(x)) return 0
  if (!isWithinYGrid(y)) return 0
  if (!visitedGraph[y] || !visitedGraph[y][x]) return 0
  if (visitedGraph[y][x].visited) return 0
  if (!visitedGraph[y][x].block) return 0

  visitedGraph[y][x].visited = true
  visitedGraph[y][x].searchGroup = searchGroup

  depthFirstSearch(x - 1, y, visitedGraph, searchGroup)
  depthFirstSearch(x, y - 1, visitedGraph, searchGroup)
  depthFirstSearch(x + 1, y, visitedGraph, searchGroup)
  depthFirstSearch(x, y + 1, visitedGraph, searchGroup)
}

/*
1  procedure BFS(G,start_v):
2      let S be a queue
3      S.enqueue(start_v)
4      while S is not empty
5          v = S.dequeue()
6          if v is the goal:
7              return v
8          for all edges from v to w in G.adjacentEdges(v) do
9              if w is not labeled as discovered:
10                 label w as discovered
11                 w.parent = v
12                 S.enqueue(w)
*/

const distanceSearch = (startNode, visitedGraph) => {
  const toVisitQueue = [startNode]

  const createDistanceNode = (x, y, distance) => generateKey(x, y) + ',' + distance

  const hasNextLeftBlock = (columnIndex, rowIndex) => {
    if (!isWithinXGrid(columnIndex - 1)) return false
    const potentialBlock = visitedGraph[rowIndex][columnIndex - 1]
    return potentialBlock && !potentialBlock.visited && potentialBlock.block
  }
  const hasNextRightBlock = (columnIndex, rowIndex) => {
    if (!isWithinXGrid(columnIndex + 1)) return false
    const potentialBlock = visitedGraph[rowIndex][columnIndex + 1]
    return potentialBlock && !potentialBlock.visited && potentialBlock.block
  }
  const hasNextTopBlock = (columnIndex, rowIndex) => {
    if (!isWithinYGrid(rowIndex - 1)) return false
    const potentialBlock = visitedGraph[rowIndex - 1][columnIndex]
    return potentialBlock && !potentialBlock.visited && potentialBlock.block
  }
  const hasNextBottomBlock = (columnIndex, rowIndex) => {
    if (!isWithinYGrid(rowIndex + 1)) return false
    const potentialBlock = visitedGraph[rowIndex + 1][columnIndex]
    return potentialBlock && !potentialBlock.visited && potentialBlock.block
  }

  while (toVisitQueue.length) {
    const newNode = toVisitQueue.shift()
    const [x, y, distance] = getValuesFromKey(newNode)
    const newDistance = distance + 1

    visitedGraph[y][x].visited = true

    if (hasNextLeftBlock(x, y)) {
      visitedGraph[y][x - 1].visited = true
      visitedGraph[y][x - 1].distance = newDistance
      toVisitQueue.push(createDistanceNode(x - 1, y, newDistance))
    }
    if (hasNextRightBlock(x, y)) {
      visitedGraph[y][x + 1].visited = true
      visitedGraph[y][x + 1].distance = newDistance
      toVisitQueue.push(createDistanceNode(x + 1, y, newDistance))
    }

    if (hasNextTopBlock(x, y)) {
      visitedGraph[y - 1][x].visited = true
      visitedGraph[y - 1][x].distance = newDistance
      toVisitQueue.push(createDistanceNode(x, y - 1, newDistance))
    }

    if (hasNextBottomBlock(x, y)) {
      visitedGraph[y + 1][x].visited = true
      visitedGraph[y + 1][x].distance = newDistance
      toVisitQueue.push(createDistanceNode(x, y + 1, newDistance))
    }
  }
}

const findGroupsWithFlooding = visitedGraph => {
  let searchGroup = 0
  visitedGraph.forEach((row, rowPos) => {
    row.forEach((item, colPos) => {
      if (item.block && !item.visited) {
        depthFirstSearch(colPos, rowPos, visitedGraph, searchGroup)
        searchGroup++
      }
    })
  })
}

const useIfExists = item => (item ? item : 0)

const findLargestTotal = searchGroupResults => {
  let largestTotal = 0
  let largestKeyArray = []
  Object.keys(searchGroupResults).forEach(key => {
    if (searchGroupResults[key] > largestTotal) {
      largestTotal = searchGroupResults[key]
      largestKeyArray = [key]
    } else if (searchGroupResults[key] === largestTotal) {
      largestKeyArray.push(key)
    }
  })
  return largestKeyArray
}

const createNewGridFilteredByKey = (grid, key) => {
  const newGrid = grid.map(row => {
    const newRows = row.map(currentItem => {
      if (currentItem.block && currentItem.searchGroup === Number(key)) {
        return OBSTACLE
      }
      return EMPTY
    })
    return newRows
  })
  return newGrid
}

const findMaxDistance = visitedGraph => {
  let maxDistance = 0
  visitedGraph.forEach(row => {
    row.forEach(block => {
      if (block.distance > maxDistance) {
        maxDistance = block.distance
      }
    })
  })
  return maxDistance
}

const shaveMaxDistanceFromGrid = (grid, visitedGraph) => {
  const maxDistance = findMaxDistance(visitedGraph)

  const newGrid = grid.map((row, rowIndex) => {
    return row.map((blockEntry, colIndex) => {
      if (blockEntry === OBSTACLE) {
        if (visitedGraph[rowIndex][colIndex].distance < maxDistance) {
          return OBSTACLE
        } else {
          return EMPTY
        }
      }
      return blockEntry
    })
  })
  return newGrid
}

const removeRightAnglesFromGrid = (grid, targetKey) => {
  const lineGridWithTarget = createLines(grid)

  let matchingLine = undefined
  let matchingDirection = undefined
  Object.keys(lineGridWithTarget).forEach(direction => {
    const result = lineGridWithTarget[direction].find(line => line.includes(targetKey))
    if (result) {
      matchingLine = result
      matchingDirection = direction
    }
  })

  const otherEndPoint =
    matchingLine.indexOf(targetKey) === 0 ? matchingLine[matchingLine.length - 1] : matchingLine[0]

  const otherDirection = getOtherDirection(matchingDirection)

  const hasRightAngleEndpoint = lineGridWithTarget[otherDirection].filter(line => {
    const isEndOfOtherLineAsWell =
      line.indexOf(otherEndPoint) === 0 || line.indexOf(otherEndPoint) === line.length - 1
    return line.includes(otherEndPoint) && isEndOfOtherLineAsWell
  })

  let hasModified = false

  if (hasRightAngleEndpoint.length) {
    const [targetX, targetY] = getValuesFromKey(targetKey)
    const [endPointX, endPointY] = getValuesFromKey(otherEndPoint)
    if (matchingDirection === 'horizontal') {
      if (targetX > endPointX && isWithinXGrid(endPointX - 1)) {
        grid[targetY][endPointX - 1] = OBSTACLE
        hasModified = true
      } else if (targetX < endPointX && isWithinXGrid(endPointX + 1)) {
        grid[targetY][endPointX + 1] = OBSTACLE
        hasModified = true
      }
    } else if (matchingDirection === 'vertical') {
      if (targetY > endPointY && isWithinYGrid(endPointY - 1)) {
        hasModified = true
        grid[endPointY - 1][targetX] = OBSTACLE
      } else if (targetY < endPointY && isWithinYGrid(endPointY + 1)) {
        grid[endPointY + 1][targetX] = OBSTACLE
        hasModified = true
      }
    }
  }

  if (hasModified) {
    return removeRightAnglesFromGrid(grid, targetKey)
  }

  return grid
}

const pickPossibleGoals = (grid, visitedGraph) => {
  const possibleGoals = []

  const hasNextLeftBlock = (columnIndex, rowIndex) =>
    isWithinXGrid(columnIndex - 1) && grid[rowIndex][columnIndex - 1] === OBSTACLE
  const hasNextRightBlock = (columnIndex, rowIndex) =>
    isWithinXGrid(columnIndex + 1) && grid[rowIndex][columnIndex + 1] === OBSTACLE
  const hasNextTopBlock = (columnIndex, rowIndex) =>
    isWithinYGrid(rowIndex - 1) && grid[rowIndex - 1][columnIndex] === OBSTACLE
  const hasNextBottomBlock = (columnIndex, rowIndex) =>
    isWithinYGrid(rowIndex + 1) && grid[rowIndex + 1][columnIndex] === OBSTACLE

  let newGrid = grid.map((row, rowIndex) => {
    return row.map((item, columnIndex) => {
      if (item === OBSTACLE) {
        let numberOfActiveSides = 0
        let direction = null
        let getNextBlockFunc = () => {}
        let directionIncrementor = 0

        if (hasNextLeftBlock(columnIndex, rowIndex)) {
          numberOfActiveSides += 1
          directionIncrementor = -1
          direction = 'horizontal'
          getNextBlockFunc = hasNextLeftBlock
        }
        if (hasNextRightBlock(columnIndex, rowIndex)) {
          numberOfActiveSides += 1
          direction = 'horizontal'
          directionIncrementor = 1
          getNextBlockFunc = hasNextRightBlock
        }

        if (hasNextTopBlock(columnIndex, rowIndex)) {
          numberOfActiveSides += 1
          direction = 'vertical'
          directionIncrementor = -1
          getNextBlockFunc = hasNextTopBlock
        }

        if (hasNextBottomBlock(columnIndex, rowIndex)) {
          numberOfActiveSides += 1
          direction = 'vertical'
          directionIncrementor = 1
          getNextBlockFunc = hasNextBottomBlock
        }

        if (numberOfActiveSides === 1) {
          let currentColIndex = columnIndex
          let currentRowIndex = rowIndex
          let currentLineLength = 1

          while (getNextBlockFunc(currentColIndex, currentRowIndex)) {
            currentLineLength += 1
            if (direction === 'horizontal') {
              currentColIndex += directionIncrementor
            } else {
              currentRowIndex += directionIncrementor
            }
          }

          possibleGoals.push({
            key: generateKey(columnIndex, rowIndex),
            direction,
            length: currentLineLength,
          })
        }
      }

      return item
    })
  })

  // TODO
  // Determine best one - one with the largest
  // Handle only one, but its shitty
  // Maybe introduce corrections for lShaped entries into normal algorithm
  // Handle when there are no goals
  // Calc distance from goal - ones 'too far away' can be stripped
  // Perform adjustments to corners

  // reject on lack of lines

  let maxLengthGoalValue = 0
  let actualGoal = undefined

  Object.keys(possibleGoals).forEach(key => {
    if (maxLengthGoalValue < possibleGoals[key].length) {
      actualGoal = possibleGoals[key]
      maxLengthGoalValue = possibleGoals[key].length
    }
  })

  if (!actualGoal) {
    const lineGrid = createLines(newGrid)
    let maxLength = 0
    let maxLine = undefined
    let maxLineDirection = undefined

    Object.keys(lineGrid).forEach(direction => {
      lineGrid[direction].forEach(line => {
        if (line.length > maxLength) {
          maxLength = line.length
          maxLine = line
          maxLineDirection = direction
        }
      })
    })

    const hasOnlyOneNeighbor = (x, y) => {
      const totalNeighbors =
        (hasNextLeftBlock(x, y) & 1) +
        (hasNextRightBlock(x, y) & 1) +
        (hasNextTopBlock(x, y) & 1) +
        (hasNextBottomBlock(x, y) & 1)
      return totalNeighbors === 1
    }

    const [leftCol, leftRow] = getValuesFromKey(maxLine[0])
    const [rightCol, rightRow] = getValuesFromKey(maxLine[maxLine.length - 1])

    if (maxLineDirection === 'horizontal') {
      let newLeftEndpoint = [leftCol - 1, leftRow]
      const newRightEndpoint = [rightCol + 1, rightRow]

      if (hasOnlyOneNeighbor(newLeftEndpoint[0], newLeftEndpoint[1])) {
        if (newLeftEndpoint[0] < 0) {
          newGrid = newGrid.map(row => [0, ...row])
          increaseGridXLength()
          newLeftEndpoint[0] = 0
        }

        newGrid[newLeftEndpoint[1]][newLeftEndpoint[0]] = TARGET
        actualGoal = { key: generateKey(newLeftEndpoint[0], newLeftEndpoint[1]) }
      } else if (hasOnlyOneNeighbor(newRightEndpoint[0], newRightEndpoint[1])) {
        if (newRightEndpoint[0] >= newGrid[0].length) {
          newGrid = newGrid.map(row => [...row, 0])
          increaseGridXLength()
        }
        newGrid[newRightEndpoint[1]][newRightEndpoint[0]] = TARGET
        actualGoal = { key: generateKey(newRightEndpoint[0], newRightEndpoint[1]) }
      } else {
        throw new Error('cannae do it')
      }
    } else {
      const newTopEndpoint = [leftCol, leftRow - 1]
      const newBottomEndpoint = [rightCol, rightRow + 1]

      if (hasOnlyOneNeighbor(newTopEndpoint[0], newTopEndpoint[1])) {
        if (newTopEndpoint[0] < 0) {
          newGrid.unshift(new Array(newGrid[0].length).fill(0))
          increaseGridYLength()
        }

        newGrid[newTopEndpoint[1]][newTopEndpoint[0]] = TARGET
        actualGoal = { key: generateKey(newTopEndpoint[0], newTopEndpoint[1]) }
      } else if (hasOnlyOneNeighbor(newBottomEndpoint[0], newBottomEndpoint[1])) {
        if (newBottomEndpoint[0] >= newGrid.length) {
          newGrid.push(new Array(newGrid[0].length).fill(0))
          increaseGridYLength()
        }
        newGrid[newBottomEndpoint[1]][newBottomEndpoint[0]] = TARGET
        actualGoal = { key: generateKey(newBottomEndpoint[0], newBottomEndpoint[1]) }
      } else {
        throw new Error('cannae do it')
      }
    }
  }

  const [x, y] = getValuesFromKey(actualGoal.key)
  newGrid[y][x] = TARGET

  newGrid = removeRightAnglesFromGrid(newGrid, actualGoal.key)

  let distanceVisitedGraph = prepareVisitationGraph(newGrid)
  distanceSearch(actualGoal.key + ',0', distanceVisitedGraph)
  let shavedGrid = newGrid
  let currentScore = calcScore(shavedGrid, distanceVisitedGraph)
  while (currentScore > 9) {
    shavedGrid = shaveMaxDistanceFromGrid(shavedGrid, distanceVisitedGraph)
    distanceVisitedGraph = prepareVisitationGraph(shavedGrid)
    distanceSearch(actualGoal.key + ',0', distanceVisitedGraph)
    currentScore = calcScore(shavedGrid, distanceVisitedGraph)
  }

  let oldDistanceVisitedGraph = prepareVisitationGraph(newGrid)
  distanceSearch(actualGoal.key + ',0', oldDistanceVisitedGraph)

  // distanceVisitedGraph = prepareVisitationGraph(newGrid)
  // console.log('density', evaluateDensity(newGrid))
  // console.log('distanceVisitedGraph', distanceVisitedGraph)
  // console.log('findMaxDistance', findMaxDistance(distanceVisitedGraph))
  // console.log('avg dist', calcScore(newGrid, distanceVisitedGraph))

  // Density should be low, but its not the greatest metric
  // Try having avg distance over total number of blocks?

  // Reject ones with too long of a tail (average of the entries should be consistent)
  return {
    grid: newGrid,
    shavedGrid,
    distanceVisitedGraph,
    floodGraph: visitedGraph,
  }
}

export const generateNewGrid = (initialGrid, randomizer) => {
  const probabilities = {
    addBlockWithoutHistory: 0.5,
    addBlockRandomly: 0.2,
    addBlockWithOneNext: 0.6,
  }

  let hasPlacedFirstBlock = false
  let newGrid = initialGrid.reduce((rowAccum, currentRow, rowPos) => {
    const newRow = currentRow.reduce((colAccum, _, colPos) => {
      let hasAdded = false

      const isPreviousItemOfType = blockType => {
        const itemBeforeOnFirstRowIsOfBlockType =
          rowPos === 0 && colPos !== 0 && colAccum[colPos - 1] === blockType
        const itemBeforeOrAboveIsOfBlockType =
          (rowPos > 0 && rowAccum[rowPos - 1][colPos] === blockType) ||
          colAccum[colPos - 1] === blockType

        return itemBeforeOnFirstRowIsOfBlockType || itemBeforeOrAboveIsOfBlockType
      }

      if (!hasPlacedFirstBlock) {
        if (randomizer() < probabilities.addBlockWithoutHistory) {
          hasPlacedFirstBlock = true
          hasAdded = true
          colAccum.push(OBSTACLE)
        }
      } else if (
        isPreviousItemOfType(OBSTACLE) &&
        randomizer() < probabilities.addBlockWithOneNext
      ) {
        hasAdded = true
        colAccum.push(OBSTACLE)
      } else if (isPreviousItemOfType(EMPTY) && randomizer() < probabilities.addBlockWithOneNext) {
        hasAdded = true
        colAccum.push(EMPTY)
      }

      if (!hasAdded) {
        if (randomizer() < probabilities.addBlockRandomly) {
          colAccum.push(OBSTACLE)
        } else {
          colAccum.push(EMPTY)
        }
      }

      return colAccum
    }, [])

    rowAccum.push(newRow)
    return rowAccum
  }, [])

  const visitedGraph = prepareVisitationGraph(newGrid)
  findGroupsWithFlooding(visitedGraph)

  const totalBlocksBySearchGroup = visitedGraph.reduce((rowAccum, currentRow) => {
    const colResults = currentRow.reduce((colAccum, currentItem) => {
      if (currentItem.block && currentItem.visited) {
        colAccum[currentItem.searchGroup] = useIfExists(colAccum[currentItem.searchGroup]) + 1
      }
      return colAccum
    }, {})

    Object.keys(colResults).forEach(key => {
      rowAccum[key] = useIfExists(rowAccum[key]) + colResults[key]
    })
    return rowAccum
  }, {})

  const largestSearchGroup = findLargestTotal(totalBlocksBySearchGroup)
  let keyToUse
  if (largestSearchGroup.length !== 1) {
    keyToUse = largestSearchGroup[1]
  } else {
    keyToUse = largestSearchGroup[0]
  }

  newGrid = createNewGridFilteredByKey(visitedGraph, keyToUse)
  return pickPossibleGoals(newGrid, visitedGraph)
}
