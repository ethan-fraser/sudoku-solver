# Sudoku Solver

This is a sudoku solver written to practice the basic concepts of Javascript and Node.js.

The general algorithm for solving uses a brute force backtracing algorithm, the general outline of which is as follows:

for each number 1-9:
 - is this number present in this row
 - is this number present in this column
 - is this number present in the box
 if yes:
  if it's less than 9:
    increment
  else:
    return to the previous cell and increment
 if no:
  place the number in the cell


alternately:
  for each cell make an array of possible values
  iterate over the puzzle eliminating possibilities as you go
