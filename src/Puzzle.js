const fs = require('fs');

class Puzzle {
  
  /**Construct a puzzle instance, set up the index array and the 2d array,
    * and then read the puzzle from the given file into the arrays*/
  constructor(numbersFile){
    this.cells = [];
    this.cells2d = [];
    this.readNumbers(numbersFile);
  }

  /**Read the sudoku puzzle from a given text file. */
  readNumbers(numbersFile){
    var buff = fs.readFileSync(numbersFile, 'utf8'); //load file into buffer

    for (var letter of buff){
      this.cells.push(letter === '.' ? " " : "*"+letter); //if it's a clue we give it an asterisk
    }
    this.cells.pop(); //the last character of the file is "\n"
    
    for (var row = 0; row < 81; row+=9){ //loop through every 9 values to emulate a row
      var rowBuff = [];
      for (var col = 0; col < 9; col++){
        rowBuff.push(buff[row+col] === '.' ? " " : "*"+buff[row+col]);
      }
      this.cells2d.push(rowBuff);
    }
  }
  
  /** Present the sudoku puzzle in a human readable format */
  toString(){
    var puzzleBuffer = ""; 
    for (var row = 0; row < 9; row++){
      var rowBuffer = "";
      for (var col = 0; col < 9; col++){
        if (col % 3 == 0){
          // If it's not a clue we have to give it extra spacing to account for the * in the others
          rowBuffer += this.cells2d[row][col].indexOf("*") > -1 ? " || " : " ||  "
        } else {
          rowBuffer += this.cells2d[row][col].indexOf("*") > -1 ? " | " : " |  "
        }
        rowBuffer += this.cells2d[row][col];
      }
      if (row % 3 == 0){
        puzzleBuffer += " " + "_".repeat(49) + "\n";
      }
      puzzleBuffer += rowBuffer + " |\n";
    }
    return puzzleBuffer;
  }

  /** Convert the puzzle to an HTML table. */
  toTable(){
    var puzzleBuffer = "<table>";
    for (var row = 0; row < 9; row++){
      var rowBuffer = "<tr>";
      for (var col = 0; col < 9; col++){
        rowBuffer += "<td>" + this.cells2d[row][col] + "</td>";
      }
      puzzleBuffer += rowBuffer + "</tr>";
    }
    return puzzleBuffer + "</table>";
  }

  /**Check if a number is present in a given row */
  inRow(row, value){
    if (this.cells2d[row]
      .map(cell => cell.replace("*", ""))
      .indexOf(value.toString()) > -1){
      return true;
    } else {
      return false;
    }
  }

  /**Check if a number is present in a given column */
  inColumn(col, value){
    for (var row of this.cells2d){
      if (row[col].replace("*", "") === value.toString()){
        return true;
      }
    }
    return false;
  }

  /**Check if a number is present in is box.
    * We have to find the center of a cell's box first and then do checks based on it*/
  inBox(row, col, value){
    var boxCenterRow;
    var boxCenterCol;
    if (row < 3){
      boxCenterRow = 1;
    } else if (row < 6){
      boxCenterRow = 4;
    } else {
      boxCenterRow = 7;
    }
    if (col < 3){
      boxCenterCol = 1;
    } else if (col < 6){
      boxCenterCol = 4;
    } else {
      boxCenterCol = 7;
    }
    
    var cells2dnoasterisk = this.cells2d.map(row => {
      return row.map(cell => {
        return cell.replace("*", "");
      })
    })

    if (  cells2dnoasterisk[boxCenterRow][boxCenterCol] === value.toString()         // center cell
      ||  cells2dnoasterisk[boxCenterRow][boxCenterCol + 1] === value.toString()     // above center
      ||  cells2dnoasterisk[boxCenterRow][boxCenterCol - 1] === value.toString()     // below center
      ||  cells2dnoasterisk[boxCenterRow + 1][boxCenterCol] === value.toString()     // right of center
      ||  cells2dnoasterisk[boxCenterRow - 1][boxCenterCol] === value.toString()     // left of center
      ||  cells2dnoasterisk[boxCenterRow + 1][boxCenterCol + 1] === value.toString() // top right
      ||  cells2dnoasterisk[boxCenterRow + 1][boxCenterCol - 1] === value.toString() // top left
      ||  cells2dnoasterisk[boxCenterRow - 1][boxCenterCol + 1] === value.toString() // bottom right
      ||  cells2dnoasterisk[boxCenterRow - 1][boxCenterCol - 1] === value.toString() // bottom left
    ){
      return true;
    } else {
      return false;
    }

  }

  /**Convert coordinate values of 9x9 square into a linear array index. Opposite of indexToCoords() */
  coordsToIndex(row, col){
    return (row * 9) + col;
  }

  /**Convert a linear array index into 2d coords for a 9x9 square. Opposite of coordsToIndex() */
  indexToCoords(index){
    return {
      row: Math.floor(index / 9),
      col: index % 9
    };
  }

  /**Update a cell indexed by its 2D coordinates */
  updateCellByCoords(row, col, value){
    this.cells2d[row][col] = value.toString();
    this.cells[this.coordsToIndex(row, col)] = value.toString();
  }

  /**Update a cell indexed by its linear array value */
  updateCellByIndex(index, value){
    this.cells[index] = value.toString();
    var coords = this.indexToCoords(index);
    this.cells2d[coords.row][coords.col] = value.toString();
  }

  /**Check if a number fits in a given cell. This function is a consolidation of the inRow,
    * inColumn, and inBox methods.*/
  checkNumberFits(index, value){
    var coords = this.indexToCoords(index);
    // if (this.inRow(coords.row, value) || this.inColumn(coords.col, value) || this.inBox(coords.row, coords.col, value)){
    if (this.inRow(coords.row, value)){
      return false;
    } else if (this.inColumn(coords.col, value)){
      return false;
    } else if (this.inBox(coords.row, coords.col, value)){
      return false;
    } else {
      return true;
    }
  }

  /**Solve the puzzle. See rules.txt for the algorithm's simplified pseudocode */
  solve(){
    var index = 0;
    while (index < 8){ // we want to go through every cell until we reach #81
      console.log(index);
      var coords = this.indexToCoords(index);

      // if it's a clue we want to leave it alone.
      // if (this.cells[index].indexOf("*") > -1){ 
      //   index++; 
      //   continue;
      // }

      // the start value is 1 if the cell is empty, otherwise it's its current value + 1
      if (this.cells[index] == ' ') {
        var start = 1;
      } else {
        var start = this.cells[index]+1;
      }

      // if a value between start and 9 fits in the cell, set it to that and move on to the next cell
      // it's a mess from here...
      var updated = false;
      for (var i = start; i <= 9; i++){
        if (this.checkNumberFits(index, i)){
          updated = true;
          this.updateCellByIndex(index, i);
          index++;
          break;
        }
      }
      if (updated) continue;
      // if none of these fit then we've made a mistake and
      // we need to go back and increment the previous cell
      if (index > 1) {
        index--;
      } else {
        this.cells[index] = " ";
        index -=2;
      }
      if (this.cells[index].indexOf("*") > -1){
        index--;
      }
      continue;
    }
  }

}

module.exports = Puzzle;
