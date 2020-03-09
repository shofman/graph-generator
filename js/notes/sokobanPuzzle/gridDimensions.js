const gridSpace = 1
const gridNumber = 6

export const pixelSize = 20
export const pixelOffset = pixelSize / 2

let gridYLength = gridNumber * gridSpace + gridNumber * gridSpace
let gridXLength = gridNumber * gridSpace + gridNumber * gridSpace

const width = 2
const height = 3
const blockPartion = 3
const spaceAround = 1

export const getGridYLength = (shouldScale = true) =>
  height * (shouldScale ? blockPartion + 2 * spaceAround : 1)
export const getGridXLength = (shouldScale = true) =>
  width * (shouldScale ? blockPartion + 2 * spaceAround : 1)

export const increaseGridYLength = () => {
  gridYLength++
}
export const increaseGridXLength = () => {
  gridXLength++
}

export const getCanvasWidth = () => gridXLength * pixelSize + gridNumber * gridSpace * pixelSize
export const getCanvasHeight = () => gridYLength * pixelSize + gridNumber * gridSpace * pixelSize

export const isWithinXGrid = (coordinate, shouldScale = true) =>
  coordinate >= 0 && coordinate < width * (shouldScale ? blockPartion : 1)
export const isWithinYGrid = (coordinate, shouldScale = true) =>
  coordinate >= 0 && coordinate < height * (shouldScale ? blockPartion : 1)
