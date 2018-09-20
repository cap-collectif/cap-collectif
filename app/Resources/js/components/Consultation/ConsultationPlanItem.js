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
  activeItem: number,
  onCollapse: (collapseItem: boolean) => {},
};

export class ConsultationPlanItem extends React.Component<Props> {
  componentDidUpdate(prevProps) {
    const { activeItem, group, onCollapse } = this.props;

    console.warn(activeItem, group);

    if(prevProps.activeItem !== this.props.activeItem) {
      if(group === Number(String(this.props.activeItem).slice(0, (this.props.level+1)))) {
        onCollapse(true);
        console.log(activeItem, group);
        // console.warn(group, Number(String(this.props.activeItem).slice(0, (this.props.level+1))));
      } else {
        onCollapse(false);
      }

      if(group === activeItem) {
        // console.log(section.id);
        // $(`#nav-opinion-type--${section.slug}`).collapse({ toggle: true });
      }

      // console.warn(activeItem, group);
      // onCollapse(group === activeItem);
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
  activeItem: state.project.selectedActiveItem,
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
