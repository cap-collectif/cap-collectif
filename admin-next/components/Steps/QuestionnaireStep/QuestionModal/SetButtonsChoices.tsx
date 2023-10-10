import * as React from 'react';
import { useIntl } from 'react-intl';
import {
    Box,
    Button,
    CapUIIcon,
    Flex,
    FormLabel,
    Heading,
    InputGroup,
    Switch,
} from '@cap-collectif/ui';
import { FieldInput, FormControl } from '@cap-collectif/form';
import { useFieldArray, useFormContext } from 'react-hook-form';

const Wrapper = ({
    formFieldName,
    withColors,
    children,
    responseColorsDisabled,
}: {
    formFieldName: string,
    withColors: boolean,
    children: any,
    responseColorsDisabled: boolean,
}) => {
    const { control } = useFormContext();

    if (withColors)
        return (
            <InputGroup
                mb={1}
                wrap="nowrap"
                sx={{
                    '.cap-form-control:last-child': { width: '100% !important' },
                }}>
                <FormControl
                    name={`${formFieldName}.color`}
                    control={control}
                    isRequired
                    position="relative">
                    <FieldInput
                        type="colorPicker"
                        id={`${formFieldName}.color`}
                        name={`${formFieldName}.color`}
                        control={control}
                        disabled={responseColorsDisabled}
                    />
                </FormControl>
                {children}
            </InputGroup>
        );
    return children;
};

const SetButtonsChoices: React.FC = () => {
    const intl = useIntl();
    const { control, watch, setValue } = useFormContext();

    const {
        fields: choices,
        append,
        remove,
    } = useFieldArray({
        control,
        name: `temporaryQuestion.choices`,
    });

    const responseColorsDisabled = watch(`temporaryQuestion.responseColorsDisabled`);
    const groupedResponsesEnabled = watch(`temporaryQuestion.groupedResponsesEnabled`);
    const type = watch('temporaryQuestion.type');

    return (
        <Flex direction="column" borderRadius="normal" mt={0}>
            <Box>
                <FormLabel
                    mb={2}
                    label={intl.formatMessage({ id: 'admin.fields.reply.group_responses' })}
                />
                {choices.map((choice, index) => {
                    const formFieldName = `temporaryQuestion.choices.${index}`;
                    return (
                        <Box key={choice.id} mb={4}>
                            <Wrapper
                                formFieldName={formFieldName}
                                withColors={type === 'button'}
                                responseColorsDisabled={responseColorsDisabled}>
                                <FormControl
                                    name={`${formFieldName}.title`}
                                    control={control}
                                    isRequired
                                    position="relative"
                                    sx={{
                                        width: '100% !important',
                                    }}>
                                    <FieldInput
                                        id={`${formFieldName}.title`}
                                        name={`${formFieldName}.title`}
                                        control={control}
                                        type="text"
                                        width="100%"
                                        onClickActions={[
                                            { icon: CapUIIcon.Trash, onClick: () => remove(index) },
                                        ]}
                                    />
                                </FormControl>
                            </Wrapper>
                            <InputGroup
                                mb={1}
                                wrap="nowrap"
                                sx={{
                                    '.cap-form-control:last-child': { width: '100% !important' },
                                }}>
                                {type === 'button?' ? (
                                    <FormControl
                                        name={`${formFieldName}.color`}
                                        control={control}
                                        isRequired
                                        position="relative">
                                        <FieldInput
                                            type="colorPicker"
                                            id={`${formFieldName}.color`}
                                            name={`${formFieldName}.color`}
                                            control={control}
                                            disabled={responseColorsDisabled}
                                        />
                                    </FormControl>
                                ) : null}
                            </InputGroup>
                        </Box>
                    );
                })}
                <Button
                    variant="tertiary"
                    mb={4}
                    onClick={() => {
                        append({});
                    }}>
                    {intl.formatMessage({ id: 'add-choice' })}
                </Button>
            </Box>
            <Flex
                justify="space-between"
                alignItems="flex-start"
                bg="white"
                p={4}
                mb={2}
                borderRadius="normal">
                <Heading as="h5" color="blue.900" fontWeight={600} fontSize={3}>
                    {intl.formatMessage({ id: 'disable-responses-colors' })}
                </Heading>
                <Switch
                    id={`temporaryQuestion.responseColorsDisabled`}
                    checked={responseColorsDisabled}
                    onChange={() =>
                        setValue(
                            `temporaryQuestion.responseColorsDisabled`,
                            !responseColorsDisabled,
                        )
                    }
                />
            </Flex>
            <Flex
                justify="space-between"
                alignItems="flex-start"
                bg="white"
                p={4}
                mb={2}
                borderRadius="normal">
                <Heading as="h5" color="blue.900" fontWeight={600} fontSize={3}>
                    {intl.formatMessage({ id: 'enable-grouped-responses' })}
                </Heading>
                <Switch
                    id={`temporaryQuestion.groupedResponsesEnabled`}
                    checked={groupedResponsesEnabled}
                    onChange={() =>
                        setValue(
                            `temporaryQuestion.groupedResponsesEnabled`,
                            !groupedResponsesEnabled,
                        )
                    }
                />
            </Flex>
        </Flex>
    );
};

export default SetButtonsChoices;
