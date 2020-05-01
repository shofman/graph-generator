import { isWithinXGrid, isWithinYGrid } from './gridDimensions.js'
import { SPACE } from './blockTypes.js'

export const prepareVisitationGraph = grid =>
  grid.map(row =>
    row.map(block =>
      block === SPACE ? { visited: false, block: true, distance: 0 } : { block: false }
    )
  )

const depthFirstSearch = (x, y, visitedGraph, searchGroup) => {
  if (!isWithinXGrid(x)) return 0
  if (!isWithinYGrid(y)) return 0
  if (!visitedGraph[y] || !visitedGraph[y][x]) return 0
  if (!visitedGraph[y][x].block) return 0
  if (visitedGraph[y][x].visited) return 0

  visitedGraph[y][x].visited = true
  visitedGraph[y][x].searchGroup = searchGroup

  depthFirstSearch(x - 1, y, visitedGraph, searchGroup)
  depthFirstSearch(x, y - 1, visitedGraph, searchGroup)
  depthFirstSearch(x + 1, y, visitedGraph, searchGroup)
  depthFirstSearch(x, y + 1, visitedGraph, searchGroup)
}

export const findGroupsWithFlooding = visitedGraph => {
  let searchGroup = 0
  visitedGraph.forEach((row, rowPos) => {
    row.forEach((item, colPos) => {
      if (item.block && !item.visited) {
        depthFirstSearch(colPos, rowPos, visitedGraph, searchGroup)
        searchGroup++
      }
    })
  })
  return visitedGraph
}
