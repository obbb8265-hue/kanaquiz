import React, { Component } from 'react';
import Switch from 'react-toggle-switch';
import { kanaDictionary } from '../../data/kanaDictionary';
import './ChooseCharacters.scss';
import CharacterGroup from './CharacterGroup';

class ChooseCharacters extends Component {
  state = {
    errMsg: '',
    selectedGroups: this.props.selectedGroups,
    showAlternatives: [],
    showSimilars: [],
    startIsVisible: true
  }

  // ... (keep all your existing methods unchanged: componentDidMount, testIsStartVisible, scrollToStart, getIndex, isSelected, removeSelect, addSelect, toggleSelect, selectAll, selectNone, toggleAlternative, etc.)

  // New method for custom vocab
  startCustomVocab = (list, title) => {
    if (list.length === 0) {
      this.setState({ errMsg: 'Vocab list is empty!' });
      return;
    }
    this.props.startCustomVocab(list, title);
  };

  startGame() {
    if (this.state.selectedGroups.length < 1) {
      this.setState({ errMsg: 'Choose at least one group!' });
      return;
    }
    this.props.handleStartGame(this.state.selectedGroups);
  }

  render() {
    return (
      <div className="choose-characters">
        <div className="row">
          <div className="col-xs-12">
            <div className="panel panel-default">
              <div className="panel-body welcome">
                <h4>Welcome to Kana Pro!</h4>
                <p>Please choose the groups of characters that you'd like to be studying.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hiragana and Katakana selection panels - keep exactly as before */}
        <div className="row">
          <div className="col-sm-6">
            <div className="panel panel-default">
              <div className="panel-heading">Hiragana · ひらがな</div>
              <div className="panel-body selection-areas">
                {this.showGroupRows('hiragana', this.state.showAlternatives.indexOf('hiragana') >= 0)}
              </div>
              <div className="panel-footer text-center">
                <a href="javascript:;" onClick={()=>this.selectAll('hiragana')}>All</a> &nbsp;&middot;&nbsp; 
                <a href="javascript:;" onClick={()=>this.selectNone('hiragana')}>None</a>
                &nbsp;&middot;&nbsp; 
                <a href="javascript:;" onClick={()=>this.selectAll('hiragana', true)}>All alternative</a>
                &nbsp;&middot;&nbsp; 
                <a href="javascript:;" onClick={()=>this.selectNone('hiragana', true)}>No alternative</a>
              </div>
            </div>
          </div>

          <div className="col-sm-6">
            <div className="panel panel-default">
              <div className="panel-heading">Katakana · カタカナ</div>
              <div className="panel-body selection-areas">
                {this.showGroupRows('katakana', this.state.showAlternatives.indexOf('katakana') >= 0, this.state.showSimilars.indexOf('katakana') >= 0)}
              </div>
              <div className="panel-footer text-center">
                <a href="javascript:;" onClick={()=>this.selectAll('katakana')}>All</a> &nbsp;&middot;&nbsp; 
                <a href="javascript:;" onClick={()=>this.selectNone('katakana')}>None</a>
                &nbsp;&middot;&nbsp; 
                <a href="javascript:;" onClick={()=>this.selectAll('katakana', true)}>All alternative</a>
                &nbsp;&middot;&nbsp; 
                <a href="javascript:;" onClick={()=>this.selectNone('katakana', true)}>No alternative</a>
              </div>
            </div>
          </div>

          {/* New Custom Vocab Section */}
          <div className="col-xs-12">
            <div className="panel panel-default">
              <div className="panel-heading">Custom Vocab Tests</div>
              <div className="panel-body text-center" style={{padding: "25px 15px"}}>
                <button 
                  className="btn btn-primary btn-lg" 
                  style={{margin: "10px", minWidth: "280px"}}
                  onClick={() => this.startCustomVocab(this.props.hiraganaVocab, "Hiragana Vocab Test")}
                >
                  📝 Hiragana Vocab Test<br/>
                  <small>Common words • Type romaji + see meaning</small>
                </button>

                <button 
                  className="btn btn-primary btn-lg" 
                  style={{margin: "10px", minWidth: "280px"}}
                  onClick={() => this.startCustomVocab(this.props.katakanaVocab, "Katakana Vocab Test")}
                >
                  📝 Katakana Vocab Test<br/>
                  <small>Loanwords • Type romaji + see meaning</small>
                </button>
              </div>
            </div>
          </div>

          <div className="col-sm-3 col-xs-12 pull-right">
            <span className="pull-right lock">Lock to stage &nbsp;
              {this.props.isLocked &&
                <input className="stage-choice" type="number" min="1" max="4" maxLength="1" size="1"
                  onChange={(e)=>this.props.lockStage(e.target.value, true)}
                  value={this.props.stage}
                />
              }
              <Switch onClick={()=>this.props.lockStage(1)} on={this.props.isLocked} /></span>
          </div>

          <div className="col-sm-offset-3 col-sm-6 col-xs-12 text-center">
            {this.state.errMsg !== '' && <div className="error-message">{this.state.errMsg}</div>}
            <button 
              ref={c => this.startRef = c} 
              className="btn btn-danger startgame-button" 
              onClick={() => this.startGame()}
            >
              Start the Quiz!
            </button>
          </div>

          <div className="down-arrow"
            style={{display: this.state.startIsVisible ? 'none' : 'block'}}
            onClick={(e) => this.scrollToStart(e)}
          >
            Start
          </div>
        </div>
      </div>
    );
  }
}

export default ChooseCharacters;
