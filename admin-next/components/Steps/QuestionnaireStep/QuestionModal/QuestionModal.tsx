import * as React from 'react';
import { useIntl } from 'react-intl';
import { MultiStepModal, CapUIModalSize } from '@cap-collectif/ui';
import ChooseQuestionTypeModal from './ChooseQuestionTypeModal';
import CustomizeQuestionModal from './CustomizeQuestionModal';
import AdditionalParametersModal from './AdditionalParametersModal';

type Props = {
    onSuccess: () => void,
    onClose: () => void,
};

// TODO: initialStep on existing question
const QuestionModal = ({ onSuccess, onClose }: Props) => {
    const intl = useIntl();

    const handleCancel = () => {}; // goToPrevStep or close ?

    const handleSuccess = () => {
        onSuccess();
    };

    return (
        <MultiStepModal
            show
            resetStepOnClose
            ariaLabel={intl.formatMessage({ id: 'import-list' })}
            size={CapUIModalSize.Xl}
            hideOnClickOutside={false}
            onClose={onClose}>
            <ChooseQuestionTypeModal onCancel={handleCancel} />
            <CustomizeQuestionModal onCancel={handleCancel} />
            <AdditionalParametersModal onSuccess={handleSuccess} onCancel={handleCancel} />
        </MultiStepModal>
    );
};

export default QuestionModal;
