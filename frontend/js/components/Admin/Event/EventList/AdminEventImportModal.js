// @flow
import * as React from 'react';
import { FormattedMessage, type IntlShape } from 'react-intl';
import { submit } from 'redux-form';
import { useDispatch } from 'react-redux';
import Button from '~ds/Button/Button';
import Modal from '~ds/Modal/Modal';
import Heading from '~ui/Primitives/Heading';
import AdminImportEventsForm, {
  formName,
  type SubmittedFormValue,
  type Props as AdminImportEventsFormProps,
} from '~/components/Event/Admin/AdminImportEventsForm';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import { toast } from '~ds/Toast';
import type { Dispatch } from '~/types';
import AddEventsMutation from '~/mutations/AddEventsMutation';

type Props = {|
  +intl: IntlShape,
|};

export const onSubmit = (
  values: SubmittedFormValue,
  dispatch: Dispatch,
  props: AdminImportEventsFormProps,
) => {
  const { onClose, reset, intl } = props;
  const variables = {
    input: {
      events: values.events.data,
      dryRun: false,
    },
  };

  return AddEventsMutation.commit(variables).then(() => {
    reset();
    onClose();
    toast({
      variant: 'success',
      content: intl.formatMessage({ id: 'events-successfully-imported' }),
    });
  });
};

const AdminEventImportModal = ({ intl }: Props) => {
  const dispatch = useDispatch();
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
            <AdminImportEventsForm onClose={hide} onSubmit={onSubmit} />
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

export default AdminEventImportModal;
