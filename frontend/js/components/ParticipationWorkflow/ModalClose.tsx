import React from 'react';
import {
    Button,
    CapUIIcon,
    CapUIIconSize,
    CapUIModalSize,
    Icon,
    Modal,
    Heading,
} from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import ResetCss from '~/utils/ResetCss';
import { useParticipationWorkflow } from '~/components/ParticipationWorkflow/ParticipationWorkflowContext';
import useIsMobile from '~/utils/hooks/useIsMobile'

type Props = {
    onClose: () => void,
};

const ModalClose: React.FC<Props> = ({ onClose }) => {
    const intl = useIntl();
    const { contributionUrl } = useParticipationWorkflow();
    const isMobile = useIsMobile()

    return (
        <>
            <Modal
                alwaysOpenInPortal
                size={CapUIModalSize.Lg}
                ariaLabel={intl.formatMessage({ id: 'confirmation-of-withdrawal' })}
                disclosure={
                  <Button
                    onClick={onClose}
                    variant="tertiary"
                    aria-label={intl.formatMessage({ id: 'close.participation-workflow.give-up.modal' })}
                  >
                     <Icon
                        aria-hidden={true}
                         name={CapUIIcon.CrossO}
                         size={CapUIIconSize.Md}
                         color="gray.900"
                     />
                  </Button>
                }>
                {({ hide }) => (
                    <>
                        <ResetCss>
                            <Modal.Header closeIconLabel={intl.formatMessage({ id: 'global.close' })}>
                                <Heading fontWeight={600}>{intl.formatMessage({ id: 'are-you-sure-you-want-to-leave' })}</Heading>
                            </Modal.Header>
                        </ResetCss>
                        <Modal.Body>
                            {intl.formatMessage({ id: 'participation-close-modal-body' })}
                        </Modal.Body>
                        <Modal.Footer direction={isMobile ? 'column' : 'row'}>
                            <Button variantSize="big" variant="tertiary" as="a" href={contributionUrl} color="gray.500">
                                {intl.formatMessage({ id: 'give-up' })}
                            </Button>
                            <Button variantSize="big" onClick={hide} width={isMobile ? '100%' : 'auto'}>
                                {intl.formatMessage({ id: 'global.resume' })}
                            </Button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>
        </>
    );
};

export default ModalClose;
