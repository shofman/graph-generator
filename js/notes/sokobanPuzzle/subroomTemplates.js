/* eslint-disable */
export const hardcodedSubroomTemplates = {
    empty: [
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
    ],
    lonelyCorner: [
      [0, 0, 0, 0, 0],
      [0, 2, 1, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
    ],
    pairCorner: [
      [0, 0, 0, 1, 1],
      [0, 2, 2, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
    ],
    singleEdgeWall: [
      [0, 0, 0, 0, 0],
      [0, 2, 2, 2, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
    ],
    cornerWall: [
      [0, 0, 0, 0, 0],
      [0, 2, 2, 2, 0],
      [0, 2, 1, 1, 0],
      [0, 2, 1, 1, 0],
      [0, 0, 0, 0, 0],
    ],
    oppositeCorners: [
      [0, 0, 1, 0, 0],
      [0, 2, 1, 1, 0],
      [1, 1, 1, 1, 0],
      [0, 1, 1, 2, 0],
      [0, 0, 0, 0, 0],
    ],
    guardianBlocks: [
      [0, 0, 0, 0, 0],
      [0, 2, 1, 1, 0],
      [1, 1, 1, 1, 0],
      [0, 2, 1, 1, 0],
      [0, 0, 0, 0, 0],
    ],
    tripleThreat: [
      [0, 0, 1, 0, 0],
      [0, 2, 1, 1, 0],
      [1, 1, 1, 1, 0],
      [0, 2, 1, 2, 0],
      [0, 0, 1, 0, 0],
    ],
    fourCorners: [
      [0, 0, 1, 0, 0],
      [0, 2, 1, 2, 0],
      [1, 1, 1, 1, 1],
      [0, 2, 1, 2, 0],
      [0, 0, 1, 0, 0],
    ],
    corridorCorner: [
      [0, 0, 1, 0, 0],
      [0, 2, 1, 2, 0],
      [0, 2, 3, 1, 1],
      [0, 2, 2, 2, 0],
      [0, 0, 0, 0, 0],
    ],
    corridorStraight: [
      [0, 0, 0, 0, 0],
      [0, 2, 2, 2, 0],
      [1, 1, 1, 1, 1],
      [0, 2, 2, 2, 0],
      [0, 0, 0, 0, 0],
    ],
    middleBlock: [
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1],
      [0, 1, 2, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
    ],
    filled: [
      [0, 0, 0, 0, 0],
      [0, 2, 2, 2, 0],
      [0, 2, 2, 2, 0],
      [0, 2, 2, 2, 0],
      [0, 0, 0, 0, 0],
    ],
    tetrisL: [
      [0, 0, 0, 0, 0],
      [0, 2, 2, 2, 0],
      [0, 2, 1, 1, 0],
      [1, 1, 1, 1, 0],
      [1, 1, 0, 0, 0],
    ],
    centeredGuardians: [
      [0, 1, 0, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 2, 1, 2, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0],
    ],
    doubleThickWall: [
      [0, 0, 0, 0, 0],
      [0, 2, 2, 2, 0],
      [0, 2, 2, 2, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0],
    ],
    tetrisT: [
      [0, 0, 0, 0, 0],
      [0, 2, 2, 2, 0],
      [1, 1, 2, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 0, 0],
    ]
}