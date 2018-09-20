// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect, type MapStateToProps } from 'react-redux';
import { NavItem } from 'react-bootstrap';
import type { ConsultationPlanItem_section } from './__generated__/ConsultationPlanItem_section.graphql';
import config from '../../config';

type Props = {
  section: ConsultationPlanItem_section,
  level: number,
  group: number,
  activeItems: Array<string>,
  onCollapse: (collapseItem: boolean) => {},
};

export class ConsultationPlanItem extends React.Component<Props> {
  componentDidUpdate(prevProps) {
    const { activeItems, group, onCollapse, section } = this.props;

    if(prevProps.activeItems !== this.props.activeItems) {
      if(this.props.activeItems.includes(section.id)) {
        onCollapse(true);
      } else {
        onCollapse(false);
      }

      if(this.props.activeItems.slice(-1).includes(section.id)) {
        console.log(section.id);
        // add class active à son parent
      }
    }
  }

  render() {
    const { section, level, activeItem, group } = this.props;

    return (
      <NavItem
        className={`level--${level}`}
        data-toggle="collapse"
        data-target={`#collapseCslt${section.id}`}
        data-parent={level === 0 && '#myAccordion'}
        id={`nav-opinion-type--${section.slug}`}
        onClick={() => {
          if (config.canUseDOM) {
            const anchor = document.getElementById(`opinion-type--${section.slug}`);

            if (anchor) {
              anchor.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' }); // OU juste true // { alignWithTop: true, behavior: 'smooth' }
            }
          }
        }}>
        {section.title}
      </NavItem>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  activeItems: state.project.selectedActiveItem,
});

const container = connect(mapStateToProps)(ConsultationPlanItem);

export default createFragmentContainer(container, {
  section: graphql`
    fragment ConsultationPlanItem_section on Section {
      title
      slug
      id
    }
  `,
});
