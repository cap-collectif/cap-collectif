import type { FC } from 'react';
import { useIntl } from 'react-intl';
import {
    Text,
    Modal,
    Heading,
    Button,
    FormLabel,
    CapUIIcon,
    CapUIModalSize,
} from '@cap-collectif/ui';
import { FieldInput, FormControl } from '@cap-collectif/form';
import { useFormContext } from 'react-hook-form';

type SectionProps = { onSuccess: () => void, onClose: () => void, isSubSection: boolean };

const SectionModal: FC<SectionProps> = ({ onClose, onSuccess, isSubSection }) => {
    const intl = useIntl();
    const { control, watch } = useFormContext();

    const title = watch(`temporaryQuestion.title`);

    return (
        <Modal
            show
            ariaLabel={intl.formatMessage({ id: 'import-list' })}
            size={CapUIModalSize.Xl}
            hideOnClickOutside={false}
            onClose={onClose}>
            <Modal.Header>
                <Heading>
                    {intl.formatMessage({
                        id: isSubSection ? 'create-sub-section' : 'create-section',
                    })}
                </Heading>
            </Modal.Header>
            <Modal.Body>
                <FormControl name={`temporaryQuestion.title`} control={control}>
                    <FormLabel
                        htmlFor={`temporaryQuestion.title`}
                        label={intl.formatMessage({ id: 'global.title' })}
                    />
                    <FieldInput
                        id={`temporaryQuestion.title`}
                        name={`temporaryQuestion.title`}
                        control={control}
                        type="text"
                    />
                </FormControl>
                <FormControl name={`temporaryQuestion.description`} control={control}>
                    <FormLabel
                        htmlFor={`temporaryQuestion.description`}
                        label={intl.formatMessage({ id: 'global.description' })}>
                        <Text color="gray.500">
                            {intl.formatMessage({ id: 'global.optional' })}
                        </Text>
                    </FormLabel>

                    <FieldInput
                        id={`temporaryQuestion.description`}
                        name={`temporaryQuestion.description`}
                        control={control}
                        type="text"
                    />
                </FormControl>
                <FormControl name={`temporaryQuestion.private`} control={control}>
                    <FieldInput
                        id={`temporaryQuestion.private`}
                        name={`temporaryQuestion.private`}
                        control={control}
                        type="checkbox">
                        {intl.formatMessage({ id: 'admin.checkbox.visible.from' })}
                    </FieldInput>
                </FormControl>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    variantColor="primary"
                    variantSize="big"
                    onClick={onClose}>
                    {intl.formatMessage({ id: 'cancel' })}
                </Button>
                <Button
                    variant="primary"
                    variantColor="primary"
                    variantSize="big"
                    rightIcon={CapUIIcon.LongArrowRight}
                    onClick={onSuccess}
                    disabled={!title}>
                    {intl.formatMessage({ id: 'global.add' })}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SectionModal;
