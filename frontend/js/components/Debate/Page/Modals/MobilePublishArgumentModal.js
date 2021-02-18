// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { Field, isInvalid, isPristine, reset } from 'redux-form';
import { connect } from 'react-redux';
import { formName } from '~/components/Debate/Page/MainActions/DebateStepPageVoteAndShare';
import component from '~/components/Form/Field';
import Button from '~ds/Button/Button';
import type { Dispatch, GlobalState } from '~/types';
import useLoadingMachine from '~/utils/hooks/useLoadingMachine';

type ReduxProps = {|
  +resetForm: () => void,
  +pristine: boolean,
  +invalid: boolean,
|};

type Props = {|
  ...ReduxProps,
  +show: boolean,
  +title: string,
  +onClose: () => void,
  +onSubmit: () => Promise<void>,
|};

export const MobilePublishArgumentModal = ({
  show,
  onClose,
  resetForm,
  onSubmit,
  pristine,
  invalid,
  title,
}: Props) => {
  const intl = useIntl();
  const { startLoading, stopLoading, isLoading } = useLoadingMachine();
  const focusInputRef = useCallback(node => {
    if (node !== null) {
      const $input = node.querySelector('[name="body"]');
      if ($input) {
        $input.focus();
      }
    }
  }, []);
  const handleClose = () => {
    if (isLoading) return;
    resetForm();
    if (onClose) {
      onClose();
    }
  };
  return (
    <Modal bsSize="large" id="publish-argument" onHide={handleClose} show={show}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form ref={focusInputRef} id={formName}>
          <Field
            name="body"
            component={component}
            autoFocus
            type="textarea"
            id="body"
            minLength="1"
            autoComplete="off"
          />
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          disabled={isLoading || invalid || pristine}
          onClick={async () => {
            try {
              startLoading();
              await onSubmit();
              stopLoading();
            } catch (e) {
              stopLoading();
            }
          }}
          variant="primary"
          variantSize="big"
          width="100%"
          isLoading={isLoading}
          justifyContent="center">
          {intl.formatMessage({ id: 'global.publish' })}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  pristine: isPristine(formName)(state),
  invalid: isInvalid(formName)(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  resetForm: () => dispatch(reset(formName)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MobilePublishArgumentModal);
