// @flow
import React from 'react';

import Column from './Column';
import BotChoice from './BotChoice';
import ScoreDisplay from './Score';
import DisplayMessage from './DisplayMessage';
import Game from '../util/Game';
import getLowestEmptyCellIndex from '../services/Array.service';
import appStyle from '../config/appStyle';
import networkWeights from '../networkWeights.json';
import networkWeightsCNN from '../networkWeightsCNN.json';
import { randomChoice } from '../util/Helper';
const synaptic = require('synaptic');
const convnetjs = require('convnetjs');

const styles = {
  boardContainer: {
    display: 'flex',
    backgroundColor: '#d2f0fb',
    width: '100%',
    justifyContent: 'center',
  },
  board: {
    display: 'flex',
  },
  boardFoot: {
    height: 120,
    width: 30,
    backgroundColor: appStyle.colors.blue,
    alignSelf: 'flex-end',
  },
  underBoard: {
    height: 60,
    width: 560,
    backgroundColor: appStyle.colors.white,
    display: 'flex',
    justifyContent: 'center',
  },
  underBoardFoot: {
    height: 60,
    width: 30,
    backgroundColor: appStyle.colors.blue,
    alignSelf: 'flex-end',
  },
  footer: {
    display: 'flex',
    backgroundColor: '#d2f0fb',
    width: '100%',
    justifyContent: 'center',
  },
}

type State = {
  board: Array<Array<number>>,
  botType: string,
  playerIdToPlay: number,
  game: Game,
  gamesWon: number,
  gamesPlayed: number,
  message: string,
  bot: any,
}

class Board extends React.Component<*, State> {
  state = {
    board: [
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ],
    botType: 'CNN',
    playerIdToPlay: 1,
    game: new Game(),
    gamesWon: 0,
    gamesPlayed: 0,
    message: '',
    bot: null,
  };

  componentDidMount() {
    const { game } = this.state;
    this.setState({ board: game.getBoardTransposed() });
    this.changeBot();
  }

  changeBot = () => {
    const { botType } = this.state;
    console.log(botType)
    let bot;
    if (botType === 'CNN') {
      const network = new convnetjs.Net();
      network.fromJSON(networkWeightsCNN);
      bot = network;
    } else {
      bot = synaptic.Network.fromJSON(networkWeights);
    }
    this.setState({ bot });
  }

  switchPlayer = async (): Promise<void> => {
    const { game } = this.state;
    if (this.state.playerIdToPlay === 1) {
      await this.setState({ playerIdToPlay: 2 }, () => {
        if (game.checkForWin() === 0) this.makeAIPlay();
      });
    }
    if (this.state.playerIdToPlay === 2) await this.setState({ playerIdToPlay: 1 });
  }

  makeAIPlay = async (): Promise<void> => {
    const { game, bot, botType } = this.state;
    let output;
    if (botType === 'CNN') {
      output = !!bot && bot.forward(game.getConvolutionnalVol(this.state.playerIdToPlay)).w;
    } else {
      output = !!bot && bot.activate(game.get1DArrayFormatted(this.state.playerIdToPlay));
    }
    let columnIndexToPlay;
    if (!!output) {
      columnIndexToPlay = output.indexOf(Math.max(...output));
      let playAgain = game.playChip(this.state.playerIdToPlay, columnIndexToPlay);
      if (!playAgain) {
        await this.switchPlayer();
        this.setState(
          { board: game.getBoardTransposed() },
        );
        this.checkForWinner();
        this.checkIfBoardFull();
      } else {
        while (playAgain) {
          let randomColumn = randomChoice([0, 1, 2, 3, 4, 5, 6]);
          playAgain = game.playChip(this.state.playerIdToPlay, randomColumn);
        }
        await this.switchPlayer();
        this.setState(
          { board: game.getBoardTransposed() },
        );
        this.checkForWinner();
        this.checkIfBoardFull();
      }
    }
  }

  checkIfBoardFull = (): void => {
    const { game } = this.state;
    const isBoardFull = game.isBoardFull();
    if (isBoardFull) {
      this.setState({ message: 'Match nul !' });
    }
  }

  checkForWinner = (): void => {
    const { game } = this.state;
    const winner = game.checkForWin();
    if (winner === 1) {
      this.setState({
        message: `Vous avez gagné :) Cliquez pour rejouer !`,
        gamesWon: this.state.gamesWon + 1,
        gamesPlayed: this.state.gamesPlayed + 1,
      });
    } else if (winner === 2) {
      this.setState({
        message: `La machine a gagné :( Cliquez pour rejouer !`,
        gamesPlayed: this.state.gamesPlayed + 1,
      });
    } else if (winner === -1) {
      this.setState({
        message: `Match nul ! Cliquez pour rejouer !`,
        gamesPlayed: this.state.gamesPlayed + 1,
      });
    }
  }

  onColumnEnter = (columnIndex: number): void => {
    const lowestEmptyCellIndex = getLowestEmptyCellIndex(this.state.board[columnIndex]);
    if (lowestEmptyCellIndex !== undefined && lowestEmptyCellIndex !== null) {
      const boardToDisplay = this.state.board;
      boardToDisplay[columnIndex][lowestEmptyCellIndex] = -this.state.playerIdToPlay;
      this.setState({ board: boardToDisplay });
    }
  }

  onColumnClick = (columnIndex: number): void => {
    const { game } = this.state;
    try {
      if (!!this.state.message && (game.checkForWin() > 0 || game.isBoardFull())) {
        const newGame = new Game();
        this.setState({
          message: '',
          game: newGame,
          board: newGame.getBoardTransposed(),
          playerIdToPlay: 1,
        });
      } else if (!!this.state.message) {
        this.setState({ message: '' });
      } else {
        game.playChip(this.state.playerIdToPlay, columnIndex);
        this.setState(
          { board: game.getBoardTransposed() },
          () => this.onColumnEnter(columnIndex)
        );
        this.checkForWinner();
        this.switchPlayer();
        this.checkIfBoardFull();
      }
    } catch (error) {
      this.setState({ message: 'Cette colonne est pleine !' });
    }
  }

  changeBotType = async (): Promise<void> => {
    const newGame = new Game();
    await this.setState({
      botType: this.state.botType === 'NN' ? 'CNN' : 'NN',
      message: '',
      game: newGame,
      board: newGame.getBoardTransposed(),
      playerIdToPlay: 1,
    })
    this.changeBot();
  }

  onColumnLeave = (columnIndex: number): void => {
    const boardToDisplay = this.state.board;
    boardToDisplay[columnIndex] = boardToDisplay[columnIndex].reduce((columnAccumulator, cell) => {
      columnAccumulator.push(Math.max(0, cell))
      return columnAccumulator;
    }, []);
    this.setState({ board: boardToDisplay });
  }

  render() {
    const { message } = this.state;
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <BotChoice
          botType={this.state.botType}
          onChangeChoice={this.changeBotType}
        />
        <div style={styles.boardContainer}>
          <DisplayMessage message={message}/>
          <div style={styles.boardFoot} />
          <div style={styles.board}>
            {this.state.board.map((column, index) =>
              <Column
                key={index}
                column={column}
                onMouseEnter={!message ? () => this.onColumnEnter(index) : () => {}}
                onMouseLeave={!message ? () => this.onColumnLeave(index) : () => {}}
                onClick={() => this.onColumnClick(index)}
              />,
            )}
          </div>
          <div style={styles.boardFoot} />
        </div>
        <div style={styles.footer}>
          <div style={styles.underBoardFoot} />
          <div style={styles.underBoard}>
            <ScoreDisplay
              gamesWon={this.state.gamesWon}
              gamesPlayed={this.state.gamesPlayed}
            />
          </div>
          <div style={styles.underBoardFoot} />
        </div>
      </div>
    );
  }
}

export default Board;
