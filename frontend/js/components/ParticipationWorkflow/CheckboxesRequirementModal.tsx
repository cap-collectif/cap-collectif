import React from 'react';
import ModalLayout from '~/components/ParticipationWorkflow/ModalLayout';
import { Box, Button, Text, useMultiStepModal } from '@cap-collectif/ui';
import { FieldInput, FormControl } from '@cap-collectif/form';
import { useIntl } from 'react-intl';
import { useFormContext } from 'react-hook-form';
import { useUpdateParticipantRequirementMutation } from '~/mutations/UpdateParticipantRequirement';
import CookieMonster from '@shared/utils/CookieMonster';
import { useSelector } from 'react-redux';
import type { GlobalState } from '~/types';
import { useUpdateRequirementMutation } from '~/mutations/UpdateRequirementMutation';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import { FormValues as WorkflowFormValues } from './ParticipationWorkflowModal';
import { HideBackArrowLayout } from '~/components/ParticipationWorkflow/ModalLayoutHeader';

type FormValues = Pick<WorkflowFormValues, 'checkboxes'>;

type CheckboxRequirement = {
    isMeetingTheRequirement: boolean,
    viewerMeetsTheRequirement: any,
    participantMeetsTheRequirement: any,
    __typename: string,
    id?: string,
    label?: string,
    participantValue?: string,
    viewerValue?: string,
};

type Props = {
    checkboxes: Array<CheckboxRequirement>,
    hideGoBackArrow: boolean,
};

type Requirement = { requirementId: string, value: boolean };

const CheckboxesRequirementModal: React.FC<Props> = ({ checkboxes, hideGoBackArrow }) => {
    const intl = useIntl();
    const isAuthenticated = useSelector((state: GlobalState) => !!state.user.user);
    const { goToNextStep } = useMultiStepModal();
    const updateParticipantRequirementMutation = useUpdateParticipantRequirementMutation();
    const updateRequirementMutation = useUpdateRequirementMutation();

    const isLoading =
        updateParticipantRequirementMutation.isLoading || updateRequirementMutation.isLoading;

    const { control, handleSubmit, setValue } = useFormContext<FormValues>();

    const buttonRef = React.useRef(null);

    React.useEffect(() => {
        if (buttonRef.current) {
            buttonRef.current.focus();
        }
    }, []);

    const updateUser = (values: Requirement[]) => {
        const input = {
            values,
        };
        updateRequirementMutation.commit({
            variables: {
                input,
            },
            onCompleted: (response, errors) => {
                if (errors && errors.length > 0) {
                    return mutationErrorToast(intl);
                }
                goToNextStep();
            },
            onError: () => {
                return mutationErrorToast(intl);
            },
        });
    };

    const updateParticipant = (values: Requirement[]) => {
        const input = {
            values,
            participantToken: CookieMonster.getParticipantCookie(),
        };
        updateParticipantRequirementMutation.commit({
            variables: {
                input,
            },
            onCompleted: (response, errors) => {
                if (errors && errors.length > 0) {
                    return mutationErrorToast(intl);
                }
                goToNextStep();
            },
            onError: () => {
                return mutationErrorToast(intl);
            },
        });
    };

    const onSubmit = () => {
        checkboxes.forEach(requirement => {
            setValue(`checkboxes.${requirement.id}`, true);
        });

        const values = checkboxes.map(requirement => ({
            requirementId: requirement.id,
            value: true,
        }));

        if (isAuthenticated) {
            updateUser(values);
            return;
        }
        updateParticipant(values);
    };

    return (
        <>
            <ModalLayout
                header={
                    hideGoBackArrow
                        ? ({ intl, onClose, goBackCallback, logo, isMobile }) => (
                              <HideBackArrowLayout
                                  intl={intl}
                                  onClose={onClose}
                                  goBackCallback={goBackCallback}
                                  logo={logo}
                                  isMobile={isMobile}
                              />
                          )
                        : null
                }
                onClose={() => {}}
                title={intl.formatMessage({ id: 'youre-almost-there' })}
                info={intl.formatMessage({
                    id: 'the-project-owner-needs-you-to-accept-these-conditions',
                })}>
                <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
                    <Text mb={0} fontWeight={400}>
                        {intl.formatMessage(
                            { id: 'check-the-checkboxes' },
                            { num: checkboxes.length },
                        )}
                    </Text>
                    {checkboxes.map(requirement => {
                        return (
                            <FormControl
                                mb={0}
                                name={`checkboxes.${requirement.id}`}
                                control={control}
                                key={requirement.id}>
                                <FieldInput
                                    id={`checkboxes.${requirement.id}`}
                                    name={`checkboxes.${requirement.id}`}
                                    control={control}
                                    type="checkbox">
                                    <Text mb={0} fontWeight={400}>
                                        {requirement.label}
                                    </Text>
                                </FieldInput>
                            </FormControl>
                        );
                    })}
                    <Button
                        ref={buttonRef}
                        variantSize="big"
                        justifyContent="center"
                        width="100%"
                        type="submit"
                        mt={4}
                        isLoading={isLoading}>
                        {intl.formatMessage(
                            { id: 'check-everything-and-continue' },
                            { num: checkboxes.length },
                        )}
                    </Button>
                </Box>
            </ModalLayout>
        </>
    );
};

export default CheckboxesRequirementModal;
