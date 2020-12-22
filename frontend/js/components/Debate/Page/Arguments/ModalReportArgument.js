// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { isSubmitting, submit } from 'redux-form';
import { connect } from 'react-redux';
import { Modal } from 'react-bootstrap';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import CloseButton from '~/components/Form/CloseButton';
import SubmitButton from '~/components/Form/SubmitButton';
import ReportMutation from '~/mutations/ReportMutation';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import type { Dispatch, State } from '~/types';
import { toast } from '~ds/Toast';
import ReportForm, { getType, formName, type Values } from '~/components/Report/ReportForm';
import { mediaQueryMobile } from '~/utils/sizes';

type Props = {|
  ...ReduxFormFormProps,
  dispatch: Dispatch,
  intl: IntlShape,
  onClose: () => void,
  argumentId: string,
  isLoading: boolean,
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

const onSubmit = (
  values: Values,
  dispatch: Dispatch,
  argumentId: string,
  intl: IntlShape,
  onClose: () => void,
) => {
  const { body, status } = values;

  return ReportMutation.commit({
    input: {
      reportableId: argumentId,
      body,
      type: getType(status),
    },
  })
    .then(response => {
      onClose();
      if (response.report?.errorCode) {
        mutationErrorToast(intl);
      }

      toast({
        variant: 'success',
        content: intl.formatMessage({
          id: 'alert.success.report.argument',
        }),
      });
    })
    .catch(() => {
      mutationErrorToast(intl);
    });
};

export const ModalReportArgument = ({ argumentId, onClose, dispatch, isLoading, intl }: Props) => (
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
      <ReportForm onSubmit={values => onSubmit(values, dispatch, argumentId, intl, onClose)} />
    </Modal.Body>

    <Modal.Footer>
      <CloseButton onClose={onClose} label="editor.undo" />
      <SubmitButton
        label="global.report.submit"
        isSubmitting={isLoading}
        onSubmit={() => dispatch(submit(formName))}
        bsStyle="danger"
      />
    </Modal.Footer>
  </ModalContainer>
);

const mapStateToProps = (state: State, props) => ({
  isLoading: state.report.currentReportingModal === props.id && isSubmitting(formName)(state),
});

export default connect(mapStateToProps)(injectIntl(ModalReportArgument));
