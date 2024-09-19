import styled from 'styled-components';
import { Modal, MultiStepModal } from '@cap-collectif/ui';

export const ProposalVoteMultiModalContainer = styled(MultiStepModal).attrs({
    className: 'proposalVote__modal',
    ariaLabelledby: 'modal-title',
})`
    & .cap-tag {
        max-width: fit-content !important;
    }
    & .cap-address__dropdown {
        padding: 0 !important;
    }
    & .custom-modal-dialog {
        transform: none;
    }
    span.cap-text {
        font-weight: 400 !important;
    }
    & .proposals-user-votes__table {
        width: 100%;
    }
    .cap-button {
        white-space: nowrap !important;
    }
    & .DayPickerNavigation_button__horizontalDefault {
        background-color: transparent !important;
        border: none !important;
    }

    p:not(.cap-select__control .cap-text) {
        margin: 0 !important;

        span {
            font-weight: 400 !important;
            margin-bottom: 0 !important;
        }
    }

    #confirm-proposal-vote {
        background: #0488cc !important;
        border-color: #0488cc !important;
    }
    .cap-code-input {
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        input[type='number'] {
            -moz-appearance: textfield;
        }
    }
`;
export const ProposalVoteModalContainer = styled(Modal).attrs({
    className: 'proposalVote__modal',
})`
    & .cap-tag {
        max-width: fit-content !important;
    }
    && .custom-modal-dialog {
        transform: none;
    }
    && .proposals-user-votes__table {
        width: 100%;
    }

    p:not(.cap-select__control .cap-text) {
        margin: 0 !important;

        span {
            font-weight: 400 !important;
            margin-bottom: 0 !important;
        }
    }

    #confirm-proposal-vote {
        background: #0488cc !important;
        border-color: #0488cc !important;
    }

    .cap-code-input {
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

        input[type='number'] {
            -moz-appearance: textfield;
        }
    }
`;
