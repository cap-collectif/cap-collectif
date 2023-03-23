import type { FC } from 'react';
import { useIntl } from 'react-intl';
import {
    Text,
    MultiStepModal,
    Modal,
    Heading,
    Button,
    useMultiStepModal,
    FormLabel,
    CapUIIcon,
} from '@cap-collectif/ui';
import { FieldInput, FormControl } from '@cap-collectif/form';
import { useFormContext } from 'react-hook-form';
import MajorityPreview from './MajorityPreview';
import NumberRange from './NumberRange';
import SetButtonsChoices from './SetButtonsChoices';
import SetComplexChoices from './SetComplexChoices';

type CustomizeQuestionProps = { onCancel?: () => void };

const CustomizeQuestionModal: FC<CustomizeQuestionProps> = ({ onCancel }) => {
    const intl = useIntl();
    const { hide, goToNextStep } = useMultiStepModal();
    const { control, watch } = useFormContext();
    const type = watch(`temporaryQuestion.type`);
    const title = watch(`temporaryQuestion.title`);

    return (
        <>
            <MultiStepModal.Header>
                <Modal.Header.Label>
                    {intl.formatMessage({ id: 'question_modal.create.title' })}
                </Modal.Header.Label>
                <Heading>{intl.formatMessage({ id: 'customize-your-question' })}</Heading>
            </MultiStepModal.Header>
            <Modal.Body bg="gray.100">
                <FormControl name={`temporaryQuestion.title`} control={control}>
                    <FormLabel
                        htmlFor={`temporaryQuestion.title`}
                        label={intl.formatMessage({ id: 'your-question' })}
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
                <FormControl name={`temporaryQuestion.helpText`} control={control}>
                    <FormLabel
                        htmlFor={`temporaryQuestion.helpText`}
                        label={intl.formatMessage({ id: 'global.help.text' })}>
                        <Text color="gray.500">
                            {intl.formatMessage({ id: 'global.optional' })}
                        </Text>
                    </FormLabel>
                    <FieldInput
                        id={`temporaryQuestion.helpText`}
                        name={`temporaryQuestion.helpText`}
                        control={control}
                        type="text"
                    />
                </FormControl>
                {type === 'majority' ? <MajorityPreview /> : null}
                {type === 'number' ? <NumberRange /> : null}
                {type === 'button' || type === 'select' ? <SetButtonsChoices /> : null}
                {type === 'radio' || type === 'checkbox' || type === 'ranking' ? (
                    <SetComplexChoices />
                ) : null}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    variantColor="primary"
                    variantSize="big"
                    onClick={() => {
                        if (onCancel) onCancel();
                        hide();
                    }}>
                    {intl.formatMessage({ id: 'cancel' })}
                </Button>
                <Button
                    variant="primary"
                    variantColor="primary"
                    variantSize="big"
                    rightIcon={CapUIIcon.LongArrowRight}
                    onClick={goToNextStep}
                    disabled={
                        !title /** TODO : more strict error handling. Is the button disabled or shoud I display errors on click */
                    }>
                    {intl.formatMessage({ id: 'global.next' })}
                </Button>
            </Modal.Footer>
        </>
    );
};

export default CustomizeQuestionModal;
