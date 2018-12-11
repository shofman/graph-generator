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
  if (totalNumberToCreate === 1) {
    containerNode.style.width = 800
  }
  return containerNode
}

const createVisualization = (dungeonInfo) => {
  const nodes = new vis.DataSet(dungeonInfo.rooms)

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

const drawDungeon = () => {
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
  let largestSteps = 0

  newDungeons.forEach(dungeonData => {
    if (dungeonData.numberOfSteps > largestSteps) {
      largestSteps = dungeonData.numberOfSteps
    }
    const containerNode = createContainerNode(newDungeons.length)
    parentWrapper.appendChild(containerNode)
    const visualizationData = createVisualization(dungeonData)
    new vis.Network(containerNode, visualizationData, drawOptions)
  })

  generationElement.max = largestSteps

  return newDungeons
}

rewind = () => {
  const generation = document.getElementById('generation')
  generation.valueAsNumber = generation.valueAsNumber - 1
  drawDungeon()
}

advance = () => {
  const generation = document.getElementById('generation')
  generation.valueAsNumber = generation.valueAsNumber + 1
  drawDungeon()
}
