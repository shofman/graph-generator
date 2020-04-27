import { findPermutations, combinePermutationsIntoGridState } from './findPermutations.js'

describe('findPermutations', () => {
  it('creates permutations from two lists', () => {
    const LIST_ONE = [1, 2, 3]
    const LIST_TWO = [4, 5]
    expect(findPermutations(LIST_ONE, LIST_TWO)).toEqual([
      [1, 4],
      [1, 5],
      [2, 4],
      [2, 5],
      [3, 4],
      [3, 5],
    ])
  })

  it('handles objects from two lists', () => {
    const LIST_ONE = [{ one: '1' }, { two: '2' }, { three: '3' }]
    const LIST_TWO = [{ four: '4' }, { five: '5' }]
    expect(findPermutations(LIST_ONE, LIST_TWO)).toEqual([
      [{ one: '1' }, { four: '4' }],
      [{ one: '1' }, { five: '5' }],
      [{ two: '2' }, { four: '4' }],
      [{ two: '2' }, { five: '5' }],
      [{ three: '3' }, { four: '4' }],
      [{ three: '3' }, { five: '5' }],
    ])
  })
})

describe('combinePermutationsIntoGridState', () => {
  it('combines an array of possible grids into a single grid', () => {
    const firstGrid = {
      grid: [[0, 0, 0, 0, 0], [2, 2, 1, 2, 2], [1, 1, 1, 4, 1]],
      blockCol: 3,
      blockRow: 2,
      directionX: 0,
      directionY: 1,
      previousPlayerCol: 3,
      previousPlayerRow: 6,
    }

    const secondGrid = {
      grid: [[0, 0, 0, 0, 0], [2, 2, 4, 2, 2], [1, 1, 1, 1, 1]],
      blockCol: 2,
      blockRow: 1,
      directionX: -1,
      directionY: 0,
      previousPlayerCol: 2,
      previousPlayerRow: 4,
    }

    const permutation = [firstGrid, secondGrid]

    const result = combinePermutationsIntoGridState(permutation)

    expect(result).toEqual({
      grid: [[0, 0, 0, 0, 0], [2, 2, 4, 2, 2], [1, 1, 1, 4, 1]],
      blocks: [{ colIndex: 3, rowIndex: 2 }, { colIndex: 2, rowIndex: 1 }],
      directions: [{ directionX: 0, directionY: 1 }, { directionX: -1, directionY: 0 }],
      previousPlayerPos: [{ colIndex: 3, rowIndex: 6 }, { colIndex: 2, rowIndex: 4 }],
      firstBlock: {
        grid: [[0, 0, 0, 0, 0], [2, 2, 1, 2, 2], [1, 1, 1, 4, 1]],
        blockCol: 3,
        blockRow: 2,
        directionX: 0,
        directionY: 1,
        previousPlayerCol: 3,
        previousPlayerRow: 6,
      },
      secondBlock: {
        grid: [[0, 0, 0, 0, 0], [2, 2, 4, 2, 2], [1, 1, 1, 1, 1]],
        blockCol: 2,
        blockRow: 1,
        directionX: -1,
        directionY: 0,
        previousPlayerCol: 2,
        previousPlayerRow: 4,
      }
    })
  })
})
