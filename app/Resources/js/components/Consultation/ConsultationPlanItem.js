// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { NavItem } from 'react-bootstrap';
import type { ConsultationPlanItem_section } from './__generated__/ConsultationPlanItem_section.graphql';

type Props = {
  section: ConsultationPlanItem_section,
  level: number,
};

export class ConsultationPlanItem extends React.Component<Props> {
  render() {
    const { section, level } = this.props;
    return (
      <NavItem id={`opinion-type--${section.slug}`} className={`level--${level}`}>
        {section.title}
      </NavItem>
    );
  }
}

export default createFragmentContainer(ConsultationPlanItem, {
  section: graphql`
    fragment ConsultationPlanItem_section on Section {
      title
      slug
    }
  `,
});
