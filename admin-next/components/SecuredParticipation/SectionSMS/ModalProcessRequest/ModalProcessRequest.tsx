import type { FC } from 'react';
import { useIntl } from 'react-intl';
import { Button, CapUIFontWeight, CapUIModalSize, Heading, Modal, Select, Text } from '@cap-collectif/ui';

const ModalProcessRequest: FC = () => {
    const intl = useIntl();

    return (
        <Modal
            size={CapUIModalSize.Sm}
            ariaLabel={intl.formatMessage({ id: "process-request" })}
            disclosure={
                <Button variant="secondary" variantColor="primary" variantSize="small">
                    {intl.formatMessage({ id: 'process-request' })}
                </Button>
            }>
            {({ hide }) => (
                <>
                    <Modal.Header>
                        <Heading>{intl.formatMessage({ id: "process-request" })}</Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <Text>
                            {intl.formatMessage({ id: "check-order-form-before-credit" }, { creditCount: "1 000" })}
                        </Text>
                        <Text mb={4} fontWeight={CapUIFontWeight.Semibold}>
                            {intl.formatMessage({ id: "global-action-irreversible" })}
                        </Text>

                        <Select
                            options={[
                                {
                                    label: '1 000',
                                    value: '1000'
                                },
                                {
                                    label: '5 000',
                                    value: '5000'
                                },
                                {
                                    label: '10 000',
                                    value: '10000'
                                },
                                {
                                    label: '25 000',
                                    value: '25000'
                                },
                                {
                                    label: '50 000',
                                    value: '50000'
                                }
                            ]}
                            defaultValue={{
                                label: '1 000',
                                value: '1000'
                            }}
                            inputId="color"
                        />
                    </Modal.Body>
                    <Modal.Footer justify="space-between">
                        <Button
                            variant="secondary"
                            variantColor="danger"
                            variantSize="big"
                            onClick={hide}>
                            {intl.formatMessage({ id: "action_delete" })}
                        </Button>
                        <Button
                            variant="primary"
                            variantColor="primary"
                            variantSize="big"
                            onClick={hide}>
                            {intl.formatMessage({ id: "global.credit" })}
                        </Button>
                    </Modal.Footer>
                </>
            )}
        </Modal>
    )
}

export default ModalProcessRequest;