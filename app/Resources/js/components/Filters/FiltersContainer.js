// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';

type Props = {
  overlay: React.Element<*>,
  filterCount: ?number,
  type: 'event' | 'project',
};

export default class FiltersContainer extends React.Component<Props> {
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
        overlay={
          <Popover id="FiltersContainer" className="w-260">
            {overlay}
          </Popover>
        }
        className="w-25"
        id={`${type}-list-filters-d`}>
        <Button className="btn--outline btn-dark-gray" id={`${type}-button-filter`}>
          <i className="cap cap-filter-1 small mr-5" />
          <FormattedMessage id="link_filters" /> {this.renderFilterCount()}
          <i className="cap cap-triangle-down ml-5" />
        </Button>
      </OverlayTrigger>
    );
  }
}
