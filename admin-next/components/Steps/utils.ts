import {IntlShape} from "react-intl";
import {mutationErrorToast} from "@utils/mutation-error-toast";
import DeleteStepMutation from "@mutations/DeleteStepMutation";

export const onBack = async (adminAlphaUrl: string | null | undefined, isEditing: boolean, stepId: string, intl: IntlShape) => {
    if (!adminAlphaUrl) {
        return;
    }

    if (isEditing) {
        window.location.href = adminAlphaUrl;
        return;
    }

    try {
        await DeleteStepMutation.commit({input: {stepId, deleteRelatedResource: true}});
        window.location.href = adminAlphaUrl;
    } catch (error) {
        return mutationErrorToast(intl);
    }
}