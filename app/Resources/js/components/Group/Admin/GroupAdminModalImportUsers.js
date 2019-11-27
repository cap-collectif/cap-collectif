// @flow
import * as React from 'react';
import { injectIntl, FormattedMessage, type IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { submit, isSubmitting, isPristine } from 'redux-form';
import type { GroupAdminUsers_group } from '~relay/GroupAdminUsers_group.graphql';
import CloseButton from '../../Form/CloseButton';
import type { Dispatch, State } from '../../../types';
import GroupAdminImportUsersForm, { formName } from './GroupAdminImportUsersForm';

type Props = {
  show: boolean,
  onClose: () => void,
  group: GroupAdminUsers_group,
  dispatch: Dispatch,
  intl: IntlShape,
  submitting: boolean,
  pristine: boolean,
};

export class GroupAdminModalImportUsers extends React.Component<Props> {
  render() {
    const { show, onClose, group, dispatch, intl, submitting, pristine } = this.props;

    return (
      <Modal show={show} onHide={onClose} aria-labelledby="delete-modal-title-lg">
        <Modal.Header>
          <Modal.Title id="contained-modal-title-lg">
            {<FormattedMessage id="modal-add-members-via-file" />}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <GroupAdminImportUsersForm group={group} onClose={onClose} />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton label={intl.formatMessage({ id: 'global.cancel' })} onClose={onClose} />
          <Button
            disabled={pristine || submitting}
            bsStyle="primary"
            type="button"
            onClick={() => {
              dispatch(submit(formName));
              window.location.reload();
            }}>
            <FormattedMessage id='global.add' />
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = (state: State) => ({
  submitting: isSubmitting(formName)(state),
  pristine: isPristine(formName)(state),
});

export default connect(mapStateToProps)(injectIntl(GroupAdminModalImportUsers));
