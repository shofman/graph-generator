export const getDistanceBetweenLeafs = (leaf1, leaf2) => {
  const leaf1Path = []
  const leaf2Path = []

  let leafPointer1 = leaf1
  let leafPointer2 = leaf2
  const createDistance = distanceValue => ({
    distance: distanceValue,
    path1: leaf1Path,
    path2: leaf2Path,
    criticalPath: [...new Set(leaf1Path.concat(leaf2Path.reverse()))],
  })

  if (leaf1 === leaf2) {
    return createDistance(0)
  }

  while (leafPointer1.parent !== null && leafPointer2.parent !== null) {
    leaf1Path.push(leafPointer1)
    leaf2Path.push(leafPointer2)

    if (leaf1Path.includes(leaf2)) {
      return createDistance(leaf1Path.indexOf(leaf2))
    } else if (leaf2Path.includes(leaf1)) {
      return createDistance(leaf2Path.indexOf(leaf1))
    } else if (leaf1Path.includes(leafPointer2)) {
      return createDistance(leaf2Path.indexOf(leafPointer2) + leaf1Path.indexOf(leafPointer2))
    } else if (leaf2Path.includes(leafPointer1)) {
      return createDistance(leaf2Path.indexOf(leafPointer1) + leaf1Path.indexOf(leafPointer1))
    }

    leafPointer1 = leafPointer1.parent
    leafPointer2 = leafPointer2.parent
  }

  while (leafPointer1.parent !== null) {
    leaf1Path.push(leafPointer1)
    if (leaf1Path.includes(leaf2)) {
      return createDistance(leaf1Path.indexOf(leaf2))
    } else if (leaf2Path.includes(leafPointer1)) {
      return createDistance(leaf2Path.indexOf(leafPointer1) + leaf1Path.indexOf(leafPointer1))
    }
    leafPointer1 = leafPointer1.parent
  }

  while (leafPointer2.parent !== null) {
    leaf2Path.push(leafPointer2)
    if (leaf2Path.includes(leaf1)) {
      return createDistance(leaf2Path.indexOf(leaf1))
    } else if (leaf1Path.includes(leafPointer2)) {
      return createDistance(leaf2Path.indexOf(leafPointer2) + leaf1Path.indexOf(leafPointer2))
    }
    leafPointer2 = leafPointer2.parent
  }

  // we have reached the root
  return createDistance(leaf2Path.length + leaf1Path.length)
}

// Distance between leafs, but taking into account locked door costs (e.g. how much you have to travel around)
export const getLockedDistanceBetweenLeafs = (leaf1, leaf2, withRecursion = false) => {
  const distanceObject = getDistanceBetweenLeafs(leaf1, leaf2)

  if (distanceObject.criticalPath.length) {
    let totalDistance = distanceObject.distance
    // Remove first and last entries - they are leaf1 and leaf2
    const criticalPath = distanceObject.criticalPath
    criticalPath.shift()
    criticalPath.pop()

    if (!criticalPath.length) {
      return totalDistance
    }

    criticalPath.forEach(leaf => {
      // TODO - Assume the first key unlocks for now
      // Passing false might speed things up here to withRecursion
      const key = leaf.keys[0]
      const addedDistance = withRecursion
        ? getLockedDistanceBetweenLeafs(key, leaf, true)
        : getDistanceBetweenLeafs(key, leaf)
      totalDistance += withRecursion ? addedDistance : addedDistance.distance
    })
    return totalDistance
  }
}
