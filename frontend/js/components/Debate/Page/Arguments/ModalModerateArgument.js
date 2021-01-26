// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import styled, { type StyledComponent } from 'styled-components';
import { Field, reduxForm, submit } from 'redux-form';
import { Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FormattedMessage, type IntlShape, injectIntl } from 'react-intl';
import CloseButton from '~/components/Form/CloseButton';
import SubmitButton from '~/components/Form/SubmitButton';
import TrashDebateArgumentMutation from '~/mutations/TrashDebateArgumentMutation';
import TrashDebateAlternateArgumentMutation from '~/mutations/TrashDebateAlternateArgumentMutation';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import type { Dispatch } from '~/types';
import component from '~/components/Form/Field';
import toggle from '~/components/Form/Toggle';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';
import { toast } from '~ds/Toast';
import { mediaQueryMobile } from '~/utils/sizes';

const formName = 'form-moderate-argument';

export type ModerateArgument = {|
  id: string,
  state: 'PUBLISHED' | 'WAITING' | 'TRASHED',
  debateId: string,
  forOrAgainst: 'FOR' | 'AGAINST',
|};

type Props = {|
  ...ReduxFormFormProps,
  dispatch: Dispatch,
  intl: IntlShape,
  onClose: () => void,
  argument: ModerateArgument,
  relayConnection: string[],
  isAdmin?: boolean,
  isArgumentAlternate?: boolean,
|};

type Values = {|
  hideContent: boolean,
  reason: string,
|};

const ModalContainer: StyledComponent<{}, {}, typeof Modal> = styled(Modal)`
  .modal-dialog {
    width: 40%;
  }

  .modal-title {
    font-weight: 600;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    .modal-dialog {
      width: auto;
    }
  }
`;

const onSubmit = (values: Values, dispatch: Dispatch, props: Props) => {
  const { argument, intl, onClose, relayConnection, isArgumentAlternate, isAdmin } = props;
  const { reason, hideContent } = values;

  if (isArgumentAlternate) {
    return TrashDebateAlternateArgumentMutation.commit({
      input: {
        id: argument.id,
        trashedReason: reason,
        trashedStatus: hideContent ? 'INVISIBLE' : 'VISIBLE',
      },
      debateId: argument.debateId,
      forOrAgainst: argument.forOrAgainst,
    })
      .then(response => {
        onClose();
        if (response.trash?.errorCode) {
          mutationErrorToast(intl);
        }

        toast({
          variant: 'success',
          content: intl.formatMessage({
            id: 'the-argument-has-been-successfully-moved-to-the-trash',
          }),
        });
      })
      .catch(() => {
        mutationErrorToast(intl);
      });
  }

  return TrashDebateArgumentMutation.commit({
    input: {
      id: argument.id,
      trashedReason: reason,
      trashedStatus: hideContent ? 'INVISIBLE' : 'VISIBLE',
    },
    connections: relayConnection,
    debateId: argument.debateId,
    state: argument.state,
    isAdmin,
  })
    .then(response => {
      onClose();
      if (response.trash?.errorCode) {
        mutationErrorToast(intl);
      }

      toast({
        variant: 'success',
        content: intl.formatMessage({
          id: 'the-argument-has-been-successfully-moved-to-the-trash',
        }),
      });
    })
    .catch(() => {
      mutationErrorToast(intl);
    });
};

export const ModalModerateArgument = ({
  argument,
  onClose,
  intl,
  dispatch,
  handleSubmit,
}: Props) => (
  <ModalContainer
    animation={false}
    show={!!argument}
    onHide={onClose}
    bsSize="large"
    aria-labelledby="modal-title">
    <Modal.Header closeButton>
      <Modal.Title id="modal-title">
        <FormattedMessage id="moderate-argument" />
      </Modal.Title>
    </Modal.Header>

    <Modal.Body>
      <form id={formName} onSubmit={handleSubmit}>
        <Field
          bold
          component={toggle}
          name="hideContent"
          id="toggle-isVisible"
          normalize={val => !!val}
          label={
            <div>
              <FormattedMessage id="toggle.hide.content" />

              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="tooltip-description" className="text-left">
                    {intl.formatMessage({ id: 'tooltip.explanation.hide.content' })}
                  </Tooltip>
                }>
                <Icon
                  name={ICON_NAME.information}
                  size={12}
                  color={colors.iconGrayColor}
                  className="ml-5"
                />
              </OverlayTrigger>
            </div>
          }
        />

        <Field
          type="text"
          name="reason"
          label={
            <div>
              <FormattedMessage id="global.moderation.reason" />{' '}
              <span className="excerpt">
                <FormattedMessage id="global.optional" />
              </span>
            </div>
          }
          component={component}
          id="reason"
        />
      </form>
    </Modal.Body>

    <Modal.Footer>
      <CloseButton onClose={onClose} label="editor.undo" />
      <SubmitButton
        label="move.contribution.to.trash"
        onSubmit={() => dispatch(submit(formName))}
        bsStyle="danger"
      />
    </Modal.Footer>
  </ModalContainer>
);

const mapStateToProps = () => ({
  initialValues: {
    hideContent: false,
    reason: '',
  },
});

const ModalModerateArgumentForm = injectIntl(
  reduxForm({
    onSubmit,
    form: formName,
  })(ModalModerateArgument),
);

export default connect(mapStateToProps)(ModalModerateArgumentForm);
