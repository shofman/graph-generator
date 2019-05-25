const canvas = document.getElementById('myCanvas')

const buttonPositions = []

function isIntersect(point, circle) {
  return (
    Math.sqrt(Math.pow(point.x - circle.x, 2) + Math.pow(point.y - circle.y, 2)) < circle.radius
  )
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

  buttonPositions.forEach(circle => {
    if (isIntersect(mousePoint, circle)) {
      circle.onClick()
    }
  })
})
