import React, { PropTypes } from 'react';
import classNames from 'classnames';
import AnswerBody from '../../Answer/AnswerBody';

const ProposalPageAnswer = React.createClass({
  propTypes: {
    answer: PropTypes.object,
    className: PropTypes.string,
  },

  getDefaultProps() {
    return {
      answer: null,
      className: '',
    };
  },

  render() {
    const { className } = this.props;
    const answer = this.props.answer;
    if (!answer) {
      return null;
    }
    const classes = {
      'bg-vip': answer.author && answer.author.vip,
      block: true,
      [className]: true,
    };
    return (
      <div className={classNames(classes)}>
        {answer.title &&
          <h2 className="h2">
            {answer.title}
          </h2>}
        <AnswerBody answer={answer} />
      </div>
    );
  },
});

export default ProposalPageAnswer;
