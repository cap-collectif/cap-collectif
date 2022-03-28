// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useAnalytics } from 'use-analytics';
import { useCallback } from 'react';
import { Field, isInvalid, isPristine } from 'redux-form';
import { useSelector, connect } from 'react-redux';
import { Heading, Button, Modal } from '@cap-collectif/ui';
import { formName } from '~/components/Debate/Page/MainActions/DebateStepPageVoteForm';
import component from '~/components/Form/Field';
import type { GlobalState, Dispatch } from '~/types';
import useLoadingMachine from '~/utils/hooks/useLoadingMachine';
import ResetCss from '~/utils/ResetCss';

type BeforeConnectProps = {|
  +show: boolean,
  +title: string,
  +onClose: () => void,
  +onSubmit: () => void | Promise<any>,
  +debateUrl: string,
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
  debateUrl,
}: Props): React.Node => {
  const viewerIsConfirmedByEmail: boolean = useSelector(
    (state: GlobalState) => state.user?.user?.isEmailConfirmed || false,
  );
  const { track } = useAnalytics();
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
  if (!show) return null;
  return (
    <Modal id="publish-argument" onClose={handleClose} show={show} ariaLabel={title}>
      <ResetCss>
        <Modal.Header>
          <Heading as="h4">{title}</Heading>
        </Modal.Header>
      </ResetCss>
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
            track('debate_argument_publish', {
              url: debateUrl,
            });
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
