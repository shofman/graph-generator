import { pixelSize, pixelOffset } from './gridDimensions.js'
import { generateKey, getValuesFromKey } from './generateKey.js'
import { slideBlock } from './gridMovement.js'
import { draw } from './draw.js'
import { arrayCopy } from './helpers.js'

const canvas = document.getElementById('myCanvas')
const ctx = canvas.getContext('2d')

export const blockPositions = []

const blue = '#0095DD'
const selectedBlue = '#0060FF'

const isIntersect = (click, block) => {
  return click.x === block.x && click.y === block.y
}

const isOneAway = (value1, value2) => {
  return Math.abs(value1 - value2) === 1
}

const isXClick = (click, block) => isOneAway(click.x, block.x) && click.y === block.y
const isYClick = (click, block) => isOneAway(click.y, block.y) && click.x === block.x

const isMoveClick = (click, block) => {
  return block.hasClicked && (isXClick(click, block) || isYClick(click, block))
}

const createDirectionFromMoveClick = (click, block) => {
  if (isXClick(click, block)) {
    return { x: click.x > block.x ? 1 : -1, y: 0 }
  } else if (isYClick(click, block)) {
    return { x: 0, y: click.y > block.y ? 1 : -1 }
  } else {
    return { x: 0, y: 0 }
  }
}

canvas.addEventListener('click', e => {
  function relMouseCoords(event) {
    let totalOffsetX = 0
    let totalOffsetY = 0
    let canvasX = 0
    let canvasY = 0
    let currentElement = canvas

    do {
      totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft
      totalOffsetY += currentElement.offsetTop - currentElement.scrollTop
      currentElement = currentElement.offsetParent
    } while (currentElement)

    canvasX = event.pageX - totalOffsetX
    canvasY = event.pageY - totalOffsetY

    return { x: canvasX, y: canvasY }
  }

  const mousePoint = relMouseCoords(e)
  const gridPoint = {
    x: Math.floor((mousePoint.x - pixelOffset) / pixelSize),
    y: Math.floor((mousePoint.y - pixelOffset) / pixelSize),
  }

  let isMoveClickActive = false

  blockPositions.forEach(block => {
    if (isMoveClick(gridPoint, block)) {
      isMoveClickActive = true
      const direction = createDirectionFromMoveClick(gridPoint, block)
      const blockKey = generateKey(block.x, block.y)
      const slideResults = slideBlock(
        arrayCopy(resultsList[gridIndex]),
        arrayCopy(gridList[gridIndex]),
        blockKey,
        direction
      )

      const newGrid = slideResults.currentGrid
      const newResults = slideResults.results

      if (gridIndex !== gridList.length - 1) {
        console.log('gridIndex, gridList.length - 1', gridIndex, gridList.length - 1)
        console.log('gridLis t before', gridList)
        gridList = gridList.slice(0, gridIndex + 1)
        console.log('gridList', gridList)
        resultsList = resultsList.slice(0, gridIndex + 1)
      }

      gridList.push(newGrid)
      resultsList.push(newResults)
      gridIndex++

      block.onClick()
      draw(gridList[gridIndex], resultsList[gridIndex])()
    }
  })

  if (!isMoveClickActive) {
    blockPositions.forEach(block => {
      if (isIntersect(gridPoint, block) && !isMoveClickActive) {
        block.onClick()
      }
    })
  }
})

const Block = function(ctx, x, y, color, value) {
  const onClick = function() {
    if (!this.hasClicked) {
      blockPositions.forEach(block => {
        block.hasClicked = false
        block.color = blue
      })
      this.hasClicked = true
      this.color = selectedBlue
    } else {
      this.hasClicked = false
      this.color = blue
    }
  }
  return {
    x,
    y,
    color,
    value,
    onClick,
    hasClicked: false,
  }
}

let gridList = []
let resultsList = []
let gridIndex = 0

export const play = (currentGrid, results) => {
  Object.keys(results).forEach(gridItemKey => {
    const [x, y] = getValuesFromKey(gridItemKey)
    const blockValue = results[gridItemKey].value
    const block = new Block(ctx, x, y, blue, blockValue)

    blockPositions.push(block)
  })

  gridList.push(currentGrid)
  resultsList.push(results)

  draw(gridList[gridIndex], resultsList[gridIndex])()
}

export const advance = () => {
  if (gridIndex + 1 < gridList.length) {
    gridIndex++
  }
  draw(gridList[gridIndex], resultsList[gridIndex])()
}

export const rewind = () => {
  if (gridIndex - 1 >= 0) {
    gridIndex--
  }
  draw(gridList[gridIndex], resultsList[gridIndex])()
}
