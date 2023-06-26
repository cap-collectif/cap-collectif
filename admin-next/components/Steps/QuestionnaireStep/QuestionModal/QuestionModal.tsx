import * as React from 'react';
import { useIntl } from 'react-intl';
import { MultiStepModal, CapUIModalSize } from '@cap-collectif/ui';
import ChooseQuestionTypeModal from './ChooseQuestionTypeModal';
import CustomizeQuestionModal from './CustomizeQuestionModal';
import AdditionalParametersModal from './AdditionalParametersModal';

type Props = {
    onSuccess: () => void,
    onClose: () => void,
    isNewQuestion: boolean,
};

const QuestionModal = ({ onSuccess, onClose, isNewQuestion }: Props) => {
    const intl = useIntl();

    return (
        <MultiStepModal
            show
            defaultStep={isNewQuestion ? 0 : 1}
            resetStepOnClose
            ariaLabel={intl.formatMessage({ id: 'import-list' })}
            size={CapUIModalSize.Xl}
            hideOnClickOutside={false}
            onClose={onClose}>
            <ChooseQuestionTypeModal onCancel={onClose} />
            <CustomizeQuestionModal onCancel={onClose} />
            <AdditionalParametersModal onSuccess={onSuccess} onCancel={onClose} />
        </MultiStepModal>
    );
};

export default QuestionModal;
