import React from 'react';
import {
    Button,
    FormLabel,
    Heading,
    MultiStepModal,
    Text,
    useMultiStepModal,
    Flex,
} from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import { FieldInput, FormControl } from '@cap-collectif/form';
import { Controller, useFormContext } from 'react-hook-form';
import Jodit from '@components/Form/TextEditor/Jodit';
import { OpinionTypeInput } from '@relay/CreateOrUpdateConsultationMutation.graphql';
import {getPropertyByString} from "@utils/getPropertyByString";

type Props = {
    sectionFormKey: string;
    onClose: () => void;
    initialValue: React.MutableRefObject<OpinionTypeInput>;
};

const SectionSettingsModal: React.FC<Props> = ({ sectionFormKey, onClose, initialValue }) => {
    const intl = useIntl();
    const { goToNextStep } = useMultiStepModal();
    const { control, resetField, formState, setFocus } = useFormContext();
    const { hide } = useMultiStepModal();

    const { errors } = formState;

    const sectionErrors = getPropertyByString(errors, sectionFormKey) ?? {};
    const hasErrors = Object.keys(sectionErrors).length > 0;

    const onCancel = () => {
        resetField(sectionFormKey, {
            defaultValue: initialValue.current,
        });
        onClose();
        hide();
    };

    const onNextClick = () => {
        if (!hasErrors) {
            goToNextStep();
            return;
        }

        for (const key in sectionErrors) {
            setFocus(`${sectionFormKey}.${key}`);
        }
    }

    return (
        <>
            <MultiStepModal.Header>
                <Text uppercase color="gray.500" fontWeight={700} fontSize={1}>
                    {intl.formatMessage({ id: 'project.types.consultation' })}
                </Text>
                <Heading color="primary.blue.900" fontSize={6} fontWeight={600}>
                    {intl.formatMessage({ id: 'add-participation-area' })}
                </Heading>
            </MultiStepModal.Header>
            <MultiStepModal.Body>
                <FormControl name={`${sectionFormKey}.title`} control={control} isRequired>
                    <FormLabel
                        htmlFor={`${sectionFormKey}.title`}
                        label={intl.formatMessage({ id: 'global.title' })}
                    />
                    <FieldInput
                        id={`${sectionFormKey}.title`}
                        name={`${sectionFormKey}.title`}
                        control={control}
                        type="text"
                    />
                </FormControl>
                <FormControl name={`${sectionFormKey}.description`} control={control} isRequired={false}>
                    <Flex>
                        <FormLabel
                            htmlFor="description"
                            label={intl.formatMessage({ id: 'global.description' })}
                        />
                        <Text color="gray.500" ml={1} fontSize={2}>{intl.formatMessage({ id: 'global.optional' })}</Text>
                    </Flex>
                    <Controller
                        name={`${sectionFormKey}.description`}
                        control={control}
                        render={({ field }) => {
                            const { onChange, value } = field;
                            return (
                                <>
                                    <Jodit
                                        id="body"
                                        onChange={onChange}
                                        value={value}
                                        platformLanguage="fr"
                                    />
                                </>
                            );
                        }}
                    />
                </FormControl>
            </MultiStepModal.Body>

            <MultiStepModal.Footer>
                <Button variantSize="medium" variant="secondary" onClick={onCancel}>
                    {intl.formatMessage({ id: 'global.cancel' })}
                </Button>
                <Button variantSize="medium" onClick={onNextClick}>
                    {intl.formatMessage({ id: 'global.next' })}
                </Button>
            </MultiStepModal.Footer>
        </>
    );
};

export default SectionSettingsModal;
