// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { Well } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import OpinionBodyDiffContent from './OpinionBodyDiffContent';
import FormattedText from '../../services/FormattedText';
import type { OpinionBody_opinion } from './__generated__/OpinionBody_opinion.graphql';

type Props = {
  opinion: OpinionBody_opinion,
};

class OpinionBody extends React.Component<Props> {
  render() {
    const { opinion } = this.props;

    if (opinion.__typename === 'Version') {
      return (
        <div>
          {opinion.comment !== null && FormattedText.strip(opinion.comment).length ? (
            <div>
              <p className="control-label">
                <FormattedMessage id="opinion.version_comment" />
              </p>
              <Well bsSize="small">
                <div dangerouslySetInnerHTML={{ __html: opinion.comment }} />
              </Well>
            </div>
          ) : null}
          <div className="diff" dangerouslySetInnerHTML={{ __html: opinion.diff }} />
        </div>
      );
    }

    // $FlowFixMe
    return <OpinionBodyDiffContent opinion={opinion} />;
  }
}

export default createFragmentContainer(OpinionBody, {
  opinion: graphql`
    fragment OpinionBody_opinion on OpinionOrVersion {
      ... on Version {
        __typename
        comment
        diff
      }
      ...OpinionBodyDiffContent_opinion
    }
  `,
});
