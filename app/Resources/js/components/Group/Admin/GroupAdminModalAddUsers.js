// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { submit } from 'redux-form';
import GroupAdminUsers_group from './__generated__/GroupAdminUsers_group.graphql';
import GroupAdminAddUsersForm, { formName } from './GroupAdminAddUsersForm';
import CloseButton from '../../Form/CloseButton';
import type { Dispatch } from '../../../types';

type Props = {
  show: boolean,
  onClose: Function,
  group: GroupAdminUsers_group,
  dispatch: Dispatch,
};

export class GroupAdminModalAddUsers extends React.Component<Props> {
  handleSubmit = () => {};

  render() {
    const { show, onClose, group, dispatch } = this.props;

    return (
      <Modal show={show} onHide={onClose} aria-labelledby="delete-modal-title-lg">
        <Modal.Header>
          <Modal.Title id="contained-modal-title-lg">
            {<FormattedMessage id="group.admin.add_users" />}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <GroupAdminAddUsersForm group={group} handleSubmit={this.handleSubmit()} />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <Button bsStyle="primary" type="button" onClick={() => dispatch(submit(formName))}>
            {<FormattedMessage id="global.add" />}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = () => {
  return {};
};

export default connect(mapStateToProps)(GroupAdminModalAddUsers);
