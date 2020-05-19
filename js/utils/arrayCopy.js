export const arrayCopy = array => JSON.parse(JSON.stringify(array))

export const circularArrayCopy = array => array.map(item => item.slice())
