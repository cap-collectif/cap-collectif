// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';

type Props = {
  overlay: React.Element<*>,
  filterCount: ?number,
  type: 'event' | 'project',
};

type State = {
  isOpen: boolean,
};

export default class FiltersContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  componentDidUpdate() {
    setTimeout(() => {
      const queryAll = document.querySelectorAll('.popover.bottom');
      if (queryAll !== null) {
        queryAll.forEach(el => el.removeAttribute('role'));
      }
    }, 500);
  }

  renderFilterCount(): string {
    const { filterCount } = this.props;
    return filterCount && filterCount > 0 ? `(${filterCount})` : '';
  }

  render() {
    const { overlay, type } = this.props;
    return (
      <OverlayTrigger
        trigger="click"
        placement="bottom"
        aria-describedby=""
        overlay={
          <Popover id="FiltersContainer" className="w-260" rel="">
            {overlay}
          </Popover>
        }
        className="w-25"
        id={`${type}-list-filters-d`}>
        <Button
          id={`${type}-button-filter`}
          aria-describedby=""
          aria-expanded={this.state.isOpen}
          onClick={() => {
            this.setState({ isOpen: !this.state.isOpen });
            setTimeout(() => {
              const target = document.getElementById('event-filters');
              const queryAll = document.querySelectorAll('.popover.bottom');
              if (target !== null && queryAll !== null) {
                queryAll.forEach(el => target.after(el));
              }
            }, 500);
          }}>
          <i className="cap cap-filter-1 small mr-5" />
          <FormattedMessage id="link_filters" /> {this.renderFilterCount()}
          <i className="cap cap-triangle-down ml-5" />
        </Button>
      </OverlayTrigger>
    );
  }
}
