// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import type { OpinionSourceContent_source } from '~relay/OpinionSourceContent_source.graphql';
import WYSIWYGRender from '../../Form/WYSIWYGRender';

type Props = {
  source: OpinionSourceContent_source,
};

const OpinionSourceContent = ({ source }: Props) => (
  <p
    className="opinion__text excerpt"
    style={{
      overflow: 'hidden',
      float: 'left',
      width: '100%',
      wordWrap: 'break-word',
    }}>
    <WYSIWYGRender className="excerpt" value={source.body} />
  </p>
);

export default createFragmentContainer(OpinionSourceContent, {
  source: graphql`
    fragment OpinionSourceContent_source on Source {
      body
    }
  `,
});
