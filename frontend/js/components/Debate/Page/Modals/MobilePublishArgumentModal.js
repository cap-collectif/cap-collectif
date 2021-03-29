// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { Field, isInvalid, isPristine } from 'redux-form';
import { useSelector, connect } from 'react-redux';
import { formName } from '~/components/Debate/Page/MainActions/DebateStepPageVoteForm';
import component from '~/components/Form/Field';
import Button from '~ds/Button/Button';
import type { GlobalState, Dispatch } from '~/types';
import useLoadingMachine from '~/utils/hooks/useLoadingMachine';

type BeforeConnectProps = {|
  +show: boolean,
  +title: string,
  +onClose: () => void,
  +onSubmit: () => void | Promise<any>,
|};

type StateProps = {|
  +pristine: boolean,
  +invalid: boolean,
  +dispatch: Dispatch,
|};

type Props = {|
  ...BeforeConnectProps,
  ...StateProps,
|};

export const MobilePublishArgumentModal = ({
  show,
  onClose,
  onSubmit,
  pristine,
  invalid,
  title,
}: Props): React.Node => {
  const viewerIsConfirmedByEmail: boolean = useSelector(
    (state: GlobalState) => state.user?.user?.isEmailConfirmed || false,
  );
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
          {intl.formatMessage({
            id: viewerIsConfirmedByEmail ? 'global.publish' : 'global.validate',
          })}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  pristine: isPristine(formName)(state),
  invalid: isInvalid(formName)(state),
});

export default (connect<Props, BeforeConnectProps, _, _, _, _>(mapStateToProps)(
  MobilePublishArgumentModal,
): React.AbstractComponent<BeforeConnectProps>);
