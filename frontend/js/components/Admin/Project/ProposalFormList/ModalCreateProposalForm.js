// @flow
import * as React from 'react';
import { ConnectionHandler } from 'relay-runtime';
import { type IntlShape } from 'react-intl';
import { submit, Field, reduxForm, reset } from 'redux-form';
import Button from '~ds/Button/Button';
import Modal from '~ds/Modal/Modal';
import Heading from '~ui/Primitives/Heading';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import component from '~/components/Form/Field';
import CreateProposalFormMutation from '~/mutations/CreateProposalFormMutation';
import type { QuestionnaireType } from '~relay/CreateQuestionnaireMutation.graphql';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import type { Dispatch } from '~/types';
import { toast } from '~ds/Toast';

const formName = 'form-create-proposalForm';

type PropsBefore = {|
  +intl: IntlShape,
  +viewerId: string,
  +isAdmin: boolean,
  +orderBy: string,
  +term: string,
  +show: boolean,
  +onClose: () => void,
|};

type Props = {|
  ...ReduxFormFormProps,
  ...PropsBefore,
|};

type FormValues = {|
  +title: string,
  +type: QuestionnaireType,
|};

const validate = (values: FormValues) => {
  const errors = {};

  if (!values.title || values.title.length <= 2) {
    errors.title = 'title';
  }

  if (values.title && values.title.length > 255) {
    errors.title = 'question.title.max_length';
  }

  return errors;
};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const input = {
    title: values.title,
  };

  return CreateProposalFormMutation.commit(
    {
      input,
      connections: [
        ConnectionHandler.getConnectionID(props.viewerId, 'ProposalForm_proposalForms', {
          query: props.term || null,
          affiliations: props.isAdmin ? null : ['OWNER'],
          orderBy: { field: 'CREATED_AT', direction: props.orderBy },
        }),
      ],
    },
    props.isAdmin,
  ).then(response => {
    if (!response.createProposalForm?.proposalForm) {
      return mutationErrorToast(props.intl);
    }

    toast({
      variant: 'success',
      content: props.intl.formatMessage({ id: 'proposal-form-successfully-created' }),
    });
    dispatch(reset(formName));
  });
};

const ModalCreateProposalForm = ({
  handleSubmit,
  submitting,
  dispatch,
  intl,
  show,
  onClose,
}: Props): React.Node => {
  return (
    <Modal
      ariaLabel={intl.formatMessage({ id: 'proposal_form.create.title' })}
      show={show}
      onClose={onClose}>
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'proposal_form.create.title' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <form
              onSubmit={e => {
                handleSubmit(e);
                hide();
              }}>
              <Field
                type="text"
                name="title"
                label={intl.formatMessage({ id: 'global.title' })}
                component={component}
              />
            </form>
          </Modal.Body>
          <Modal.Footer spacing={2}>
            <ButtonGroup>
              <Button
                variantSize="medium"
                variant="secondary"
                variantColor="hierarchy"
                onClick={hide}>
                {intl.formatMessage({ id: 'cancel' })}
              </Button>
              <Button
                type="submit"
                variantSize="medium"
                variant="primary"
                variantColor="primary"
                onClick={() => {
                  dispatch(submit(formName));
                  hide();
                }}
                isLoading={submitting}>
                {intl.formatMessage({ id: 'global.send' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

export default (reduxForm({
  onSubmit,
  validate,
  form: formName,
})(ModalCreateProposalForm): React.AbstractComponent<PropsBefore>);
