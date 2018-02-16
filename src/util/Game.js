// @flow

class Game {
  board: Array<Array<number>>;
  height: number;
  width: number;

  constructor() {
    this.height = 6;
    this.width = 7;
    this.board = [];
    for (let i = 0; i < this.height; i++) {
      this.board.push(Array(this.width).fill(0));
    }
  }

  getBoard(): Array<Array<number>> {
    return this.board;
  }

  getBoardTransposed(): Array<Array<number>> {
    const transposedBoard = [];
    for (let columnIndex = 0; columnIndex < this.width; columnIndex++) {
      transposedBoard.push(this.getColumn(columnIndex))
    }
    return transposedBoard;
  }

  getColumn(columnIndex: number): Array<number> {
    if (columnIndex >= this.width || columnIndex < 0) throw Error('Column out of boundary');
    return this.board.reduce((column, line) => {
      column.push(line[columnIndex]);
      return column;
    }, []);
  }

  getLine(lineIndex: number): Array<number> {
    if (lineIndex >= this.width || lineIndex < 0) throw Error('Line out of boundary');
    return this.board[lineIndex];
  }

  getLowestEmptyLine(column: Array<number>): ?number {
    if (column[0] !== 0) return null;
    let lineIndexToReplace;
    for (let lineIndex = 0; lineIndex < this.height; lineIndex++) {
      if (lineIndex === this.height - 1 ||
        column[lineIndex + 1] !== 0
      ) {
        lineIndexToReplace = lineIndex;
        break;
      }
    }
    return lineIndexToReplace;
  }

  playChip(playerId: number, columnIndex: number): void {
    const column = this.getColumn(columnIndex);
    const lineIndexToReplace = this.getLowestEmptyLine(column);
    if (lineIndexToReplace !== null && lineIndexToReplace !== undefined) {
      this.board[lineIndexToReplace][columnIndex] = playerId;
    } else {
      throw Error('Column is full');
    }
  }

  static checkForWinInArray(array: Array<number>): number {
    if (array.length < 4) return 0;
    const subArrayNumber = array.length - 4 + 1;
    for (let offset = 0; offset < subArrayNumber; offset++) {
      const subArray = array.slice(offset, offset + 4);
      if (subArray.indexOf(0) < 0) {
        if (Game.isConnectArray(subArray)) return subArray[0];
      }
    }
    return 0;
  }

  getDiagonalByHighestCellDescendingRight(lineIndex: number, columnIndex: number): ?Array<number> {
    const maxCroppedSquareSideLength = Math.min(
      this.height - lineIndex,
      this.width - columnIndex,
    );
    if (maxCroppedSquareSideLength < 4) return null;
    const diagonal = [];
    for (let cellIndex = 0; cellIndex < maxCroppedSquareSideLength; cellIndex++) {
      diagonal.push(this.board[lineIndex + cellIndex][columnIndex + cellIndex]);
    }
    return diagonal;
  }

  getDiagonalByHighestCellDescendingLeft(lineIndex: number, columnIndex: number): ?Array<number> {
    const maxCroppedSquareSideLength = Math.min(
      this.height - lineIndex,
      columnIndex + 1,
    );
    if (maxCroppedSquareSideLength < 4) return null;
    const diagonal = [];
    for (let cellIndex = 0; cellIndex < maxCroppedSquareSideLength; cellIndex++) {
      diagonal.push(this.board[lineIndex + cellIndex][columnIndex - cellIndex]);
    }
    return diagonal;
  }

  getAllDiagonalsDescendingRight(): Array<Array<number>> {
    const diagonals = [];
    let diagonal;
    for (let columnIndex = 0; columnIndex <= this.width - 4; columnIndex++) {
      diagonal = this.getDiagonalByHighestCellDescendingRight(0, columnIndex);
      if (!!diagonal) diagonals.push(diagonal);
    }
    for (let lineIndex = 1; lineIndex <= this.height - 4; lineIndex++) {
      diagonal = this.getDiagonalByHighestCellDescendingRight(lineIndex, 0);
      if (!!diagonal) diagonals.push(diagonal);
    }
    return diagonals;
  }

  getAllDiagonalsDescendingLeft(): Array<Array<number>> {
    const diagonals = [];
    let diagonal;
    for (let columnIndex = 0; columnIndex <= this.width - 4; columnIndex++) {
      diagonal = this.getDiagonalByHighestCellDescendingLeft(0, this.width - columnIndex - 1);
      if (!!diagonal) diagonals.push(diagonal);
    }
    for (let lineIndex = 1; lineIndex <= this.height - 4; lineIndex++) {
      diagonal = this.getDiagonalByHighestCellDescendingLeft(lineIndex, this.width - 1);
      if (!!diagonal) diagonals.push(diagonal);
    }
    return diagonals;
  }

  getAllDiagonals(): Array<Array<number>> {
    let diagonals = [];
    diagonals = diagonals.concat(this.getAllDiagonalsDescendingLeft());
    diagonals = diagonals.concat(this.getAllDiagonalsDescendingRight());
    return diagonals;
  }

  static isConnectArray(array: Array<number>): boolean {
    return (array[0] === array[1] && array[1] === array[2] && array[2] === array[3]);
  }

  getAllLines(): Array<Array<number>> {
    const lines = [];
    for (let lineIndex = 0; lineIndex < this.height; lineIndex++) {
      lines.push(this.getLine(lineIndex));
    }
    return lines;
  }

  getAllColumns(): Array<Array<number>> {
    const columns = [];
    for (let columnsIndex = 0; columnsIndex < this.width; columnsIndex++) {
      columns.push(this.getColumn(columnsIndex));
    }
    return columns;
  }

  getAllArrays(): Array<Array<number>> {
    let arrays = this.getAllLines();
    arrays = arrays.concat(this.getAllColumns());
    arrays = arrays.concat(this.getAllDiagonals());
    return arrays;
  }

  checkForWin(): number {
    const arrays = this.getAllArrays();
    for (let arrayIndex = 0; arrayIndex < arrays.length; arrayIndex++) {
      const winIndicator = Game.checkForWinInArray(arrays[arrayIndex]);
      if (winIndicator !== 0) return winIndicator;
    }
    return 0;
  }
}

export default Game;