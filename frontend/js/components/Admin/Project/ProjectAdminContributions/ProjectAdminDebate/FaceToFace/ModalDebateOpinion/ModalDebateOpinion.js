// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { Modal } from 'react-bootstrap';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import CloseButton from '~/components/Form/CloseButton';
import { type ForOrAgainstValue } from '~relay/DebateOpinion_opinion.graphql';
import type { Dispatch, GlobalState } from '~/types';
import component from '~/components/Form/Field';
import { type ModalDebateOpinion_opinion } from '~relay/ModalDebateOpinion_opinion.graphql';
import { type ModalDebateOpinion_debate } from '~relay/ModalDebateOpinion_debate.graphql';
import UserListField from '~/components/Admin/Field/UserListField';
import Button from '~ds/Button/Button';
import AddDebateOpinionMutation from '~/mutations/AddDebateOpinionMutation';
import UpdateDebateOpinionMutation from '~/mutations/UpdateDebateOpinionMutation';
import stripHtml from '~/utils/stripHtml';
import { formatConnectionPath } from '~/shared/utils/relay';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import Tag from '~ds/Tag/Tag';
import Heading from '~ui/Primitives/Heading';
import { FontWeight } from '~ui/Primitives/constants';
import { toast } from '~ds/Toast';
import { ModalContainer } from './ModalDebateOpinion.style';

type Props = {|
  ...ReduxFormFormProps,
  intl: IntlShape,
  isCreating?: boolean,
  opinion?: ModalDebateOpinion_opinion,
  debate: ModalDebateOpinion_debate,
  type: ForOrAgainstValue,
  onClose: () => void,
  show: boolean,
|};

type Values = {|
  author: ?{
    value: string,
    label: string,
  },
  title: string,
  body: string,
|};

const getTitle = (type: ForOrAgainstValue, isCreating?: boolean): string => {
  if (isCreating) {
    if (type === 'FOR') return 'add.opinion.for';
    if (type === 'AGAINST') return 'add.opinion.against';
  }

  if (!isCreating) {
    if (type === 'FOR') return 'edit.opinion.for';
    if (type === 'AGAINST') return 'edit.opinion.against';
  }

  return '';
};

const addDebateOpinion = (input, debateId, onClose, connections, intl) => {
  return AddDebateOpinionMutation.commit({
    input: {
      ...input,
      debateId,
    },
    connections,
    edgeTypeName: 'DebateOpinionConnection',
  })
    .then(response => {
      onClose();

      if (response.addDebateOpinion?.errorCode) {
        toast({
          variant: 'danger',
          content: intl.formatHTMLMessage({ id: 'global.error.server.form' }),
        });
      }
    })
    .catch(() => {
      onClose();
      toast({
        variant: 'danger',
        content: intl.formatHTMLMessage({ id: 'global.error.server.form' }),
      });
    });
};

const updateDebateOpinion = (input, debateOpinionId, onClose, intl) => {
  return UpdateDebateOpinionMutation.commit({
    input: {
      ...input,
      debateOpinionId,
    },
  })
    .then(response => {
      onClose();
      if (response.updateDebateOpinion?.errorCode) {
        toast({
          variant: 'danger',
          content: intl.formatHTMLMessage({ id: 'global.error.server.form' }),
        });
      }
    })
    .catch(() => {
      onClose();
      toast({
        variant: 'danger',
        content: intl.formatHTMLMessage({ id: 'global.error.server.form' }),
      });
    });
};

const onSubmit = (values: Values, dispatch: Dispatch, props: Props) => {
  const { debate, opinion, type, onClose, isCreating, intl } = props;
  const { title, author, body } = values;

  const input = {
    title,
    body,
    author: author?.value || '',
    type,
  };
  const connections = [formatConnectionPath(['client', debate.id], 'FaceToFace_opinions')];

  if (isCreating) return addDebateOpinion(input, debate.id, onClose, connections, intl);
  if (!isCreating && opinion) return updateDebateOpinion(input, opinion.id, onClose, intl);
};

const onValidate = (values: Values) => {
  const { author, title, body } = values;
  const errors = {};

  if (!author) errors.author = 'global.form.mandatory';
  if (!title) errors.title = 'global.form.mandatory';
  if (!body || !stripHtml(body)) errors.body = 'global.form.mandatory';

  return errors;
};

const formName = 'form-debate-opinion';

export const ModalDebateOpinion = ({ isCreating, onClose, type, handleSubmit }: Props) => (
  <ModalContainer
    show
    animation={false}
    onHide={onClose}
    bsSize="large"
    aria-labelledby="contained-modal-title-lg">
    <Modal.Header closeButton>
      <Heading as="h4" fontWeight={FontWeight.Semibold}>
        <FormattedMessage id={getTitle(type, isCreating)} />
      </Heading>
    </Modal.Header>
    <Modal.Body>
      <Tag variant={type === 'FOR' ? 'green' : 'red'} mb={4}>
        <FormattedMessage id={type === 'FOR' ? 'opinion.for' : 'opinion.against'} />
      </Tag>

      <form>
        <UserListField
          clearable={false}
          autoload
          name="author"
          id="author"
          label={<FormattedMessage id="admin.fields.opinion.author" />}
          selectFieldIsObject
        />

        <Field
          type="text"
          name="title"
          id="title"
          label={<FormattedMessage id="admin.fields.opinion.title" />}
          component={component}
        />

        <Field
          type="editor"
          name="body"
          id="body"
          label={<FormattedMessage id="global.review" />}
          component={component}
          maxLength="2000"
          withCharacterCounter
        />
      </form>
    </Modal.Body>
    <Modal.Footer>
      <ButtonGroup justifyContent="flex-end">
        <CloseButton onClose={onClose} label="editor.undo" />
        <Button
          variant="primary"
          variantColor="primary"
          variantSize="medium"
          onClick={handleSubmit}>
          <FormattedMessage id={isCreating ? 'global.create' : 'global.change'} />
        </Button>
      </ButtonGroup>
    </Modal.Footer>
  </ModalContainer>
);

const form = reduxForm({
  onSubmit,
  validate: onValidate,
  form: formName,
  enableReinitialize: true,
})(ModalDebateOpinion);

const mapStateToProps = (state: GlobalState, props: Props) => ({
  initialValues: {
    author: props.opinion?.author
      ? {
          value: props.opinion.author.id,
          label: props.opinion.author.username,
        }
      : null,
    body: props.opinion?.body || '',
    title: props.opinion?.title || '',
  },
});

const ModalDebateOpinionConnected = connect<any, any, _, _, _, _>(mapStateToProps)(
  injectIntl(form),
);

export default createFragmentContainer(ModalDebateOpinionConnected, {
  opinion: graphql`
    fragment ModalDebateOpinion_opinion on DebateOpinion {
      id
      type
      title
      body
      author {
        id
        username
      }
    }
  `,
  debate: graphql`
    fragment ModalDebateOpinion_debate on Debate {
      id
    }
  `,
});
