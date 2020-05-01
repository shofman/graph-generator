const gridSpace = 1
const gridNumber = 6

export const pixelSize = 20
export const pixelOffset = pixelSize / 2

let gridYLength = gridNumber * gridSpace + gridNumber * gridSpace
let gridXLength = gridNumber * gridSpace + gridNumber * gridSpace

export const getGridYLength = () => {
  return gridYLength
}
export const getGridXLength = () => {
  return gridXLength
}

export const increaseGridYLength = () => {
  gridYLength++
}
export const increaseGridXLength = () => {
  gridXLength++
}

export const getCanvasWidth = () => gridXLength * pixelSize + gridNumber * gridSpace * pixelSize
export const getCanvasHeight = () => gridYLength * pixelSize + gridNumber * gridSpace * pixelSize

export const isWithinXGrid = coordinate => coordinate >= 0 && coordinate < gridXLength
export const isWithinYGrid = coordinate => coordinate >= 0 && coordinate < gridYLength
