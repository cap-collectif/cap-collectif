// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import type { OpinionSourceContent_source } from '~relay/OpinionSourceContent_source.graphql';
import WYSIWYGRender from '../../Form/WYSIWYGRender';

type Props = {
  source: OpinionSourceContent_source,
};

const OpinionSourceContent = ({ source }: Props) => (
  <div className="opinion__text float-left excerpt">
    <WYSIWYGRender className="excerpt" value={source.body} />
  </div>
);

export default createFragmentContainer(OpinionSourceContent, {
  source: graphql`
    fragment OpinionSourceContent_source on Source {
      body
    }
  `,
});
