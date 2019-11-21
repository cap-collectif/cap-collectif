// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import OpinionAppendix from './OpinionAppendix';
import type { OpinionAppendices_opinion } from '~relay/OpinionAppendices_opinion.graphql';

type Props = { opinion: OpinionAppendices_opinion };

const getAppendices = (opinion: OpinionAppendices_opinion) => {
  if (opinion.__typename === 'Opinion') {
    return opinion.appendices;
  }
  return [];
};

const OpinionAppendices = (props: Props) => {
  const { opinion } = props;

  if (!opinion || opinion.__typename === 'Version') {
    return null;
  }

  const appendices = getAppendices(opinion);

  if (!appendices || appendices.length === 0) {
    return null;
  }
  return (
    <div className="opinion__description">
      {appendices.map((appendix, index) => {
        if (appendix && appendix.body) {
          return <OpinionAppendix key={index} appendix={appendix} />;
        }
      })}
    </div>
  );
};

export default createFragmentContainer(OpinionAppendices, {
  opinion: graphql`
    fragment OpinionAppendices_opinion on OpinionOrVersion {
      __typename
      ... on Opinion {
        appendices {
          body
          ...OpinionAppendix_appendix
        }
      }
    }
  `,
});
