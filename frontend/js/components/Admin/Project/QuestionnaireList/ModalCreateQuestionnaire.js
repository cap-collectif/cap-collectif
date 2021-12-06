// @flow
import * as React from 'react';
import { ConnectionHandler } from 'relay-runtime';
import { ToggleButton } from 'react-bootstrap';
import { type IntlShape } from 'react-intl';
import { change, submit, Field, reduxForm, reset } from 'redux-form';
import Button from '~ds/Button/Button';
import Modal from '~ds/Modal/Modal';
import Heading from '~ui/Primitives/Heading';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import component from '~/components/Form/Field';
import CreateQuestionnaireMutation from '~/mutations/CreateQuestionnaireMutation';
import type { QuestionnaireType } from '~relay/CreateQuestionnaireMutation.graphql';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import type { Dispatch } from '~/types';
import { toast } from '~ds/Toast';
import { type Viewer } from './QuestionnaireListPage';

const formName = 'form-create-questionnaire';

type PropsBefore = {|
  +intl: IntlShape,
  +isAdmin: boolean,
  +orderBy: string,
  +term: string,
  +show: boolean,
  +onClose: () => void,
  +viewer: Viewer,
  +hasQuestionnaire: boolean,
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

  if (!values.type) {
    errors.type = 'type';
  }

  return errors;
};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const input = {
    type: values.type,
    title: values.title,
  };

  return CreateQuestionnaireMutation.commit(
    {
      input,
      connections: [
        ConnectionHandler.getConnectionID(props.viewer.id, 'QuestionnaireList_questionnaires', {
          query: props.term || null,
          affiliations: props.isAdmin ? null : ['OWNER'],
          orderBy: { field: 'CREATED_AT', direction: props.orderBy },
        }),
      ],
    },
    props.isAdmin,
    props.viewer,
    props.hasQuestionnaire,
  ).then(response => {
    if (!response.createQuestionnaire?.questionnaire) {
      return mutationErrorToast(props.intl);
    }

    const adminUrl = response.createQuestionnaire?.questionnaire?.adminUrl;
    if (!props.hasQuestionnaire && adminUrl) {
      dispatch(reset(formName));
      window.location.href = adminUrl;
    }

    toast({
      variant: 'success',
      content: props.intl.formatMessage({ id: 'questionnaire-successfully-created' }),
    });
    dispatch(reset(formName));
  });
};

const ModalCreateQuestionnaire = ({
  handleSubmit,
  submitting,
  dispatch,
  intl,
  show,
  onClose,
}: Props): React.Node => (
  <Modal
    ariaLabel={intl.formatMessage({ id: 'create-questionnaire' })}
    show={show}
    onClose={onClose}>
    {({ hide }) => (
      <>
        <Modal.Header>
          <Heading>{intl.formatMessage({ id: 'global.questionnaire' })}</Heading>
        </Modal.Header>
        <Modal.Body>
          <form
            onSubmit={e => {
              handleSubmit(e);
              hide();
            }}>
            <Field type="radio-buttons" id="questionnaire_type" name="type" component={component}>
              <ToggleButton
                id="type-voting"
                onClick={() => dispatch(change(formName, 'type', 'VOTING'))}
                value="VOTING">
                {intl.formatMessage({ id: 'voting' })}
              </ToggleButton>
              <ToggleButton
                id="type-questionnaire"
                onClick={() => dispatch(change(formName, 'type', 'QUESTIONNAIRE'))}
                value="QUESTIONNAIRE">
                {intl.formatMessage({ id: 'global.questionnaire' })}
              </ToggleButton>
            </Field>

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
              isLoading={submitting}
              id="confirm-questionnaire-create">
              {intl.formatMessage({ id: 'global.send' })}
            </Button>
          </ButtonGroup>
        </Modal.Footer>
      </>
    )}
  </Modal>
);

export default (reduxForm({
  onSubmit,
  validate,
  form: formName,
  initialValues: {
    type: 'QUESTIONNAIRE',
  },
})(ModalCreateQuestionnaire): React.AbstractComponent<PropsBefore>);
