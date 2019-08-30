// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import OpinionAppendix from './OpinionAppendix';
import type { OpinionAppendices_opinion } from '~relay/OpinionAppendices_opinion.graphql';

type Props = { opinion: OpinionAppendices_opinion };

class OpinionAppendices extends React.Component<Props> {
  render() {
    const { opinion } = this.props;
    if (!opinion || opinion.__typename === 'Version') {
      return null;
    }
    let appendices = [];
    if (opinion.__typename === 'Opinion') {
      appendices = opinion.appendices;
    }
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
  }
}

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
