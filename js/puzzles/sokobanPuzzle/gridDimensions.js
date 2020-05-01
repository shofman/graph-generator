const gridSpace = 1
const gridNumber = 6

export const pixelSize = 20
export const pixelOffset = pixelSize / 2

let gridYLength = gridNumber * gridSpace + gridNumber * gridSpace
let gridXLength = gridNumber * gridSpace + gridNumber * gridSpace

const width = 3
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

export const isWithinXGrid_deprecated = (coordinate, shouldScale = true) =>
  coordinate >= 0 && coordinate < width * (shouldScale ? blockPartion : 1)
export const isWithinYGrid_deprecated = (coordinate, shouldScale = true) =>
  coordinate >= 0 && coordinate < height * (shouldScale ? blockPartion : 1)

export const TEMP_X_SIZE = 3
export const TEMP_Y_SIZE = 3
const BLOCK_SIZE = 3

export const isWithinXGrid = xPos => xPos >= 0 && xPos < TEMP_X_SIZE * BLOCK_SIZE
export const isWithinYGrid = yPos => yPos >= 0 && yPos < TEMP_Y_SIZE * BLOCK_SIZE
