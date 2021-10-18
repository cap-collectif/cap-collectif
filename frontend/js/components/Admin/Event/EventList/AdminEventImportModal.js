// @flow
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { reduxForm, submit } from 'redux-form';
import Button from '~ds/Button/Button';
import Modal from '~ds/Modal/Modal';
import Heading from '~ui/Primitives/Heading';
import AdminImportEventsForm, { formName } from '~/components/Event/Admin/AdminImportEventsForm';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';

const AdminEventImportModal = ({ submitting, invalid, pristine }) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  return (
    <Modal
      ariaLabel={intl.formatMessage({ id: 'modal-add-events-via-file' })}
      disclosure={
        <Button
          id="AdminImportEventsButton-import"
          variant="secondary"
          variantColor="hierarchy"
          variantSize="small"
          mr={6}>
          {intl.formatMessage({ id: 'import' })}
        </Button>
      }>
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading id="contained-modal-title-lg">
              <FormattedMessage id="modal-add-events-via-file" />
            </Heading>
          </Modal.Header>
          <Modal.Body>
            <p>
              <FormattedMessage id="import-events-helptext" />
            </p>
            <AdminImportEventsForm onClose={() => hide()} />
          </Modal.Body>
          <Modal.Footer>
            <ButtonGroup>
              <Button
                variantSize="medium"
                variant="secondary"
                variantColor="hierarchy"
                onClick={hide}>
                {intl.formatMessage({ id: 'cancel' })}
              </Button>
              <Button
                id="AdminImportEventsButton-submit"
                variantSize="medium"
                variant="primary"
                variantColor="primary"
                disabled={submitting || invalid || pristine}
                onClick={() => dispatch(submit(formName))}>
                {intl.formatMessage({ id: 'import' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

export default reduxForm({
  form: formName,
})(AdminEventImportModal);
