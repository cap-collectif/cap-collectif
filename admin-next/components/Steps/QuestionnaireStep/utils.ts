import { QuestionChoiceInput } from '@relay/PreConfigureProjectMutation.graphql';
import {
    QuestionnaireStepFormQueryResponse,
    QuestionTypeValue,
} from '@relay/QuestionnaireStepFormQuery.graphql';
import {
    QuestionInput,
    QuestionnaireAbstractQuestionInput,
} from '@relay/UpdateQuestionnaireMutation.graphql';
import uuid from '@utils/uuid';

export const questionTypeToLabel = (type: QuestionTypeValue) => {
    switch (type) {
        case 'button':
            return 'question.types.buttons';
        case 'checkbox':
            return 'question.types.check';
        case 'editor':
            return 'question.types.texteditor';
        case 'majority':
            return 'majority-decision';
        case 'medias':
            return 'question.types.file';
        case 'number':
            return 'admin.fields.validation_rule.number';
        case 'radio':
            return 'question.types.radio';
        case 'ranking':
            return 'question.types.rank';
        case 'rna':
            return 'global.question.types.rna';
        case 'select':
            return 'question.types.select';
        case 'siret':
            return 'global.question.types.siret';
        case 'text':
            return 'question.types.text';
        case 'textarea':
            return 'question.types.paragraph';
        case 'section':
        default:
            return 'global.question.types.section';
    }
};

const multipleChoiceQuestions = ['button', 'radio', 'select', 'checkbox', 'ranking'];

export const QuestionTypes = {
    TEXT: {
        label: 'question.category.text',
        values: [
            { label: 'question.types.text', type: 'text' },
            { label: 'question.types.paragraph', type: 'textarea' },
            { label: 'question.types.texteditor', type: 'editor' },
        ],
    },
    NUMERIC: {
        label: 'question.category.num',
        values: [{ label: 'admin.fields.validation_rule.number', type: 'number' }],
    },
    DOCUMENT: {
        label: 'global.question.types.medias',
        values: [{ label: 'question.types.file', type: 'medias' }],
    },
    UNIQUE_CHOICE: {
        label: 'question.category.unique',
        values: [
            { label: 'question.types.buttons', type: 'button' },
            { label: 'question.types.radio', type: 'radio' },
            { label: 'question.types.select', type: 'select' },
            { label: 'majority-decision', type: 'majority' },
        ],
    },
    MULTIPLE_CHOICE: {
        label: 'question.category.multiple',
        values: [
            { label: 'question.types.check', type: 'checkbox' },
            { label: 'question.types.rank', type: 'ranking' },
        ],
    },
    LEGAL: {
        label: 'question.category.legal',
        values: [
            { label: 'global.question.types.siret', type: 'siret' },
            { label: 'global.question.types.rna', type: 'rna' },
        ],
    },
};

export type QuestionCategory =
    | 'TEXT'
    | 'NUMERIC'
    | 'DOCUMENT'
    | 'UNIQUE_CHOICE'
    | 'MULTIPLE_CHOICE'
    | 'LEGAL';

export const formatQuestions = (
    questionnaire: NonNullable<QuestionnaireStepFormQueryResponse['step']>['questionnaire'],
): any => {
    const questions = questionnaire?.questions.map(question => {
        if (question.__typename !== 'MultipleChoiceQuestion') return question;
        const choices =
            question.choices && question.choices.edges
                ? question.choices.edges.map(edge => edge?.node)
                : [];
        return {
            ...question,
            choices,
        };
    });
    return questions;
};

type Condition = { value: { id: string }, question: { id: string } };

// Copied from the flow file. TODO: better types once jumps are in
const convertJump = (jump: any) => ({
    id: jump.id,
    conditions:
        jump.conditions &&
        jump.conditions.map((condition: Condition) => ({
            ...condition,
            question: condition.question.id,
            value: condition.value ? condition.value.id : null,
        })),
    origin: jump.origin.id,
    destination: jump.destination.id,
});

// Copied from the flow file. TODO: better types once jumps are in
export const formatQuestionsInput = (
    questions: Array<QuestionInput & { __typename?: string }>,
): Array<QuestionnaireAbstractQuestionInput> =>
    questions.map(question => {
        const questionInput = {
            question: {
                ...question,
                temporaryId: question?.id ? undefined : uuid(),
                alwaysJumpDestinationQuestion: question.alwaysJumpDestinationQuestion
                    ? question.alwaysJumpDestinationQuestion.id
                    : null,
                jumps: question.jumps ? question.jumps.filter(Boolean).map(convertJump) : [],
                validationRule:
                    question.validationRule && question.validationRule.type.length
                        ? question.validationRule
                        : question.__typename === 'MultipleChoiceQuestion'
                        ? null
                        : undefined,
                // List of not send properties to server
                __typename: undefined,
                kind: undefined,
                number: undefined,
                position: undefined,
                choices: undefined,
                destinationJumps: undefined,
            },
        };
        if (
            multipleChoiceQuestions.indexOf(question.type) !== -1 &&
            typeof question.choices !== 'undefined'
        ) {
            questionInput.question.choices = question.choices
                ? question.choices.map(choice => ({
                      ...choice,
                      temporaryId: choice?.id ? undefined : uuid(),
                      image: choice?.image ? choice.image?.id : null,
                      kind: undefined,
                  }))
                : [];
        }
        return questionInput;
    });
