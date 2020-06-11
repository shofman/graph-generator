const hasParent = (dungeon, childRowIndex, childColIndex, rowIndex, colIndex) => {
  try {
    const childRoom = dungeon[childRowIndex][childColIndex]
    const roomsInChild = childRoom.nodesInRoom
    const currentNode = dungeon[rowIndex][colIndex]

    if (currentNode.roomName === 'hallway') {
      let trueParent = currentNode.parentNode
      if (currentNode.parentNode && currentNode.parentNode.roomName === 'hallway') {
        while (trueParent.roomName === 'hallway') {
          trueParent = trueParent.parentNode
        }
      }
      return (
        roomsInChild.includes(trueParent) ||
        roomsInChild.map(item => item.parent).includes(trueParent) ||
        childRoom.parentNode === currentNode ||
        trueParent === childRoom ||
        trueParent.nodesInRoom.includes(childRoom.parentNode)
      )
    } else if (childRoom.roomName === 'hallway') {
      let trueChild = childRoom
      while (trueChild.roomName === 'hallway') {
        trueChild = trueChild.parentNode
      }
      return trueChild === currentNode || trueChild.nodesInRoom.includes(currentNode.parentNode)
    }

    const allParents = currentNode.nodesInRoom.map(room => room.parent)
    return allParents.filter(parent => roomsInChild.includes(parent)).length > 0
  } catch (e) {
    return false
  }
}

const hasChild = (dungeon, parentRowIndex, parentColIndex, rowIndex, colIndex) => {
  try {
    const parentRoom = dungeon[parentRowIndex][parentColIndex]
    const nodesInParentRoom = parentRoom.nodesInRoom
    const currentNode = dungeon[rowIndex][colIndex]

    if (parentRoom.roomName === currentNode.roomName && parentRoom.roomName === 'hallway') {
      return true
    }

    if (
      parentRoom.roomName === 'hallway' &&
      parentRoom.parentNode.nodesInRoom.includes(currentNode.parentNode)
    ) {
      return true
    }

    if (
      currentNode.roomName === 'hallway' &&
      currentNode.parentNode.nodesInRoom.includes(parentRoom.parentNode)
    ) {
      return true
    }

    if (nodesInParentRoom.map(room => room.name).includes('hallway')) {
      return (
        parentRoom.children.includes(currentNode) ||
        currentNode.roomName === parentRoom.parentNode.name
      )
    }

    const allParents = nodesInParentRoom.map(room => room.parent)
    const hasNodeChildren = currentNode.nodesInRoom.some(node => {
      return allParents.includes(node)
    })
    return hasNodeChildren
  } catch (e) {
    return false
  }
}

const hasLowerParent = (dungeon, rowIndex, colIndex) => {
  return hasParent(dungeon, rowIndex + 1, colIndex, rowIndex, colIndex)
}

const hasUpperParent = (dungeon, rowIndex, colIndex) => {
  return hasParent(dungeon, rowIndex - 1, colIndex, rowIndex, colIndex)
}

const hasLowerChild = (dungeon, rowIndex, colIndex) => {
  return hasChild(dungeon, rowIndex + 1, colIndex, rowIndex, colIndex)
}

const hasUpperChild = (dungeon, rowIndex, colIndex) => {
  return hasChild(dungeon, rowIndex - 1, colIndex, rowIndex, colIndex)
}

const hasLeftChild = (dungeon, rowIndex, colIndex) => {
  return hasChild(dungeon, rowIndex, colIndex - 1, rowIndex, colIndex)
}

const hasRightParent = (dungeon, rowIndex, colIndex) => {
  return hasParent(dungeon, rowIndex, colIndex + 1, rowIndex, colIndex)
}

const hasRightChild = (dungeon, rowIndex, colIndex) => {
  return hasChild(dungeon, rowIndex, colIndex + 1, rowIndex, colIndex)
}

const hasLeftParent = (dungeon, rowIndex, colIndex) => {
  return hasParent(dungeon, rowIndex, colIndex - 1, rowIndex, colIndex)
}

let drawLayoutTimes = 0
let debugDrawLayoutTimes = false

export const drawDungeonLayout = (dungeonLayout, table, renderLast = false) => {
  drawLayoutTimes++
  if (debugDrawLayoutTimes) console.log('drawLayoutTimes', drawLayoutTimes)
  const tableBody = document.createElement('tbody')

  const colIndicesWithValues = dungeonLayout.reduce((accum, curr) => {
    const columnsWithValuesForRows = curr
      .map((item, index) => (item !== 0 ? index : false))
      .filter(Boolean)

    columnsWithValuesForRows.forEach(indexValue => {
      if (!accum.includes(indexValue)) {
        accum.push(indexValue)
      }
    })
    return accum
  }, [])

  const maxRowWithValue = dungeonLayout.length - 1 // start should be in the last row
  const minRowWithValue = dungeonLayout.findIndex(row => {
    return !row.every(item => item === 0)
  })

  dungeonLayout.forEach((rowData, rowIndex) => {
    const row = document.createElement('tr')
    const numberCell = document.createElement('td')
    numberCell.appendChild(document.createTextNode(rowIndex))
    row.append(numberCell)

    let shouldAppend = false

    rowData.forEach((cellData, colIndex) => {
      const hasRowFilled = maxRowWithValue >= rowIndex && rowIndex >= minRowWithValue
      const hasData = cellData !== 0
      if (hasData || hasRowFilled) {
        shouldAppend = true
      }
      const emptyCharacter = '‎' // This is not an empty string, but a zero width character
      const infoToShow = hasData ? `${colIndex}` : emptyCharacter
      const cell = document.createElement('td')

      const wrapper = document.createElement('div')

      wrapper.appendChild(document.createTextNode(infoToShow))
      if (hasData) {
        const listElement = document.createElement('ul')
        cellData.nodesInRoom.forEach(node => {
          const li = document.createElement('li')
          li.appendChild(document.createTextNode(node.name))
          listElement.appendChild(li)
        })
        wrapper.appendChild(listElement)
      }

      cell.appendChild(wrapper)
      const shouldShowEmpty = colIndicesWithValues.includes(colIndex)
      cell.className = hasData ? 'filled' : shouldShowEmpty ? 'visible' : 'empty'

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

    if (shouldAppend) {
      tableBody.appendChild(row)
    }
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
  console.log('slider.value', slider.value)
  document.getElementsByClassName(`table-${slider.value}`)[0].style.display = 'block'
}

export const advanceDraw = () => {
  const slider = document.getElementById('drawDungeonSlider')
  const table = document.getElementById('dungeonVisual')
  const maxLength = table.children.length - 1
  slider.value = parseInt(slider.value) + 1
  if (slider.value > maxLength) slider.value = maxLength
  console.log('slider.value', slider.value)

  Array.from(document.getElementById('dungeonVisual').children).forEach(child => {
    child.style.display = 'none'
  })

  document.getElementsByClassName(`table-${slider.value}`)[0].style.display = 'block'
}

export const stepThroughDungeon = () => {
  const slider = document.getElementById('drawDungeonSlider')
  slider.value = parseInt(slider.value)
  console.log('slider.value', slider.value)

  Array.from(document.getElementById('dungeonVisual').children).forEach(child => {
    child.style.display = 'none'
  })

  document.getElementsByClassName(`table-${slider.value}`)[0].style.display = 'block'
}
