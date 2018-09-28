// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import type { OpinionSourceContent_source } from './__generated__/OpinionSourceContent_source.graphql';

type Props = {
  source: OpinionSourceContent_source,
};

const OpinionSourceContent = ({ source }: Props) => (
  <p className="excerpt" dangerouslySetInnerHTML={{ __html: source.body }} />
);

export default createFragmentContainer(
  OpinionSourceContent,
  graphql`
    fragment OpinionSourceContent_source on Source {
      body
    }
  `,
);
