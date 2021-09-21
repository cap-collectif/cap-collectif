// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { graphql, useFragment } from 'react-relay';
import { useAnalytics } from 'use-analytics';
import { connect } from 'react-redux';
import { isSubmitting, change, submit, isPristine, isInvalid } from 'redux-form';
import Button from '~ds/Button/Button';
import Modal from '~ds/Modal/Modal';
import Heading from '~ui/Primitives/Heading';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import ProposalForm, { formName } from '../Form/ProposalForm';
import type { ProposalCreateModal_proposalForm$key } from '~relay/ProposalCreateModal_proposalForm.graphql';
import type { Dispatch, GlobalState } from '~/types';
import colors from '~/styles/modules/colors';
import ProposalOtherPanelsModal from './ProposalOtherPanelsModal';

type Props = {|
  +proposalForm: ProposalCreateModal_proposalForm$key,
  +submitting: boolean,
  +pristine: boolean,
  +invalid: boolean,
  +dispatch: Dispatch,
  +onOpen: () => void,
  +onClose: () => void,
  +title: string,
  +show: boolean,
|};

const FRAGMENT = graphql`
  fragment ProposalCreateModal_proposalForm on ProposalForm {
    id
    contribuable
    step {
      title
      url
      project {
        title
      }
    }
    ...ProposalForm_proposalForm
    ...ProposalOtherPanelsModal_proposalForm
  }
`;

const STATE = {
  NORMAL: 'NORMAL',
  LEAVE: 'LEAVE',
  MAP: 'MAP',
  ERROR: 'ERROR',
};

const ProposalCreateModal = ({
  proposalForm: proposalFormFragment,
  submitting,
  pristine,
  dispatch,
  invalid,
  onOpen,
  onClose,
  title,
  show,
}: Props): React.Node => {
  const [modalState, setModalState] = React.useState<$Values<typeof STATE>>('NORMAL');
  const [errorCount, setErrorCount] = React.useState<number>(0);
  const intl = useIntl();
  const { track } = useAnalytics();
  const proposalForm = useFragment(FRAGMENT, proposalFormFragment);
  if (!show) return null;
  return (
    <Modal
      show={show}
      hideCloseButton={modalState === 'LEAVE'}
      hideOnEsc={modalState !== 'LEAVE'}
      hideOnClickOutside={false}
      onOpen={onOpen}
      onClose={() => {
        if (modalState !== 'LEAVE') setModalState('LEAVE');
        else onClose();
      }}
      fullPageScrollable
      ariaLabel={intl.formatMessage({ id: title })}>
      {() => (
        <>
          <Modal.Header pb={['', 8]} borderBottom={['', `1px solid ${colors.gray[200]}`]}>
            <Heading>{intl.formatMessage({ id: title })}</Heading>
          </Modal.Header>
          <AnimatePresence>
            <ProposalOtherPanelsModal
              proposalForm={proposalForm}
              errorCount={errorCount}
              onClose={onClose}
              modalState={modalState}
              resetModalState={() => {
                setModalState('NORMAL');
                setErrorCount(0);
              }}
            />
            {modalState === 'NORMAL' && (
              <motion.div
                key="normal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, display: 'block' }}
                exit={{ opacity: 0, display: 'none' }}>
                <Modal.Body>
                  <ProposalForm
                    onAddressEdit={() => setModalState('MAP')}
                    proposalForm={proposalForm}
                    proposal={null}
                    onSubmitSuccess={onClose}
                    onSubmitFailed={() => {
                      setErrorCount(errorCount + 1);
                      setModalState('ERROR');
                    }}
                  />
                </Modal.Body>
                <Modal.Footer
                  spacing={2}
                  pt={['', 4]}
                  borderTop={['', `1px solid ${colors.gray[200]}`]}>
                  <ButtonGroup>
                    <Button
                      id="confirm-proposal-create-as-draft"
                      variantSize="big"
                      variant="tertiary"
                      variantColor="primary"
                      isLoading={submitting}
                      disabled={pristine}
                      onClick={() => {
                        track('submit_draft_proposal_click', {
                          step_title: proposalForm.step?.title || '',
                          step_url: proposalForm.step?.url || '',
                          project_title: proposalForm.step?.project?.title || '',
                        });
                        dispatch(change(formName, 'draft', true));
                        setTimeout(() => {
                          // TODO find a better way
                          // We need to wait validation values to be updated with 'draft'
                          dispatch(submit(formName));
                        }, 200);
                      }}>
                      {intl.formatMessage({ id: 'global.save' })}
                    </Button>
                    <Button
                      variantSize="big"
                      variant="primary"
                      variantColor="primary"
                      id="confirm-proposal-create"
                      isLoading={submitting}
                      disabled={pristine || invalid}
                      onClick={() => {
                        track('submit_proposal_click', {
                          step_title: proposalForm.step?.title || '',
                          step_url: proposalForm.step?.url || '',
                          project_title: proposalForm.step?.project?.title || '',
                        });
                        dispatch(change(formName, 'draft', false));
                        setTimeout(() => {
                          // TODO find a better way
                          // We need to wait validation values to be updated with 'draft'
                          dispatch(submit(formName));
                        }, 200);
                      }}>
                      {intl.formatMessage({ id: 'global.publish' })}
                    </Button>
                  </ButtonGroup>
                </Modal.Footer>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </Modal>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  submitting: isSubmitting(formName)(state),
  pristine: isPristine(formName)(state),
  invalid: isInvalid(formName)(state),
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(ProposalCreateModal);
