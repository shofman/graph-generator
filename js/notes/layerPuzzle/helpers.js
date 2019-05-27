export const arrayCopy = array => JSON.parse(JSON.stringify(array))

export const isObjectEmpty = obj => Object.entries(obj).length === 0 && obj.constructor === Object

export const convertLineDeltaToDirection = lineDelta => {
  if (lineDelta.x !== 0) return 'horizontal'
  if (lineDelta.y !== 0) return 'vertical'
}

export const getOtherDirection = currentDirection =>
  currentDirection === 'horizontal' ? 'vertical' : 'horizontal'

export const getAllSubsets = arrayOfChildren =>
  arrayOfChildren.reduce((subsets, value) => subsets.concat(subsets.map(set => [value, ...set])), [
    [],
  ])
