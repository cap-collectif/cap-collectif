// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { Well } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import OpinionBodyDiffContent from './OpinionBodyDiffContent';
import FormattedText from '../../services/FormattedText';
import type { OpinionBody_opinion } from '~relay/OpinionBody_opinion.graphql';
import WYSIWYGRender from '../Form/WYSIWYGRender';

type Props = {
  opinion: OpinionBody_opinion,
};

export const OpinionBody = ({ opinion }: Props) => {
  const intl = useIntl();

  const ariaLabel = intl.formatMessage({ id: 'proposal-content' });

  if (opinion.__typename === 'Version') {
    const commentStripped = FormattedText.strip(opinion.comment);
    return (
      <div>
        {opinion.comment !== null && commentStripped && commentStripped.length ? (
          <div>
            <p className="control-label">{intl.formatMessage({ id: 'global.explanation' })}</p>
            <Well bsSize="small">
              <WYSIWYGRender value={opinion.comment} ariaLabel={ariaLabel} />
            </Well>
          </div>
        ) : null}
        <WYSIWYGRender className="diff mb-15" value={opinion.diff} ariaLabel={ariaLabel} />
      </div>
    );
  }

  return <OpinionBodyDiffContent opinion={opinion} ariaLabel={ariaLabel} />;
};

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
