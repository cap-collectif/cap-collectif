// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect, type MapStateToProps } from 'react-redux';
import { NavItem } from 'react-bootstrap';
import type { ConsultationPlanItem_section } from './__generated__/ConsultationPlanItem_section.graphql';
import config from '../../config';
import type { State } from '../../types';

type Props = {
  section: ConsultationPlanItem_section,
  level: number,
  activeItems: Array<string>,
  onCollapse: (collapseItem: boolean) => {},
};

export class ConsultationPlanItem extends React.Component<Props> {
  componentDidUpdate(prevProps: Props) {
    const { activeItems, onCollapse, section } = this.props;

    if (prevProps.activeItems !== this.props.activeItems) {
      const item = document.getElementById(`nav-opinion-type--${section.slug}`);
      const parentItem = item && item.parentNode;

      if (activeItems.includes(section.id)) {
        onCollapse(true);
      } else {
        onCollapse(false);
      }

      if (parentItem) {
        if (activeItems.slice(-1).includes(section.id)) {
          parentItem.classList.add('active');
        } else {
          parentItem.classList.remove('active');
        }
      }
    }
  }

  render() {
    const { section, level } = this.props;

    return (
      <NavItem
        className={`level--${level}`}
        id={`nav-opinion-type--${section.slug}`}
        onClick={() => {
          if (config.canUseDOM) {
            const anchor = document.getElementById(`opinion-type--${section.slug}`);

            if (anchor) {
              anchor.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' });
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
