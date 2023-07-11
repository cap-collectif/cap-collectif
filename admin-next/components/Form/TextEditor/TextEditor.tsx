import * as React from 'react';
import { useIntl } from 'react-intl';
import {
    Button,
    ButtonGroup,
    CapUIModalSize,
    Flex,
    FormLabel,
    Heading,
    Modal,
    Text,
} from '@cap-collectif/ui';
import Jodit from './Jodit';
import { Controller, useFormContext } from 'react-hook-form';

export type TextEditorProps = {
    label: string,
    name: string,
    placeholder?: string,
    required?: boolean,
    selectedLanguage?: string,
    platformLanguage?: string,

    buttonLabels?: {
        cancel?: string,
        submit?: string,
    },
};

const TextEditor: React.FC<TextEditorProps> = ({
    label,
    name,
    placeholder,
    required = false,
    selectedLanguage = 'fr',
    platformLanguage = 'fr',
    buttonLabels,
}) => {
    const intl = useIntl();
    const [isOpen, setIsOpen] = React.useState(false);
    const [reloadContent, setReloadContent] = React.useState(false);

    const [inModalValue, setInModalValue] = React.useState('');
    const { control, setValue, watch } = useFormContext();

    const value = watch(name);

    React.useEffect(() => {
        // Trick to reset jodit content on language change
        setReloadContent(true);
        setTimeout(() => setReloadContent(false), 1);
    }, [selectedLanguage]);

    return (
        <Flex direction="column" mb={4}>
            <Flex justify="space-between" mb={1}>
                <FormLabel htmlFor={name} label={label}>
                    {required ? null : (
                        <Text fontSize={2} color="gray.500">
                            {intl.formatMessage({ id: 'global.optional' })}
                        </Text>
                    )}
                </FormLabel>
                <div>
                    <Button variant="link" onClick={() => setIsOpen(true)} type="button">
                        {intl.formatMessage({ id: 'advanced-editor' })}
                    </Button>

                    <Modal
                        show={isOpen}
                        hideOnClickOutside={false}
                        size={CapUIModalSize.Xl}
                        ariaLabel={intl.formatMessage({ id: 'delete-confirmation' })}
                        onClose={() => setIsOpen(false)}
                        forceModalDialogToFalse>
                        <Modal.Header>
                            <Modal.Header.Label>
                                {intl.formatMessage({ id: 'advanced-editor' })}
                            </Modal.Header.Label>
                            <Heading>{label}</Heading>
                        </Modal.Header>
                        <Modal.Body
                            p={0}
                            pt={0}
                            sx={{ '.jodit-container': { border: 'none !important' } }}>
                            <Jodit
                                id={`${name}-JoditModal-${selectedLanguage}`}
                                placeholder={placeholder}
                                onChange={value => setInModalValue(value)}
                                value={value}
                                platformLanguage={platformLanguage}
                            />
                        </Modal.Body>
                        <Modal.Footer spacing={2}>
                            <ButtonGroup>
                                <Button
                                    type="button"
                                    variantSize="big"
                                    variant="secondary"
                                    variantColor="hierarchy"
                                    onClick={() => setIsOpen(false)}>
                                    {buttonLabels?.cancel ?? intl.formatMessage({ id: 'cancel' })}
                                </Button>
                                <Button
                                    type="button"
                                    variantSize="big"
                                    variant="primary"
                                    variantColor="primary"
                                    onClick={() => {
                                        setValue(name, inModalValue);
                                        setIsOpen(false);
                                    }}>
                                    {buttonLabels?.submit ??
                                        intl.formatMessage({ id: 'global.validate' })}
                                </Button>
                            </ButtonGroup>
                        </Modal.Footer>
                    </Modal>
                </div>
            </Flex>
            <Controller
                name={name}
                control={control}
                render={({ field }) => {
                    const { onChange, value } = field;
                    return (
                        <Jodit
                            id={`${name}-JoditTextArea-${selectedLanguage}`}
                            textAreaOnly
                            placeholder={placeholder}
                            onChange={onChange}
                            value={value}
                            selectedLanguage={
                                isOpen || reloadContent ? '_suspend' : selectedLanguage
                            }
                            platformLanguage={platformLanguage}
                        />
                    );
                }}
            />
        </Flex>
    );
};

export default TextEditor;
