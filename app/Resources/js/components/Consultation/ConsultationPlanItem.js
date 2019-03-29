// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect } from 'react-redux';
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

  componentDidMount() {
    const { activeItems } = this.props;

    this.getActiveItems(activeItems);
  }

  componentDidUpdate(prevProps: Props) {
    const { activeItems } = this.props;

    if (prevProps.activeItems !== activeItems) {
      this.getActiveItems(activeItems);
    }
  }

  getActiveItems = (items: Array<string>) => {
    const { onCollapse, section } = this.props;
    const item = this.navItem.current;

    if (items.includes(section.id)) {
      onCollapse(true);
    } else {
      onCollapse(false);
    }

    if (items[items.length - 1] === section.id && item) {
      item.classList.add('active');
    } else if (item) {
      item.classList.remove('active');
    }
  };

  navItem: { current: null | React.ElementRef<'button'> };

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
      // we can't add innerRef with react-bootstrap Button
      <button className={`level--${level} btn-link`} ref={this.navItem} onClick={this.handleClick}>
        {section.title}
      </button>
    );
  }
}

const mapStateToProps = (state: State) => ({
  activeItems: state.project.selectedActiveItems,
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
