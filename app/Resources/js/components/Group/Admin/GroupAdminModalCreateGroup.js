// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Modal } from 'react-bootstrap';

type Props = {
  show: boolean,
  onClose: Function,
};

export class GroupAdminModalCreateGroup extends React.Component<Props> {
  render() {
    const { show, onClose } = this.props;

    return (
      <Modal show={show} onHide={onClose} aria-labelledby="delete-modal-title-lg">
        <Modal.Header>
          <Modal.Title id="contained-modal-title-lg">
            {<FormattedMessage id="group.admin.add_users" />}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body />
        <Modal.Footer />
      </Modal>
    );
  }
}

const mapStateToProps = () => {
  return {};
};

export default connect(mapStateToProps)(GroupAdminModalCreateGroup);
