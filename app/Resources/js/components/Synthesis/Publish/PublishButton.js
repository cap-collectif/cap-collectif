import React from 'react';
import { Button } from 'react-bootstrap';

class PublishButton extends React.Component {
  static propTypes = {
    element: React.PropTypes.object,
    onModal: React.PropTypes.func,
  };

  click = () => {
    const { element, onModal } = this.props;
    onModal(true, element);
  };

  render() {
    return (
      <div className="element__action">
        <Button
          bsSize="large"
          type="button"
          className="element__action-publish"
          onClick={this.click.bind(null, this)}>
          <i className="cap cap-tag-1" />
        </Button>
      </div>
    );
  }
}

export default PublishButton;
