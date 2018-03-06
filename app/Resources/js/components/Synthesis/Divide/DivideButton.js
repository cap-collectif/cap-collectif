import React from 'react';
import { Button } from 'react-bootstrap';

const DivideButton = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
    onModal: React.PropTypes.func
  },

  click() {
    const { onModal } = this.props;
    onModal(true);
  },

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
});

export default DivideButton;
