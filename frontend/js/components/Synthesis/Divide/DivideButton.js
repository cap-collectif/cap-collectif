import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

class DivideButton extends React.Component {
  static propTypes = {
    element: PropTypes.object,
    onModal: PropTypes.func,
  };

  click = () => {
    const { onModal } = this.props;
    onModal(true);
  };

  render() {
    return (
      <div className="element__action">
        <Button
          bsSize="large"
          type="button"
          className="element__action-divide"
          onClick={this.click.bind(null, this)}>
          <i className="cap cap-scissor-1" />
        </Button>
      </div>
    );
  }
}

export default DivideButton;
