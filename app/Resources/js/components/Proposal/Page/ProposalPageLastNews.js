// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import AnswerBody from '../../Answer/AnswerBody';

export class ProposalPageLastNews extends React.Component<{
  proposal: Object,
  className?: string,
}> {
  static defaultProps = {
    className: '',
  };

  render() {
    const { proposal, className } = this.props;
    const { posts } = proposal;
    if (!posts || posts.length === 0) {
      return null;
    }
    const post = posts[posts.length - 1];
    const answer = { ...post, author: post.authors[0] };
    const classes = {
      'bg-vip': answer.author && answer.author.vip,
      block: true,
      className: false,
    };
    if (className) {
      classes[className] = true;
    }
    return (
      <div className={classNames(classes)}>
        {answer.title && <h2 className="h2">{answer.title}</h2>}
        <AnswerBody answer={answer} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    proposal: state.proposal.proposalsById[state.proposal.currentProposalId],
  };
};

export default connect(mapStateToProps)(ProposalPageLastNews);
