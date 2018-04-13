// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { store } from '../../../createRelayEnvironment';

type Props = {
  proposal: Object,
  stepId: string,
  showVotes?: boolean,
  showComments?: boolean,
};

export class ProposalPreviewFooter extends React.Component<Props> {
  static defaultProps = {
    showVotes: false,
    showComments: false,
  };

  render() {
    const { proposal, stepId, showVotes, showComments } = this.props;
    let votesCount = proposal.votesCountByStepId[stepId];

    console.log('render');
    // Hack to update votesCount while waiting GraphQL rewrite
    try {
      if (store && store._index > 0) {
        const key = `client:${proposal.id}:votes(first:50,step:"${stepId}")`;
        if (key in store._recordSource._records) {
          votesCount = store._recordSource._records[key].totalCount;
        }
      }
    } catch (e) {
      // console.log(e);
    }

    if (!showVotes && !showComments) {
      return null;
    }

    const countersClasses = {};

    if (showVotes && showComments) {
      countersClasses[`card__counters_multiple`] = true;
    }

    return (
      <div className={`card__counters ${classNames(countersClasses)}`}>
        {showComments && (
          <div className="card__counter card__counter-comments">
            <div className="card__counter__value">{proposal.commentsCount}</div>
            <div>
              <FormattedMessage
                id="comment.count_no_nb"
                values={{
                  count: proposal.commentsCount,
                }}
              />
            </div>
          </div>
        )}
        {showVotes && (
          <div className="card__counter card__counter-votes">
            <div className="card__counter__value">{votesCount}</div>
            <div>
              <FormattedMessage
                id="proposal.vote.count_no_nb"
                values={{
                  count: votesCount,
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default ProposalPreviewFooter;
