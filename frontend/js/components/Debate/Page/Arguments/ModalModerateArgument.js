// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import styled, { type StyledComponent } from 'styled-components';
import { Field, reduxForm, submit } from 'redux-form';
import { Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FormattedMessage, type IntlShape, injectIntl } from 'react-intl';
import CloseButton from '~/components/Form/CloseButton';
import SubmitButton from '~/components/Form/SubmitButton';
import TrashMutation from '~/mutations/TrashMutation';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import type { Dispatch } from '~/types';
import component from '~/components/Form/Field';
import toggle from '~/components/Form/Toggle';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';
import { toast } from '~ds/Toast';
import { mediaQueryMobile } from '~/utils/sizes';

const formName = 'form-moderate-argument';

type Props = {|
  ...ReduxFormFormProps,
  dispatch: Dispatch,
  intl: IntlShape,
  onClose: () => void,
  argumentId: string,
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
  const { argumentId, intl, onClose } = props;
  const { reason, hideContent } = values;

  return TrashMutation.commit({
    input: {
      id: argumentId,
      trashedReason: reason,
      trashedStatus: hideContent ? 'INVISIBLE' : 'VISIBLE',
    },
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
  argumentId,
  onClose,
  intl,
  dispatch,
  handleSubmit,
}: Props) => (
  <ModalContainer
    animation={false}
    show={!!argumentId}
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
