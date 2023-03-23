import type { FC } from 'react';
import { useIntl } from 'react-intl';
import {
    MultiStepModal,
    Modal,
    Heading,
    Button,
    useMultiStepModal,
    CapUIIcon,
    FormLabel,
} from '@cap-collectif/ui';
import { useFormContext } from 'react-hook-form';
import { useAppContext } from '@components/AppProvider/App.context';
import { FieldInput } from '@cap-collectif/form';

type ChooseQuestionTypeProps = {
    onSuccess: () => void,
    onCancel: () => void,
};

const AdditionalParametersModal: FC<ChooseQuestionTypeProps> = ({ onSuccess, onCancel }) => {
    const intl = useIntl();
    const { viewerSession } = useAppContext();
    const { hide } = useMultiStepModal();
    const { watch, control } = useFormContext();

    const type = watch(`temporaryQuestion.type`);

    const isCollectStep = false; // TODO pass as a prop once integrated on collect step

    return (
        <>
            <MultiStepModal.Header>
                <Modal.Header.Label>
                    {intl.formatMessage({ id: 'question_modal.create.title' })}
                </Modal.Header.Label>
                <Heading>{intl.formatMessage({ id: 'additional-parameters' })}</Heading>
            </MultiStepModal.Header>
            <Modal.Body>
                <FormLabel label={intl.formatMessage({ id: 'global.options' })} mb={1} />
                <FieldInput
                    id={`temporaryQuestion.randomQuestionChoices`}
                    name={`temporaryQuestion.randomQuestionChoices`}
                    control={control}
                    type="checkbox">
                    {intl.formatMessage({
                        id: 'admin.fields.question.random_question_choices',
                    })}
                </FieldInput>
                <FieldInput
                    id={`temporaryQuestion.required`}
                    name={`temporaryQuestion.required`}
                    control={control}
                    type="checkbox">
                    {intl.formatMessage({
                        id: 'global.admin.required',
                    })}
                </FieldInput>
                {isCollectStep ? (
                    <FieldInput
                        id={`temporaryQuestion.private`}
                        name={`temporaryQuestion.private`}
                        control={control}
                        type="checkbox">
                        {intl.formatMessage({
                            id: 'admin.fields.question.private',
                        })}
                    </FieldInput>
                ) : null}
                {viewerSession.isAdmin ? (
                    <FieldInput
                        id={`temporaryQuestion.hidden`}
                        name={`temporaryQuestion.hidden`}
                        control={control}
                        type="checkbox">
                        {intl.formatMessage({
                            id: 'hidden-question',
                        })}
                    </FieldInput>
                ) : null}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    variantColor="primary"
                    variantSize="big"
                    onClick={() => {
                        onCancel();
                        hide();
                    }}>
                    {intl.formatMessage({ id: 'cancel' })}
                </Button>
                <Button
                    variant="primary"
                    variantColor="primary"
                    variantSize="big"
                    disabled={!type}
                    onClick={() => {
                        onSuccess();
                        hide();
                    }}
                    rightIcon={CapUIIcon.LongArrowRight}>
                    {intl.formatMessage({ id: 'global.add' })}
                </Button>
            </Modal.Footer>
        </>
    );
};

export default AdditionalParametersModal;
