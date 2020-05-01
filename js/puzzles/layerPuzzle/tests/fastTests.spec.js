import {
  worksWell,
  solutionRightBeside,
  randomFive,
  maybeBroke,
  somethingExplodesViolently,
  twoBroken,
  wayTooSimple,
  endsEarly,
} from '../seeds.js'
import { runTest } from './puzzleSolver.js'

jest.mock('../draw.js', () => ({
  debugDraw: jest.fn(),
}))
global.console = { log: jest.fn() }

describe('Handles quick solutions', () => {
  let seed

  it('handles the solutionRightBeside', () => {
    seed = solutionRightBeside
  })

  it('handles the randomFive', () => {
    seed = randomFive
  })

  it('handles the maybeBroke', () => {
    seed = maybeBroke
  })

  it('handles the maybeBroke', () => {
    seed = somethingExplodesViolently
  })

  it('handles the maybeBroke', () => {
    seed = twoBroken
  })

  it('handles the wayTooSimple scenario', () => {
    seed = wayTooSimple
  })

  it('handles the worksWell scenario', () => {
    seed = worksWell
  })

  it('handles the endsEarly scenario (by not ending early', () => {
    seed = endsEarly
  })

  afterEach(() => {
    const solvedResults = runTest(seed)

    expect(solvedResults.grid).toMatchSnapshot()
    expect(solvedResults.results).toMatchSnapshot()
  })
})
      