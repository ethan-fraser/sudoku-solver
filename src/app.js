const fs = require('fs');
const Puzzle = require('./Puzzle');

let puzzle = new Puzzle('assets/test-puzzle.txt');
console.log(puzzle.toString());
puzzle.solve();
console.log(puzzle.toString());
