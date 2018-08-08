// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import LoginOverlay from '../../Utils/LoginOverlay';
import UnpublishedTooltip from '../../Publishable/UnpublishedTooltip';
import type { OpinionSourceVoteButton_source } from './__generated__/OpinionSourceVoteButton_source.graphql';

type Props = {
  disabled: boolean,
  hasVoted: boolean,
  onClick: Function,
  source: OpinionSourceVoteButton_source,
};

export class OpinionSourceVoteButton extends React.Component<Props> {
  target: null;

  render() {
    const { source, disabled, hasVoted, onClick } = this.props;
    return (
      <LoginOverlay>
        <Button
          ref={button => {
            this.target = button;
          }}
          disabled={disabled}
          bsStyle={hasVoted ? 'danger' : 'success'}
          className={`source__btn--vote${hasVoted ? '' : ' btn--outline'}`}
          bsSize="xsmall"
          onClick={onClick}>
          {hasVoted ? (
            <FormattedMessage id="vote.cancel" />
          ) : (
            <span>
              <i className="cap cap-hand-like-2" /> {<FormattedMessage id="vote.ok" />}
            </span>
          )}
          {/* $FlowFixMe */}
          <UnpublishedTooltip
            target={() => ReactDOM.findDOMNode(this.target)}
            publishable={source.viewerVote || null}
          />
        </Button>
      </LoginOverlay>
    );
  }
}

export default createFragmentContainer(
  OpinionSourceVoteButton,
  graphql`
    fragment OpinionSourceVoteButton_source on Source
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      contribuable
      viewerHasVote @include(if: $isAuthenticated)
      viewerVote @include(if: $isAuthenticated) {
        id
        ...UnpublishedTooltip_publishable
      }
    }
  `,
);
