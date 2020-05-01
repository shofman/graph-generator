export const generateKey = (x, y) => `${x},${y}`
export const getValuesFromKey = key => key.split(',').map(value => parseInt(value))
