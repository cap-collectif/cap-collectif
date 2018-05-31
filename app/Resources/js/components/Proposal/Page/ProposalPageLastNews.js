// @flow
import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import classNames from 'classnames';
import AnswerBody from '../../Answer/AnswerBody';
import type { State } from '../../../types';

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
    const post = posts[0];
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
        {answer.title && <h3 className="h3 proposal__last__news__title">{answer.title}</h3>}
        <AnswerBody answer={answer} />
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => {
  return {
    proposal:
      state.proposal.currentProposalId &&
      state.proposal.proposalsById[state.proposal.currentProposalId],
  };
};

// TODO create fragment query proposal news : title
export default connect(mapStateToProps)(ProposalPageLastNews);
