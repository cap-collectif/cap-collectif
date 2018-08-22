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
  componentDidUpdate() {
    const { section } = this.props;

    console.warn(section.slug);
    console.error(`opinion-type--${section.slug}`);

    if(config.canUseDOM) {
      // const scrollZone = document.getElementById('testScroll');
      if(section.slug) {

        console.log(document.getElementById(`opinion-type--${section.slug}`));
        // const getBoundingItem = item && item.getBoundingClientRect();
      }
    }

    // if top == top fenetre - 60, add classname active sinon remove

    // if(scrollZone) {
      // $('testScroll').scrollspy({ target: `#opinion-type--${section.slug}` })
    // }
  }

  render() {
    const { section, level } = this.props;

    return (
      <NavItem
        className={`level--${level}`}
        data-toggle="collapse"
        aria-expanded="false" // {level === 0 ? 'false' : 'true'}
        data-target={`#collapseCslt${section.id}`}
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
