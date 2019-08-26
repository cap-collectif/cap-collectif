// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { Well } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import OpinionBodyDiffContent from './OpinionBodyDiffContent';
import FormattedText from '../../services/FormattedText';
import type { OpinionBody_opinion } from '~relay/OpinionBody_opinion.graphql';
import WYSIWYGRender from '../Form/WYSIWYGRender';

type Props = {
  opinion: OpinionBody_opinion,
};

class OpinionBody extends React.Component<Props> {
  render() {
    const { opinion } = this.props;

    if (opinion.__typename === 'Version') {
      const commentStripped = FormattedText.strip(opinion.comment);
      return (
        <div>
          {opinion.comment !== null && commentStripped && commentStripped.length ? (
            <div>
              <p className="control-label">
                <FormattedMessage id="opinion.version_comment" />
              </p>
              <Well bsSize="small">
                <WYSIWYGRender value={opinion.comment} />
              </Well>
            </div>
          ) : null}
          <WYSIWYGRender className="diff" value={opinion.diff} />
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
