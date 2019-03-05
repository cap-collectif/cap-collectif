// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Overlay, Popover } from 'react-bootstrap';

type Props = {
  overlay: React.Element<*>,
  filterCount: ?number,
  type: 'event' | 'project',
};

type State = {
  show: boolean,
};

export default class FiltersContainer extends React.Component<Props, State> {
  target: any;

  constructor(props: Props) {
    super(props);

    this.target = React.createRef();

    this.state = {
      show: false,
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

  handleToggle = () => {
    this.setState({ show: !this.state.show });
  };

  render() {
    const { overlay, type } = this.props;
    return (
      <div className="position-relative">
        <Button
          id={`${type}-button-filter`}
          ref={this.target}
          aria-expanded={this.state.show}
          onClick={this.handleToggle}>
          <i className="cap cap-filter-1 small mr-5" />
          <FormattedMessage id="link_filters" /> {this.renderFilterCount()}
          <i className="cap cap-triangle-down ml-5" />
        </Button>
        <Overlay
          placement="bottom"
          container={this}
          show={this.state.show}
          target={this.target.current}
          id={`${type}-list-filters-d`}>
          <Popover id="FiltersContainer" className="w-260" rel="">
            {overlay}
          </Popover>
        </Overlay>
      </div>
    );
  }
}
