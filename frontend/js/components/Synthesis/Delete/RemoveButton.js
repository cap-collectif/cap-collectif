import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

class RemoveButton extends React.Component {
  static propTypes = {
    element: PropTypes.object,
    onRemove: PropTypes.func,
  };

  click = () => {
    const { element, onRemove } = this.props;
    onRemove(element);
  };

  render() {
    return (
      <div className="element__action">
        <Button
          bsSize="large"
          type="button"
          className="element__action-remove"
          onClick={this.click.bind(null, this)}>
          <i className="cap cap-delete-1-1" />
        </Button>
      </div>
    );
  }
}

export default RemoveButton;
