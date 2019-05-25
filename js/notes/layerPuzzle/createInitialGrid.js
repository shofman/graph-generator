import {
  getGridXLength,
  getGridYLength,
} from './gridDimensions.js'

export const createInitialGrid = () => {
  // Simple grid
  // Density = 0.07471264367816093
  let initialGrid = [
    // [0, 0, 3, 3, 0, 0],
    // [0, 3, 3, 3, 0, 0],
    // [3, 0, 0, 3, 0, 0],
    // [3, 3, 3, 3, 3, 0],
    // [5, 0, 0, 0, 0, 0],
  ]

  // Crisscrossing entries
  // Density = 0.09895833333333333

  initialGrid = [
    // [0, 3, 0, 0, 0, 0],
    // [0, 3, 3, 0, 0, 0],
    // [3, 3, 3, 0, 0, 0],
    // [0, 3, 3, 3, 5, 0],
    // [0, 0, 3, 3, 0, 0],
    // [0, 0, 3, 3, 3, 0],
    // [0, 0, 0, 3, 3, 3],
    // [0, 0, 0, 3, 0, 0],
  ]

  // Starting points from within grid
  // Density = 0.1346153846153846

  // initialGrid = [
  //   [0, 0, 0, 0, 0, 3, 0, 0],
  //   [0, 0, 5, 3, 3, 3, 0, 0],
  //   [0, 0, 0, 3, 3, 3, 3, 3],
  //   [0, 0, 0, 3, 3, 3, 3, 3],
  //   [0, 0, 0, 3, 3, 0, 0, 0],
  //   [0, 3, 3, 3, 3, 0, 0, 0],
  //   [3, 3, 3, 3, 3, 0, 0, 0],
  //   [0, 0, 0, 3, 3, 0, 0, 0],
  // ]

  for (let i = 0; i < getGridYLength(); i++) {
    initialGrid.push(
      Array.apply(null, Array(getGridXLength())).map(() => {
        return 0
      })
    )
  }

  return initialGrid  
}
