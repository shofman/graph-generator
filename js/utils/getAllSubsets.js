export const getAllSubsets = arrayOfChildren =>
  arrayOfChildren.reduce((subsets, value) => subsets.concat(subsets.map(set => [value, ...set])), [
    [],
  ])
