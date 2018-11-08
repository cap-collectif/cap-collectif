// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import type { OpinionSourceContent_source } from './__generated__/OpinionSourceContent_source.graphql';
import WYSIWYGRender from '../../Form/WYSIWYGRender';

type Props = {
  source: OpinionSourceContent_source,
};

const OpinionSourceContent = ({ source }: Props) => (
  <WYSIWYGRender className="excerpt" value={source.body} />
);

export default createFragmentContainer(
  OpinionSourceContent,
  graphql`
    fragment OpinionSourceContent_source on Source {
      body
    }
  `,
);
