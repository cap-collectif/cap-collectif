// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import OpinionSourceButtons from './OpinionSourceButtons';
import type { OpinionSourceFooter_source } from './__generated__/OpinionSourceFooter_source.graphql';

type Props = {
  source: OpinionSourceFooter_source,
};

const OpinionSourceFooter = ({ source }: Props) => {
  return (
    <div className="opinion__votes excerpt small">
      <OpinionSourceButtons source={source} />
    </div>
  );
};

export default createFragmentContainer(
  OpinionSourceFooter,
  graphql`
    fragment OpinionSourceFooter_source on Source {
      ...OpinionSourceButtons_source
    }
  `,
);
