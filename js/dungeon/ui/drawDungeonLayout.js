// const hasLeftNeighbor = (dungeon, rowIndex, colIndex, gridDimensions) => {
//   debugger
//   try {
//     if (dungeon[rowIndex][colIndex - 1]) {
//       console.log('we are here')
//     }
//   } catch(e) {
//     return false
//   }
// }

const hasLowerParent = (dungeon, rowIndex, colIndex) => {
  try {
    const lowerRoom = dungeon[rowIndex + 1][colIndex].nodesInRoom
    const currentNodeParent = dungeon[rowIndex][colIndex].nodesInRoom[0].parent
    return lowerRoom.includes(currentNodeParent)
  } catch (e) {
    return false
  }
}

const hasUpperParent = (dungeon, rowIndex, colIndex) => {
  try {
    const upperRoom = dungeon[rowIndex - 1][colIndex].nodesInRoom
    const currentNodeParent = dungeon[rowIndex][colIndex].nodesInRoom[0].parent
    return upperRoom.includes(currentNodeParent)
  } catch (e) {
    return false
  }
}

const hasLowerChild = (dungeon, rowIndex, colIndex) => {
  try {
    const lowerRoom = dungeon[rowIndex + 1][colIndex].nodesInRoom
    const currentNode = dungeon[rowIndex][colIndex]
    const hasNodeChildren = currentNode.nodesInRoom.some(node => {
      return lowerRoom[0].parent === node
    })
    return hasNodeChildren
  } catch (e) {
    return false
  }
}

const hasUpperChild = (dungeon, rowIndex, colIndex) => {
  try {
    const upperRoom = dungeon[rowIndex - 1][colIndex].nodesInRoom
    const currentNode = dungeon[rowIndex][colIndex]
    const hasNodeChildren = currentNode.nodesInRoom.some(node => {
      return upperRoom[0].parent === node
    })
    return hasNodeChildren
  } catch (e) {
    return false
  }
}

const hasLeftChild = (dungeon, rowIndex, colIndex) => {
  try {
    const leftRoom = dungeon[rowIndex][colIndex - 1].nodesInRoom
    const currentNode = dungeon[rowIndex][colIndex]
    const hasNodeChildren = currentNode.nodesInRoom.some(node => {
      return leftRoom[0].parent === node
    })
    return hasNodeChildren
  } catch (e) {
    return false
  }
}

const hasRightParent = (dungeon, rowIndex, colIndex) => {
  try {
    const rightRoom = dungeon[rowIndex][colIndex + 1].nodesInRoom
    const currentNodeParent = dungeon[rowIndex][colIndex].nodesInRoom[0].parent
    return rightRoom.includes(currentNodeParent)
  } catch (e) {
    return false
  }
}

const hasRightChild = (dungeon, rowIndex, colIndex) => {
  try {
    const rightRoom = dungeon[rowIndex][colIndex + 1].nodesInRoom
    const currentNode = dungeon[rowIndex][colIndex]
    const hasNodeChildren = currentNode.nodesInRoom.some(node => {
      return rightRoom[0].parent === node
    })
    return hasNodeChildren
  } catch (e) {
    return false
  }
}

const hasLeftParent = (dungeon, rowIndex, colIndex) => {
  try {
    const leftRoom = dungeon[rowIndex][colIndex - 1].nodesInRoom
    const currentNodeParent = dungeon[rowIndex][colIndex].nodesInRoom[0].parent
    return leftRoom.includes(currentNodeParent)
  } catch (e) {
    return false
  }
}

export const drawDungeonLayout = (dungeonLayout, table, renderLast = false) => {
  const tableBody = document.createElement('tbody')

  dungeonLayout.forEach((rowData, rowIndex) => {
    const row = document.createElement('tr')

    rowData.forEach((cellData, colIndex) => {
      if (cellData !== 0) {
        // debugger
      }
      const emptyCharacter = '‎' // This is not an empty string, but a zero width character
      const infoToShow = cellData !== 0 ? cellData.nodesInRoom[0].name : emptyCharacter
      const cell = document.createElement('td')
      cell.appendChild(document.createTextNode(infoToShow))
      cell.className = cellData !== 0 ? 'filled' : ''

      if (hasLowerParent(dungeonLayout, rowIndex, colIndex)) {
        cell.classList.add('lower-parent')
      }

      if (hasUpperChild(dungeonLayout, rowIndex, colIndex)) {
        cell.classList.add('upper-child')
      }

      if (hasLeftChild(dungeonLayout, rowIndex, colIndex)) {
        cell.classList.add('left-child')
      }

      if (hasRightParent(dungeonLayout, rowIndex, colIndex)) {
        cell.classList.add('right-parent')
      }

      if (hasRightChild(dungeonLayout, rowIndex, colIndex)) {
        cell.classList.add('right-child')
      }

      if (hasLeftParent(dungeonLayout, rowIndex, colIndex)) {
        cell.classList.add('left-parent')
      }

      if (hasLowerChild(dungeonLayout, rowIndex, colIndex)) {
        cell.classList.add('lower-child')
      }

      if (hasUpperParent(dungeonLayout, rowIndex, colIndex)) {
        cell.classList.add('upper-parent')
      }

      row.appendChild(cell)
    })

    tableBody.appendChild(row)
  })

  if (table.childNodes.length) {
    tableBody.classList.add(`table-${table.childNodes.length}`)
  } else {
    tableBody.classList.add('table-0')
  }

  table.appendChild(tableBody)

  if (renderLast) {
    Array.from(table.childNodes).forEach(child => {
      child.style.display = 'none'
    })

    const lastIndex = table.children.length - 1
    table.childNodes[lastIndex].style.display = 'block'
  }
}

export const setupFirstView = () => {
  const table = document.getElementById('dungeonVisual')
  Array.from(table.children).forEach(child => {
    child.style.display = 'none'
  })
  document.getElementsByClassName('table-0')[0].style.display = 'block'
  const maxLength = table.children.length - 1
  document.getElementById('drawDungeonSlider').setAttribute('max', maxLength)
}

export const rewindDraw = () => {
  const slider = document.getElementById('drawDungeonSlider')
  Array.from(document.getElementById('dungeonVisual').children).forEach(child => {
    child.style.display = 'none'
  })
  slider.value = slider.value - 1
  if (slider.value < 0) slider.value = 0

  document.getElementsByClassName(`table-${slider.value}`)[0].style.display = 'block'
}

export const advanceDraw = () => {
  const slider = document.getElementById('drawDungeonSlider')
  const table = document.getElementById('dungeonVisual')
  const maxLength = table.children.length - 1
  slider.value = parseInt(slider.value) + 1
  if (slider.value > maxLength) slider.value = maxLength

  Array.from(document.getElementById('dungeonVisual').children).forEach(child => {
    child.style.display = 'none'
  })

  document.getElementsByClassName(`table-${slider.value}`)[0].style.display = 'block'
}
