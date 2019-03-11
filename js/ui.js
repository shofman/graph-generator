import { createDungeons } from './generateDungeon.js'

const createContainerNode = (totalNumberToCreate) => {
  const containerNode = document.createElement('div')
  if (!containerNode) {
    return undefined
  }
  const style = containerNode.style
  style.display = 'inline-flex'
  style.border = '1px solid lightgray'

  const pageWidth = (window.innerWidth || document.body.clientWidth) - 50
  containerNode.style.width = pageWidth / totalNumberToCreate
  containerNode.style.height = 800
  if (totalNumberToCreate === 1) {
    containerNode.style.width = 800
  }

  return containerNode
}

const createTitleNode = (seedName) => {
  const titleNode = document.createElement('span')
  titleNode.innerHTML = seedName
  return titleNode
}

const createVisualization = (dungeonInfo) => {
  const nodes = new vis.DataSet(dungeonInfo.nodes)

  // create an array with edges
  const useKeys = document.getElementById('keys').checked

  let connections = dungeonInfo.connections
  if (useKeys) {
    connections = connections.concat(dungeonInfo.keyLockConnections)
  }

  const edges = new vis.DataSet(connections)

  // provide the data in the vis format
  const data = {
    nodes: nodes,
    edges: edges,
  }

  return data
}

let cachedDungeons = []
let largestSteps = 0

export const drawDungeonTree = (useCachedDungeon = false) => {
  if (useCachedDungeon) {
    return cachedDungeons
  }

  const generationElement = document.getElementById('generation')
  const currentStep = generationElement.valueAsNumber

  const parentWrapper = document.getElementById('mynetwork')
  parentWrapper.innerHTML = ''

  
  const newDungeons = createDungeons(currentStep)

  const drawOptions = {
    interaction: {
      dragNodes: false,
    },
    layout: {
      hierarchical: {
        enabled: true,
        sortMethod: 'directed'
      }
    },
  }

  newDungeons.forEach(dungeonData => {
    if (dungeonData.numberOfSteps > largestSteps) {
      largestSteps = dungeonData.numberOfSteps
    }
    const containerNode = createContainerNode(newDungeons.length)
    const titleNode = createTitleNode(dungeonData.seedName)

    const wrapperNode = document.createElement('div')

    wrapperNode.style.display = 'inline-flex'
    wrapperNode.style['flex-direction'] = 'column'
    wrapperNode.appendChild(titleNode)
    wrapperNode.appendChild(containerNode)

    const visualizationData = createVisualization(dungeonData)
    new vis.Network(containerNode, visualizationData, drawOptions)

    parentWrapper.appendChild(wrapperNode)
  })

  generationElement.max = largestSteps

  cachedDungeons = newDungeons
  return newDungeons
}

export const rewind = () => {
  const generation = document.getElementById('generation')
  generation.valueAsNumber = generation.valueAsNumber - 1
  drawDungeonTree()
}

export const advance = () => {
  const generation = document.getElementById('generation')
  generation.valueAsNumber = generation.valueAsNumber + 1
  drawDungeonTree()
}
