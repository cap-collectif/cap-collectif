import * as React from 'react';
import { graphql, useFragment} from 'react-relay';
import { IntlShape, useIntl} from 'react-intl';
import {ForOrAgainstValue} from '@relay/DebateOpinion_debateOpinion.graphql';
import {ModalDebateOpinion_opinion$key} from '@relay/ModalDebateOpinion_opinion.graphql';
import {ModalDebateOpinion_debate$key} from '@relay/ModalDebateOpinion_debate.graphql';
import AddDebateOpinionMutation from '@mutations/AddDebateOpinionMutation';
import UpdateDebateOpinionMutation from '@mutations/UpdateDebateOpinionMutation';
import { formatConnectionPath } from '@utils/relay';
import {
    Modal,
    Button,
    ButtonGroup,
    Tag,
    Heading,
    CapUIModalSize,
    FormLabel,
    FormErrorMessage
} from '@cap-collectif/ui';
import {Controller, useForm} from "react-hook-form";
import {FieldInput, FormControl} from "@cap-collectif/form";
import { mutationErrorToast } from '@utils/mutation-error-toast';
import Jodit from "@components/Form/TextEditor/Jodit";
import UserListField from "@components/Form/UserListField";

type Props = {
    opinion: ModalDebateOpinion_opinion$key | null,
    debate: ModalDebateOpinion_debate$key,
    type: ForOrAgainstValue,
    onClose: () => void,
};

const DEBATE_OPINION_FRAGMENT = graphql`
    fragment ModalDebateOpinion_opinion on DebateOpinion {
      id
      type
      title
      body
      bodyUsingJoditWysiwyg
      author {
        id
        username
      }
    }
`;

const DEBATE_FRAGMENT = graphql`
    fragment ModalDebateOpinion_debate on Debate {
      id
    }
`;


type FormValues = {
    // TODO => remove Array
    author: Array<{
        label: string
        value: string
    }>
    title: string
    body: string
    bodyUsingJoditWysiwyg: boolean
    type: ForOrAgainstValue
}

const getTitle = (type: ForOrAgainstValue, isCreating?: boolean): string => {
    if (isCreating) {
        if (type === 'FOR') return 'add.opinion.for';
        if (type === 'AGAINST') return 'add.opinion.against';
    }

    if (!isCreating) {
        if (type === 'FOR') return 'edit.opinion.for';
        if (type === 'AGAINST') return 'edit.opinion.against';
    }

    return '';
};

const addDebateOpinion = async (input: FormValues, debateId: string, onClose: () => void, connections: Array<string>, intl: IntlShape) => {
    const author = input.author.map(author => author.value)[0];
    try {
        const response = await AddDebateOpinionMutation.commit({
            input: {
                ...input,
                debateId,
                author,
            },
            connections,
            edgeTypeName: 'DebateOpinionConnection',
        });
        onClose();
        if (response.addDebateOpinion?.errorCode) {
            return mutationErrorToast(intl);
        }
    } catch (error) {
        onClose();
        return mutationErrorToast(intl);
    }
};

const updateDebateOpinion = async (input: FormValues, debateOpinionId: string, onClose: () => void, intl: IntlShape) => {
    const author = input.author.map(author => author.value)[0];
    try {
        const response = await UpdateDebateOpinionMutation.commit({
            input: {...input, debateOpinionId, author},
        })
        onClose();
        if (response.updateDebateOpinion?.errorCode) {
            return mutationErrorToast(intl);
        }
    } catch (error) {
        onClose();
        return mutationErrorToast(intl);
    }
};

export const ModalDebateOpinion: React.FC<Props> = ({
   onClose,
   type,
   opinion: opinionRef,
   debate: debateRef,
}) => {

    const debate = useFragment(DEBATE_FRAGMENT, debateRef);
    const opinion = useFragment(DEBATE_OPINION_FRAGMENT, opinionRef);
    const intl = useIntl();

    const isCreating = !opinion;

    const defaultValues: FormValues = {
        title: opinion?.title ?? '',
        body: opinion?.body ?? '',
        bodyUsingJoditWysiwyg: opinion?.bodyUsingJoditWysiwyg ?? false,
        author: !isCreating ? [{
            value: opinion?.author?.id ?? '',
            label: opinion?.author?.username ?? '',
        }] : [],
        type,
    };


    const formMethods = useForm<FormValues>({
        mode: 'onChange',
        defaultValues
    });

    const {handleSubmit, formState, control} = formMethods;
    const {isSubmitting, isValid} = formState;

    const onSubmit = (values: FormValues) => {
        const connections = [formatConnectionPath(['client', debate.id], 'FaceToFace_opinions')];
        if (isCreating) return addDebateOpinion(values, debate.id, onClose, connections, intl);
        if (!isCreating && opinion) return updateDebateOpinion(values, opinion.id, onClose, intl);
    };

    return (
        <Modal
            show
            hideOnClickOutside={false}
            onClose={onClose}
            size={CapUIModalSize.Xl}
            ariaLabel={intl.formatMessage({id: 'create-form'})}
        >
            <Modal.Header>
                <Heading>
                    {intl.formatMessage({id: getTitle(type, isCreating)})}
                </Heading>
            </Modal.Header>
            <Modal.Body>
                <Tag variantColor={type === 'FOR' ? 'green' : 'red'} mb={4} width="max-content">
                    {intl.formatMessage({id: type === 'FOR' ? 'opinion.for' : 'opinion.against'})}
                </Tag>

                <form>
                    <FormControl name="author" control={control} isRequired>
                        <FormLabel
                            htmlFor="author"
                            label={intl.formatMessage({id: 'global.author'})}
                        />
                        <UserListField name="author" control={control} isMulti />
                    </FormControl>
                    <FormControl name="title" control={control} isRequired>
                        <FormLabel
                            htmlFor="title"
                            label={intl.formatMessage({id: 'global.title'})}
                        />
                        <FieldInput
                            name="title"
                            control={control}
                            type="text"
                            placeholder={intl.formatMessage({
                                id: 'global.title',
                            })}
                        />
                    </FormControl>
                    <FormControl name="title" control={control}>
                        <FormLabel
                            htmlFor="title"
                            label={intl.formatMessage({id: 'global.review'})}
                        />
                        <Controller
                            name="body"
                            control={control}
                            rules={{required: intl.formatMessage({ id: 'fill-field' })}}
                            render={({ field, fieldState }) => {
                                const {onChange, value} = field;
                                const {error} = fieldState;
                                return (
                                    <>
                                        <Jodit
                                            id="body"
                                            onChange={onChange}
                                            value={value}
                                            platformLanguage="fr"
                                        />
                                        {error?.message && <FormErrorMessage isInvalid>{error.message}</FormErrorMessage>}
                                    </>
                                );
                            }}
                        />
                    </FormControl>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <ButtonGroup>
                    <Button
                        variantSize="medium"
                        variant="secondary"
                        variantColor="hierarchy"
                        onClick={onClose}
                    >
                        {intl.formatMessage({id: 'cancel'})}
                    </Button>
                    <Button
                        data-cy="create-form-modal-create-button"
                        type="submit"
                        variantSize="medium"
                        variant="primary"
                        variantColor="primary"
                        onClick={e => {
                            handleSubmit((data: FormValues) => onSubmit(data))(e);
                        }}
                        isLoading={isSubmitting}
                        id="confirm-form-create"
                        disabled={!isValid}
                    >
                        {intl.formatMessage({id: 'global.edit'})}
                    </Button>
                </ButtonGroup>
            </Modal.Footer>
        </Modal>
    )
}
export default ModalDebateOpinion;
