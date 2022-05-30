import { FC, useState } from 'react';
import { IntlShape, useIntl } from 'react-intl';
import {
    Button,
    CapUIFontWeight,
    CapUILineHeight,
    CapUIModalSize,
    Flex,
    Heading,
    Modal,
    Tag,
    Text,
    toast,
} from '@cap-collectif/ui';
import { SegmentedControl } from '@ui/SegmentedControl';
import { SegmentedControlValue } from '@ui/SegmentedControl/item/SegmentedControlItem';
import { formatBigNumber } from '@utils/format-number';
import { mutationErrorToast } from '@utils/mutation-error-toast';
import CreateSmsOrderMutation from '@mutations/CreateSmsOrderMutation';
import useFeatureFlag from '@hooks/useFeatureFlag';

const submitOrder = (creditCount: SegmentedControlValue, intl: IntlShape) => {
    const input = {
        amount: Number(creditCount),
    };

    return CreateSmsOrderMutation.commit({
        input,
    }).then(response => {
        if (!response.createSmsOrder?.smsOrder) {
            return mutationErrorToast(intl);
        }

        toast({
            variant: 'success',
            content: intl.formatMessage({ id: 'order-sent-contact-soon' }),
        });
    });
};

export const PACKAGE_LIST = [
    {
        price: 1000,
        sms: 1000,
    },
    {
        price: 2500,
        sms: 5000,
    },
    {
        price: 4000,
        sms: 10000,
    },
    {
        price: 7500,
        sms: 25000,
    },
    {
        price: 10000,
        sms: 50000,
    },
];

type ModalCreditRefillProps = {
    firstRequest?: boolean,
};

const ModalCreditRefill: FC<ModalCreditRefillProps> = ({ firstRequest }) => {
    const intl = useIntl();
    const hasTwilioEnabled = useFeatureFlag('twilio');
    const [offerSelected, setOfferSelected] = useState<SegmentedControlValue>(PACKAGE_LIST[2].sms);

    const packageSelected =
        PACKAGE_LIST.find(pack => pack.sms === offerSelected) || PACKAGE_LIST[2];
    const unitPriceSms = packageSelected.price / packageSelected.sms;

    return (
        <Modal
            size={CapUIModalSize.Md}
            ariaLabel={intl.formatMessage({ id: 'process-request' })}
            disclosure={
                firstRequest ? (
                    <Button
                        variant="primary"
                        variantColor="primary"
                        variantSize="small"
                        disabled={!hasTwilioEnabled}>
                        {intl.formatMessage({ id: 'action_enable' })}
                    </Button>
                ) : (
                    <Button
                        variant="secondary"
                        variantColor="primary"
                        variantSize="small"
                        alignSelf="flex-start">
                        {intl.formatMessage({ id: 'global.refill' })}
                    </Button>
                )
            }>
            {({ hide }) => (
                <>
                    <Modal.Header>
                        <Modal.Header.Label>
                            {intl.formatMessage({ id: 'ask-refill' })}
                        </Modal.Header.Label>
                        <Heading>{intl.formatMessage({ id: 'select-pack' })}</Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <Flex
                            direction="column"
                            border="normal"
                            align="center"
                            borderColor="blue.200"
                            bg="blue.100"
                            p={6}>
                            <Text color="blue.900" mb={1}>
                                <Text
                                    as="span"
                                    fontSize={6}
                                    fontWeight={CapUIFontWeight.Semibold}
                                    lineHeight={CapUILineHeight.L}>
                                    {formatBigNumber(packageSelected.price)}
                                </Text>
                                <Text as="span" fontSize={3}>
                                    € HT
                                </Text>
                            </Text>

                            <Tag variantColor="green" maxWidth="100% !important">
                                <Tag.Label>
                                    {`${unitPriceSms}
                                    cts / ${intl
                                        .formatMessage({ id: 'verified-participant' })
                                        .toLowerCase()} 
                                    (-${unitPriceSms * 100}%)`}
                                </Tag.Label>
                            </Tag>

                            <Text
                                color="blue.800"
                                fontSize={3}
                                lineHeight={CapUILineHeight.S}
                                maxWidth="70%"
                                textAlign="center"
                                my={5}>
                                {intl.formatMessage({
                                    id: 'choose-credit-pack-depend-of-participant',
                                })}
                            </Text>

                            <SegmentedControl
                                value={offerSelected}
                                onChange={setOfferSelected}
                                width="100%">
                                {PACKAGE_LIST.map((pack, idx) => (
                                    <SegmentedControl.Item value={pack.sms} key={idx}>
                                        {formatBigNumber(pack.sms)}
                                    </SegmentedControl.Item>
                                ))}
                            </SegmentedControl>
                        </Flex>
                    </Modal.Body>
                    <Modal.Footer
                        info={{
                            url: 'https://aide.cap-collectif.com/article/270-securisation-du-vote-par-sms',
                            label: intl.formatMessage({ id: 'learn.more' }),
                        }}>
                        <Button
                            variant="primary"
                            variantColor="primary"
                            variantSize="big"
                            onClick={() => {
                                submitOrder(offerSelected, intl);
                                hide();
                            }}>
                            {intl.formatMessage({ id: 'global.to-order' })}
                        </Button>
                    </Modal.Footer>
                </>
            )}
        </Modal>
    );
};

export default ModalCreditRefill;
