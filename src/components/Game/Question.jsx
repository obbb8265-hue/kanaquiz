import React, { Component } from 'react';
import { kanaDictionary } from '../../data/kanaDictionary';
import { quizSettings } from '../../data/quizSettings';
import { findRomajisAtKanaKey, removeFromArray, arrayContains, shuffle, cartesianProduct } from '../../data/helperFuncs';
import './Question.scss';

class Question extends Component {
  state = {
    previousQuestion: [],
    previousAnswer: '',
    currentAnswer: '',
    currentQuestion: [],
    answerOptions: [],
    stageProgress: 0,
    // New states for custom vocab
    isCustomVocab: false,
    customVocabList: [],
    currentVocabIndex: 0,
    showMeaning: false,
    feedback: ''
  }

  // ==================== CUSTOM VOCAB FUNCTIONS ====================

  startCustomVocab = () => {
    const { isCustomVocab, customVocabList } = this.props;
    if (isCustomVocab && customVocabList && customVocabList.length > 0) {
      this.setState({
        isCustomVocab: true,
        customVocabList: customVocabList,
        currentVocabIndex: 0,
        stageProgress: 0,
        feedback: ''
      }, () => {
        this.loadNextVocabQuestion();
      });
    }
  };

  loadNextVocabQuestion = () => {
    const { customVocabList, currentVocabIndex } = this.state;
    if (currentVocabIndex >= customVocabList.length) {
      this.setState({ feedback: '🎉 You finished the list!' });
      return;
    }

    this.setState({
      currentQuestion: [customVocabList[currentVocabIndex]],
      currentAnswer: '',
      feedback: '',
      showMeaning: false
    });
  };

  handleVocabSubmit = (e) => {
    e.preventDefault();
    if (!this.state.currentAnswer) return;

    const currentItem = this.state.currentQuestion[0];
    const userInput = this.state.currentAnswer.toLowerCase().trim();
    const correctRomaji = currentItem.romaji.toLowerCase().trim();

    const isCorrect = userInput === correctRomaji;

    let feedbackText = '';
    if (isCorrect) {
      feedbackText = `✅ Correct! ${currentItem.meaning}`;
    } else {
      feedbackText = `❌ Wrong. Correct: ${correctRomaji} — ${currentItem.meaning}`;
    }

    this.setState({
      feedback: feedbackText,
      showMeaning: true
    });

    // Move to next question after 2 seconds
    setTimeout(() => {
      this.setState(prevState => ({
        currentVocabIndex: prevState.currentVocabIndex + 1,
        stageProgress: prevState.stageProgress + (isCorrect ? 1 : 0)
      }), () => {
        this.loadNextVocabQuestion();
      });
    }, 1800);
  };

  // ==================== ORIGINAL FUNCTIONS (kept mostly unchanged) ====================

  getRandomKanas(amount, include, exclude) {
    // ... (your original function - keep it exactly as it was)
    let randomizedKanas = this.askableKanaKeys.slice();
    if(exclude && exclude.length > 0) {
      randomizedKanas = removeFromArray(exclude, randomizedKanas);
    }
    if(include && include.length > 0) {
      randomizedKanas = removeFromArray(include, randomizedKanas);
      shuffle(randomizedKanas);
      randomizedKanas = randomizedKanas.slice(0,20);
      let searchFor = findRomajisAtKanaKey(include, kanaDictionary)[0];
      randomizedKanas = randomizedKanas.filter(character => {
        return searchFor != findRomajisAtKanaKey(character, kanaDictionary)[0];
      });
      let tempRandomizedKanas = randomizedKanas.slice();
      randomizedKanas = randomizedKanas.filter(r => {
        let dupeFound = false;
        searchFor = findRomajisAtKanaKey(r, kanaDictionary)[0];
        tempRandomizedKanas.shift();
        tempRandomizedKanas.forEach(w => {
          if(findRomajisAtKanaKey(w, kanaDictionary)[0]==searchFor)
            dupeFound = true;
        });
        return !dupeFound;
      });
      randomizedKanas = randomizedKanas.slice(0, amount-1);
      randomizedKanas.push(include);
      shuffle(randomizedKanas);
    }
    else {
      shuffle(randomizedKanas);
      randomizedKanas = randomizedKanas.slice(0, amount);
    }
    return randomizedKanas;
  }

  setNewQuestion() {
    if(this.props.stage != 4)
      this.currentQuestion = this.getRandomKanas(1, false, this.previousQuestion);
    else
      this.currentQuestion = this.getRandomKanas(3, false, this.previousQuestion);

    this.setState({currentQuestion: this.currentQuestion});
    this.setAnswerOptions();
    this.setAllowedAnswers();
  }

  setAnswerOptions() {
    this.answerOptions = this.getRandomKanas(3, this.currentQuestion[0], false);
    this.setState({answerOptions: this.answerOptions});
  }

  setAllowedAnswers() {
    this.allowedAnswers = [];
    if(this.props.stage==1 || this.props.stage==3)
      this.allowedAnswers = findRomajisAtKanaKey(this.currentQuestion, kanaDictionary);
    else if(this.props.stage==2)
      this.allowedAnswers = this.currentQuestion;
    else if(this.props.stage==4) {
      let tempAllowedAnswers = [];
      this.currentQuestion.forEach(key => {
        tempAllowedAnswers.push(findRomajisAtKanaKey(key, kanaDictionary));
      });
      cartesianProduct(tempAllowedAnswers).forEach(answer => {
        this.allowedAnswers.push(answer.join(''));
      });
    }
  }

  handleAnswer = answer => {
    if(this.props.stage <= 2) document.activeElement.blur();
    this.previousQuestion = this.currentQuestion;
    this.setState({previousQuestion: this.previousQuestion});
    this.previousAnswer = answer;
    this.setState({previousAnswer: this.previousAnswer});
    this.previousAllowedAnswers = this.allowedAnswers;

    if(this.isInAllowedAnswers(this.previousAnswer))
      this.stageProgress = this.stageProgress + 1;
    else
      this.stageProgress = this.stageProgress > 0 ? this.stageProgress - 1 : 0;

    this.setState({stageProgress: this.stageProgress});

    if(this.stageProgress >= quizSettings.stageLength[this.props.stage] && !this.props.isLocked) {
      setTimeout(() => { this.props.handleStageUp() }, 300);
    }
    else
      this.setNewQuestion();
  }

  initializeCharacters() {
    this.askableKanas = {};
    this.askableKanaKeys = [];
    this.askableRomajis = [];
    this.previousQuestion = '';
    this.previousAnswer = '';
    this.stageProgress = 0;

    Object.keys(kanaDictionary).forEach(whichKana => {
      Object.keys(kanaDictionary[whichKana]).forEach(groupName => {
        if(arrayContains(groupName, this.props.decidedGroups)) {
          this.askableKanas = Object.assign(this.askableKanas, kanaDictionary[whichKana][groupName]['characters']);
          Object.keys(kanaDictionary[whichKana][groupName]['characters']).forEach(key => {
            this.askableKanaKeys.push(key);
            this.askableRomajis.push(kanaDictionary[whichKana][groupName]['characters'][key][0]);
          });
        }
      });
    });
  }

  getAnswerType() {
    if(this.props.stage==2) return 'kana';
    else return 'romaji';
  }

  getShowableQuestion() {
    if (this.state.isCustomVocab) {
      return this.state.currentQuestion[0] ? this.state.currentQuestion[0].character : '';
    }
    if(this.getAnswerType()=='kana')
      return findRomajisAtKanaKey(this.state.currentQuestion, kanaDictionary)[0];
    else return this.state.currentQuestion;
  }

  getPreviousResult() {
    if (this.state.isCustomVocab) {
      return this.state.feedback ? 
        <div className="previous-result" style={{fontSize: "1.1em", padding: "15px"}}>
          {this.state.feedback}
        </div> : null;
    }

    // Original previous result logic (keep as is)
    let resultString = '';
    if(this.previousQuestion==='')
      resultString = <div className="previous-result none">Let's go! Which character is this?</div>;
    else {
      let rightAnswer = (
        this.props.stage==2 ?
          findRomajisAtKanaKey(this.previousQuestion, kanaDictionary)[0]
          : this.previousQuestion.join('')
        ) + ' = ' + this.previousAllowedAnswers[0];

      if(this.isInAllowedAnswers(this.previousAnswer))
        resultString = (
          <div className="previous-result correct">
            <span className="pull-left glyphicon glyphicon-none"></span>{rightAnswer}<span className="pull-right glyphicon glyphicon-ok"></span>
          </div>
        );
      else
        resultString = (
          <div className="previous-result wrong">
            <span className="pull-left glyphicon glyphicon-none"></span>{rightAnswer}<span className="pull-right glyphicon glyphicon-remove"></span>
          </div>
        );
    }
    return resultString;
  }

  isInAllowedAnswers(previousAnswer) {
    if(arrayContains(previousAnswer, this.previousAllowedAnswers))
      return true;
    else return false;
  }

  handleAnswerChange = e => {
    this.setState({currentAnswer: e.target.value.replace(/\s+/g, '')});
  }

  handleSubmit = e => {
    e.preventDefault();
    if (this.state.isCustomVocab) {
      this.handleVocabSubmit(e);
    } else if(this.state.currentAnswer !== '') {
      this.handleAnswer(this.state.currentAnswer.toLowerCase());
      this.setState({currentAnswer: ''});
    }
  }

  componentWillMount() {
    this.initializeCharacters();
  }

  componentDidMount() {
    // Check if we are in custom vocab mode
    if (this.props.isCustomVocab) {
      this.startCustomVocab();
    } else {
      this.setNewQuestion();
    }
  }

  render() {
    const isCustom = this.state.isCustomVocab;

    let btnClass = "btn btn-default answer-button";
    if ('ontouchstart' in window) btnClass += " no-hover";

    let stageProgressPercentage = Math.round((this.state.stageProgress / (isCustom ? this.state.customVocabList.length : quizSettings.stageLength[this.props.stage])) * 100) + '%';
    let stageProgressPercentageStyle = { width: stageProgressPercentage };

    return (
      <div className="text-center question col-xs-12">
        {this.getPreviousResult()}

        <div className="big-character" style={{ fontSize: isCustom ? "3.5em" : "5em" }}>
          {this.getShowableQuestion()}
        </div>

        <div className="answer-container">
          {isCustom ? (
            <div className="answer-form-container">
              <form onSubmit={this.handleSubmit}>
                <input 
                  autoFocus 
                  className="answer-input" 
                  type="text" 
                  value={this.state.currentAnswer} 
                  onChange={this.handleAnswerChange}
                  placeholder="Type romaji here..."
                />
                <button type="submit" className="btn btn-success" style={{marginTop: "10px"}}>
                  Submit Answer
                </button>
              </form>
            </div>
          ) : this.props.stage < 3 ? (
            this.state.answerOptions.map((answer, idx) => (
              <AnswerButton 
                key={idx}
                answer={answer}
                className={btnClass}
                answertype={this.getAnswerType()}
                handleAnswer={this.handleAnswer} 
              />
            ))
          ) : (
            <div className="answer-form-container">
              <form onSubmit={this.handleSubmit}>
                <input 
                  autoFocus 
                  className="answer-input" 
                  type="text" 
                  value={this.state.currentAnswer} 
                  onChange={this.handleAnswerChange} 
                />
              </form>
            </div>
          )}
        </div>

        <div className="progress">
          <div className="progress-bar progress-bar-info"
            role="progressbar"
            aria-valuenow={this.state.stageProgress}
            aria-valuemin="0"
            aria-valuemax={isCustom ? this.state.customVocabList.length : quizSettings.stageLength[this.props.stage]}
            style={stageProgressPercentageStyle}
          >
            <span>
              {isCustom 
                ? `Vocab Test • ${this.state.currentVocabIndex + 1} / ${this.state.customVocabList.length}`
                : `Stage ${this.props.stage} ${this.props.isLocked ? '(Locked)' : ''}`}
            </span>
          </div>
        </div>
      </div>
    );
  }
}

// AnswerButton component (unchanged)
class AnswerButton extends Component {
  getShowableAnswer() {
    if(this.props.answertype === 'romaji')
      return findRomajisAtKanaKey(this.props.answer, kanaDictionary)[0];
    else return this.props.answer;
  }

  render() {
    return (
      <button className={this.props.className} onClick={()=>this.props.handleAnswer(this.getShowableAnswer())}>
        {this.getShowableAnswer()}
      </button>
    );
  }
}

export default Question;
