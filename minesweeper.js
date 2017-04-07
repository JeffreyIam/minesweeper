(function () {
  'use strict'

  angular
    .module('app', [])
    .component('minesweeper', {
      controller: mineController,
      templateUrl: 'minesweeper.html'
    })

  function mineController ($scope) {
    var $ctrl = this

    $ctrl.$onInit = function () {
      $ctrl.status = ''
      $ctrl.side = 9
      $ctrl.bombs = 10
      $ctrl.state = []
      $ctrl.start()
    }
    // display smile or frown based on game status
    $ctrl.smiley = function () {
      if ($ctrl.status === 'Game in Progress' || $ctrl.status === 'You Won! Congratulations - Click on smiley to reset') {
        return 'fa fa-smile-o'
      } else if ($ctrl.status === 'You Lost - Click on smiley to reset') {
        return 'fa fa-frown-o'
      }
    }
    // check if game is won by iterating through matrix and counting bombs while checking for unopened empty cells
    $ctrl.checkWin = function () {
      var numBombs = 0
      for (var row = 0; row < $ctrl.side; row++) {
        for (var col = 0; col < $ctrl.side; col++) {
          if ($ctrl.state[row][col].value === 0) {
              // still have unopened empty cell
            return false
          } else if ($ctrl.state[row][col].value === 1) {
            numBombs++
          }
        }
      }
      return numBombs === $ctrl.bombs
    }

    $ctrl.clicked = function (row, col) {
      if ($ctrl.status === 'You Won! Congratulations - Click on smiley to reset') {
        return
      }
      // if clicked on a bomb, game is lost
      if ($ctrl.state[row][col].value === 1) {
        $ctrl.lost()
        $ctrl.status = 'You Lost - Click on smiley to reset'
      } else if ($ctrl.state[row][col].value === 0) {
        $ctrl.showTile(row, col)
        // check if won on each click
        if ($ctrl.checkWin()) {
          $ctrl.status = 'You Won! Congratulations - Click on smiley to reset'
        }
      }
    }
    // update class to toggle flag
    $ctrl.flagged = function (row, col) {
      if ($ctrl.status === 'You Won! Congratulations - Click on smiley to reset') {
        return
      }
      $ctrl.state[row][col].flagged = !$ctrl.state[row][col].flagged
    }
    // update cell view based on value with ng-class
    $ctrl.cellView = function (cell) {
      // 0 represents unopened empty cell
      // 1 represents unopened bomb
      // 2 represents opened empty cell
      // 3 represents opened bomb
      // 4 represents lost game + missed cells

      if (cell.flagged && (cell.value === 0 || cell.value === 1)) {
        return 'cell hiddenCell glyphicon glyphicon-flag'
      }
      if (cell.value === 0 || cell.value === 1) {
        return 'cell hiddenCell'
      } else if (cell.value === 2) {
        return 'cell'
      } else if (cell.value === 3) {
        return 'cell showMine glyphicon glyphicon-asterisk'
      } else if (cell.value === 4) {
        return 'cell showMissed'
      }
    }

    $ctrl.generalClick = function (evt, row, col) {
      switch (evt.which) {
        case 1:
            // left click
          $ctrl.clicked(row, col)
          break
        case 2:
            // middle click
          break
        case 3:
            // toggle flag on right click
          $ctrl.flagged(row, col)
          break
      }
    }
    // iterate through matrix and display missed empty cells and bombs
    $ctrl.lost = function () {
      for (var row = 0; row < $ctrl.side; row++) {
        for (var col = 0; col < $ctrl.side; col++) {
          if ($ctrl.state[row][col].value === 0) {
            $ctrl.state[row][col].value = 4
          } else if ($ctrl.state[row][col].value === 1) {
            $ctrl.state[row][col].value = 3
          }
        }
      }
    }

    $ctrl.noBomb = function (row, col) {
      if (row < 0 || row >= $ctrl.side || col < 0 || col >= $ctrl.side) {
        return true
      }
      // return true if cell is unopened empty, opened empty, or game is lost
      return $ctrl.state[row][col].value === 0 ||
             $ctrl.state[row][col].value === 2 ||
             $ctrl.state[row][col].value === 4
             // need 4 because it will increment everything I didn't click on when the map is revealed instead of just nearby bombs i.e. everything I didn't click on would be counted as a bomb
    }

    $ctrl.showTile = function (row, col) {
        // if out of bounds, return
      console.log(row, col)
      if (row < 0 || row >= $ctrl.side || col < 0 || col >= $ctrl.side) {
        console.log('returned ' + row + col)
        return
      }
        // if cell is upopened and empty, show empty clicked cell and check around
      if ($ctrl.state[row][col].value === 0) {
        console.log('is empty', row, col)
        $ctrl.state[row][col].value = 2
        // if no bomb close by then show empty cells and keep checking around
        if ($ctrl.noBomb(row - 1, col - 1) &&
             $ctrl.noBomb(row - 1, col) &&
             $ctrl.noBomb(row - 1, col + 1) &&
             $ctrl.noBomb(row, col - 1) &&
             $ctrl.noBomb(row, col + 1) &&
             $ctrl.noBomb(row + 1, col - 1) &&
             $ctrl.noBomb(row + 1, col) &&
             $ctrl.noBomb(row + 1, col + 1)) {
          $ctrl.showTile(row - 1, col - 1)
          $ctrl.showTile(row - 1, col)
          $ctrl.showTile(row - 1, col + 1)
          $ctrl.showTile(row, col - 1)
          $ctrl.showTile(row, col)
          $ctrl.showTile(row, col + 1)
          $ctrl.showTile(row + 1, col - 1)
          $ctrl.showTile(row + 1, col)
          $ctrl.showTile(row + 1, col + 1)
        }
      }
    }

    $ctrl.start = function () {
      $ctrl.status = 'Game in Progress'
      for (var i = 0; i < $ctrl.side; i++) {
        $ctrl.state[i] = [new Array($ctrl.side)]
        for (var j = 0; j < $ctrl.side; j++) {
          $ctrl.state[i][j] = {
            value: 0,
            flagged: false
          }
        }
      }
      $ctrl.placeBombs()
    }

    $ctrl.placeBombs = function () {
      var numBombs = 0
      while (numBombs < $ctrl.bombs) {
        var currentRow = Math.floor(Math.random() * ($ctrl.side))
        var currentCol = Math.floor(Math.random() * ($ctrl.side))

        if ($ctrl.state[currentRow][currentCol].value !== 1) {
          $ctrl.state[currentRow][currentCol].value = 1
          numBombs++
        }
      }
    }

    $ctrl.cellTile = function (cell, row, col) {
      // empty cell, unopened bomb, opened bomb, do not display a cell tile # because we do not want a number in our bomb cells
      if ($ctrl.state[row][col].value === 0 || $ctrl.state[row][col].value === 1 || $ctrl.state[row][col].value === 3) {
        return ''
      }
      // if there is a bomb in vicinity, will be true, we add up the trues to display cell numbers
      var res = !$ctrl.noBomb(row - 1, col - 1) +
                !$ctrl.noBomb(row - 1, col) +
                !$ctrl.noBomb(row - 1, col + 1) +
                !$ctrl.noBomb(row, col - 1) +
                !$ctrl.noBomb(row, col + 1) +
                !$ctrl.noBomb(row + 1, col - 1) +
                !$ctrl.noBomb(row + 1, col) +
                !$ctrl.noBomb(row + 1, col + 1)
      // if no bombs near cell, display blank cell
      if (res === 0) {
        return ''
      }
      return res
    }
  }
})()
