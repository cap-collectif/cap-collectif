// @flow
import * as React from 'react';
import { Label } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import type { OpinionTypeLabel_section } from './__generated__/OpinionTypeLabel_section.graphql';

type Props = { type: OpinionTypeLabel_section };

export class OpinionTypeLabel extends React.Component<Props> {
  render() {
    const { type } = this.props;
    return <Label>{type.title}</Label>;
  }
}

export default createFragmentContainer(OpinionTypeLabel, {
  section: graphql`
    fragment OpinionTypeLabel_section on Section {
      title
    }
  `,
});
