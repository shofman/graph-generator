import { brokenWithoutCause } from '../seeds.js'
import { runTest } from './puzzleSolver.js'

jest.mock('../draw.js', () => ({
  debugDraw: jest.fn(),
}))
global.console = { log: jest.fn() }

describe('Handles slow solution', () => {
  it('matches snapshot for brokenWithoutCause', () => {
    const solvedResults = runTest(brokenWithoutCause)

    expect(solvedResults.grid).toMatchSnapshot()
    expect(solvedResults.results).toMatchSnapshot()
  })
})
