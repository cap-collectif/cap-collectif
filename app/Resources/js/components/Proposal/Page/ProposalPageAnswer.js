import React from 'react';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';
import AnswerBody from '../../Answer/AnswerBody';

const ProposalPageAnswer = React.createClass({
  propTypes: {
    answer: React.PropTypes.object.isRequired,
    className: React.PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      className: '',
    };
  },

  render() {
    const answer = this.props.answer;
    if (!answer) {
      return null;
    }
    const classes = {
      'bg-vip': answer.author && answer.author.vip,
      [this.props.className]: true,
    };
    return (
      <div className={classNames(classes)}>
        <div className="block">
          {
            answer.title
            ? <h2 className="h2">{answer.title}</h2>
            : null
          }
          <AnswerBody answer={answer} />
        </div>
      </div>
    );
  },

});

export default ProposalPageAnswer;
