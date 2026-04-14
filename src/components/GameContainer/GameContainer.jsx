import React, { Component } from 'react';
import { kanaDictionary } from '../../data/kanaDictionary';
import ChooseCharacters from '../ChooseCharacters/ChooseCharacters';
import Game from '../Game/Game';

// ← Add these two imports
import { hiraganaVocab } from '../../data/hiraganaVocab.js JavaScript';
import { katakanaVocab } from '../../data/katakanaVocab.js';

class GameContainer extends Component {
  state = {
    stage: 1,
    isLocked: false,
    decidedGroups: JSON.parse(localStorage.getItem('decidedGroups') || null) || [],
    // New state for custom vocab
    isCustomVocab: false,
    customVocabList: [],
    customVocabTitle: ''
  }

  componentWillReceiveProps() {
    if (!this.state.isLocked)
      this.setState({ stage: 1 });
  }

  // New function to start custom vocab test
  startCustomVocab = (list, title) => {
    const shuffled = [...list].sort(() => Math.random() - 0.5);

    this.setState({
      isCustomVocab: true,
      customVocabList: shuffled,
      customVocabTitle: title,
      decidedGroups: []   // clear normal groups
    });

    this.props.handleStartGame();
  };

  // Keep your original startGame
  startGame = decidedGroups => {
    if (parseInt(this.state.stage) < 1 || isNaN(parseInt(this.state.stage)))
      this.setState({ stage: 1 });
    else if (parseInt(this.state.stage) > 4)
      this.setState({ stage: 4 });

    this.setState({
      decidedGroups: decidedGroups,
      isCustomVocab: false,        // important: reset custom mode
      customVocabList: [],
      customVocabTitle: ''
    });

    localStorage.setItem('decidedGroups', JSON.stringify(decidedGroups));
    this.props.handleStartGame();
  }

  stageUp = () => {
    this.setState({ stage: this.state.stage + 1 });
  }

  lockStage = (stage, forceLock) => {
    if (forceLock)
      this.setState({ stage: stage, isLocked: true });
    else
      this.setState({ stage: stage, isLocked: !this.state.isLocked });
  }

  render() {
    return (
      <div>
        {this.props.gameState === 'chooseCharacters' &&
          <ChooseCharacters
            selectedGroups={this.state.decidedGroups}
            handleStartGame={this.startGame}
            stage={this.state.stage}
            isLocked={this.state.isLocked}
            lockStage={this.lockStage}

            // ← Pass new props to ChooseCharacters
            startCustomVocab={this.startCustomVocab}
            hiraganaVocab={hiraganaVocab}
            katakanaVocab={katakanaVocab}
          />
        }

        {this.props.gameState === 'game' &&
          <Game
            decidedGroups={this.state.decidedGroups}
            handleEndGame={this.props.handleEndGame}
            stageUp={this.stageUp}
            stage={this.state.stage}
            isLocked={this.state.isLocked}
            lockStage={this.lockStage}

            // ← Pass custom vocab props to Game component
            isCustomVocab={this.state.isCustomVocab}
            customVocabList={this.state.customVocabList}
            customVocabTitle={this.state.customVocabTitle}
          />
        }
      </div>
    )
  }
}

export default GameContainer;
