import random as J;
RandomIntGenerator=J.randint
x=( 0, 1,-1, 0)
y=(-1, 0, 0, 1)

g = lambda row,column: ((0 <= row < HEIGHT) and (0 <= column < WIDTH)) and gridProbabilities[row][column] or (row, column) in (START_POSITION, END_POSITION)
def l(row,column): 
  if not g(row + y[direction], column + x[direction]):
    return (row, column)
  else:
    return l(row + y[direction], column + x[direction])

HEIGHT,WIDTH,SEED=input()

J.seed(SEED)
while 1:
  START_POSITION=(-1,RandomIntGenerator(0,WIDTH))
  print("RESTARTING")
  END_POSITION=(HEIGHT,RandomIntGenerator(0,WIDTH))
  gridProbabilities=[[RandomIntGenerator(0,7)for _ in range(WIDTH)]for _ in range(HEIGHT)]
  nodesToVisit=[(START_POSITION,'')]
  currentPosition=visited={}
  while nodesToVisit and currentPosition!=END_POSITION:
    currentPosition,visitedPath=nodesToVisit.pop()
    print(visitedPath)
    for direction in range(4):
     N=l(*currentPosition)
     if g(currentPosition[0]+y[direction],currentPosition[1]+x[direction]) and N not in visited:
      print("before")
      print(nodesToVisit)
      nodesToVisit[:0]=[(N,visitedPath+"URLD"[direction])]
      print("after")
      print(nodesToVisit)
      print("-----")
      visited[N]=1
  if(currentPosition==END_POSITION)*len(visitedPath)>min(HEIGHT,WIDTH):
    print"\n".join(''.join('O.'[c>0]for c in T)for T in gridProbabilities),"\nT",START_POSITION[1],"\nB",END_POSITION[1],"\n",visitedPath
    break