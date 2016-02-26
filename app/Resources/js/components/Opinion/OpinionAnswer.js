import React from 'react';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';
import AnswerBody from '../Answer/AnswerBody';

const OpinionAnswer = React.createClass({
  propTypes: {
    answer: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const answer = this.props.answer;
    if (!answer) {
      return null;
    }
    const classes = classNames({
      'opinion__answer': true,
      'bg-vip': answer.author && answer.author.vip,
    });
    return (
      <div className={classes} id="answer">
        {
          answer.title
          ? <p className="h4" style={{ marginTop: '0' }}>{answer.title}</p>
          : null
        }
        <AnswerBody answer={answer} />
      </div>
    );
  },

});

export default OpinionAnswer;
