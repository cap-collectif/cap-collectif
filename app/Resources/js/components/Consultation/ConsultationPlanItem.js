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
  constructor(props: Props) {
    super(props);

    this.navItem = React.createRef();
  }

  componentDidUpdate(prevProps: Props) {
    const { activeItems, onCollapse, section } = this.props;

    console.warn(activeItems);

    if (prevProps.activeItems !== this.props.activeItems) {
      // We can't pass innerRef to NavItem component and we need to recover <li>
      // const itemLink = this.navItem.current && this.navItem.current.parentNode;
      // const item = itemLink && itemLink.parentNode;
      const item = this.navItem.current;

      if (activeItems.includes(section.id)) {
        onCollapse(true);
      } else {
        onCollapse(false);
      }

      if (activeItems.slice(-1).includes(section.id) && item) {
        // $FlowFixMe
        item.classList.add('active');
      } else if (item) {
        // $FlowFixMe
        item.classList.remove('active');
      }
    }
  }

  navItem: { current: null | React.ElementRef<'span'> };

  handleClick = () => {
    const { section } = this.props;

    if (config.canUseDOM) {
      const anchor = document.getElementById(`opinion-type--${section.slug}`);

      if (anchor) {
        anchor.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' });
      }
    }
  };

  render() {
    const { section, level } = this.props;

    return (
      <a className={`level--${level}`} ref={this.navItem} onClick={this.handleClick}>
        {section.title}
      </a>
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
