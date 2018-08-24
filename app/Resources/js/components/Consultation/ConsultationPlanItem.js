// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { NavItem } from 'react-bootstrap';
import type { ConsultationPlanItem_section } from './__generated__/ConsultationPlanItem_section.graphql';
import config from "../../config";

type Props = {
  section: ConsultationPlanItem_section,
  level: number,
};

export class ConsultationPlanItem extends React.Component<Props> {

  render() {
    const { section, level } = this.props;

    return (
      <NavItem
        className={`level--${level}`}
        data-toggle="collapse"
        // aria-expanded="false" // {level === 0 ? 'false' : 'true'}
        data-target={`#collapseCslt${section.id}`}
        data-parent={level === 0 && "#myAccordion"}
        id={`nav-opinion-type--${section.slug}`}
        onClick={() => {
          if(config.canUseDOM) {
            const anchor = document.getElementById(`opinion-type--${section.slug}`);

            if(anchor) {
              anchor.scrollIntoView({block: "start", inline: "nearest", behavior: 'smooth'}); // OU juste true // { alignWithTop: true, behavior: 'smooth' }
            }
          }
        }}
      >
        {section.title}
      </NavItem>
    );
  };
}

export default createFragmentContainer(ConsultationPlanItem, {
  section: graphql`
    fragment ConsultationPlanItem_section on Section {
      title
      slug
      id
    }
  `,
});
