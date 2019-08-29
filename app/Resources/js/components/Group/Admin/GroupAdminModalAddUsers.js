// @flow
import * as React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import type { IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { submit } from 'redux-form';
import type { GroupAdminUsers_group } from '~relay/GroupAdminUsers_group.graphql';
import GroupAdminAddUsersForm, { formName } from './GroupAdminAddUsersForm';
import CloseButton from '../../Form/CloseButton';
import type { Dispatch } from '../../../types';

type Props = {
  show: boolean,
  onClose: Function,
  group: GroupAdminUsers_group,
  dispatch: Dispatch,
  intl: IntlShape,
};

export class GroupAdminModalAddUsers extends React.Component<Props> {
  render() {
    const { show, onClose, group, dispatch, intl } = this.props;

    return (
      <Modal show={show} onHide={onClose} aria-labelledby="delete-modal-title-lg">
        <Modal.Header>
          <Modal.Title id="contained-modal-title-lg">
            {<FormattedMessage id="group-admin-add-members" />}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <GroupAdminAddUsersForm group={group} onClose={onClose} />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton label={intl.formatMessage({ id: 'global.close' })} onClose={onClose} />
          <Button bsStyle="primary" type="button" onClick={() => dispatch(submit(formName))}>
            {<FormattedMessage id="global.add" />}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect()(injectIntl(GroupAdminModalAddUsers));
