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
          <Popover id="" className="w-260">
            {overlay}
          </Popover>
        }
        className="w-25"
        id={`${type}-list-filters-d`}>
        <Button
          className="btn--outline btn-dark-gray"
          id={`${type}-button-filter`}
          aria-describedby=""
          aria-expanded={this.state.isOpen}
          onClick={() => {
            this.setState({ isOpen: !this.state.isOpen });
            setTimeout(() => {
              $('.popover.bottom').each(function() {
                $(this).insertAfter(
                  $(this)
                    .parent()
                    .find('#event-filters'),
                );
              });
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
