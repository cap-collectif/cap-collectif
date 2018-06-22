import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import UpdateModal from './UpdateModal';

class UpdateButton extends React.Component {
  static propTypes = {
    synthesis: PropTypes.object.isRequired,
    element: PropTypes.object.isRequired,
  };

  state = {
    showUpdateModal: false,
  };

  toggleUpdateModal = () => {
    this.setState({
      showUpdateModal: !this.state.showUpdateModal,
    });
  };

  showUpdateModal = () => {
    this.toggleUpdateModal(true);
  };

  render() {
    const { element, synthesis } = this.props;
    return (
      <div className="element__action">
        <Button
          bsSize="large"
          type="button"
          className="element__action-publish"
          onClick={this.showUpdateModal.bind(null, this)}>
          <i className="cap cap-pencil-1" />
        </Button>
        <UpdateModal
          synthesis={synthesis}
          element={element}
          show={this.state.showUpdateModal}
          toggle={this.toggleUpdateModal}
        />
      </div>
    );
  }
}

export default UpdateButton;
