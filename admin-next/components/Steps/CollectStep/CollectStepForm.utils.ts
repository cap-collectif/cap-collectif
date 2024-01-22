import {
    EnabledEnum,
    FormValues,
    StepDurationTypeEnum,
    StepVisibilityTypeEnum,
} from '@components/Steps/CollectStep/CollectStepForm';
import { CollectStepFormQueryResponse } from '@relay/CollectStepFormQuery.graphql';
import { UpdateProposalFormMutationVariables } from '@relay/UpdateProposalFormMutation.graphql';
import {
    getStatusesInitialValues,
    getStatusesInputList,
} from '@components/Steps/CollectStep/CollectStepStatusesList';
import {getDefaultRequirements, getRequirementsInput} from '@components/Requirements/Requirements';
import { getFormattedCategories } from '@components/Steps/CollectStep/ProposalFormAdminCategories';

export const getInitialValues = (
    step: CollectStepFormQueryResponse['step'],
    stepId: string,
    bgColor: string,
): FormValues => {
    const stepDurationType = step?.timeless
        ? [StepDurationTypeEnum.TIMELESS]
        : [StepDurationTypeEnum.CUSTOM];
    const stepVisibilityType = step?.private
        ? [StepVisibilityTypeEnum.RESTRICTED]
        : [StepVisibilityTypeEnum.PUBLIC];
    const stepEnabledType = step?.enabled ? [EnabledEnum.PUBLISHED] : [EnabledEnum.DRAFT];
    return {
        requirementsReason: '',
        id: stepId,
        label: step?.label ?? '',
        body: step?.body ?? '',
        title: step?.title ?? '',
        startAt: step?.timeRange?.startAt ?? null,
        endAt: step?.timeRange?.endAt ?? null,
        timeless: step?.timeless ?? false,
        stepDurationType: {
            labels: stepDurationType,
        },
        form: {
            id: step?.form?.id ?? null,
            title: step?.form?.title ?? null,
            titleHelpText: step?.form?.titleHelpText ?? null,
            usingSummary: step?.form?.usingSummary ?? false,
            summaryHelpText: step?.form?.summaryHelpText ?? null,
            usingDescription: step?.form?.usingDescription ?? false,
            description: step?.form?.description ?? null,
            usingIllustration: step?.form?.usingIllustration ?? false,
            illustrationHelpText: step?.form?.illustrationHelpText ?? null,
            usingThemes: step?.form?.usingThemes ?? false,
            themeHelpText: step?.form?.themeHelpText ?? null,
            themeMandatory: step?.form?.themeMandatory ?? false,
            usingCategories: step?.form?.usingCategories ?? false,
            categories:
                step?.form?.categories?.map(category => ({
                    ...category,
                    // color: category.color.replace('#', 'COLOR_').toUpperCase(),
                    // icon: !!category.icon ? category.icon.toUpperCase().replace(/-/g, '_') : null,
                })) ?? null,
            categoryMandatory: step?.form?.categoryMandatory ?? false,
            usingAddress: step?.form?.usingAddress ?? false,
            addressHelpText: step?.form?.addressHelpText ?? null,
            usingDistrict: step?.form?.usingDistrict ?? false,
            // @ts-ignore
            districts: step?.form?.usingDistrict
                ? step?.form?.districts.map(district => ({
                      id: district.id,
                      geojson: district.geojson,
                      displayedOnMap: district.displayedOnMap,
                      border: {
                          color: district?.border?.color,
                          opacity: district?.border?.opacity,
                          size: district?.border?.size,
                      },
                      background: {
                          color: district?.background?.color,
                          opacity: district?.background?.opacity,
                      },
                      translations: district.translations,
                  }))
                : [],
            districtHelpText: step?.form?.districtHelpText ?? null,
            districtMandatory: step?.form?.districtMandatory ?? false,
            isGridViewEnabled: step?.form?.isGridViewEnabled ?? false,
            isListViewEnabled: step?.form?.isListViewEnabled ?? false,
            isMapViewEnabled: step?.form?.isMapViewEnabled ?? false,
            zoomMap: String(step?.form?.zoomMap) || null,
            mapCenter: step?.form?.mapCenter,
            descriptionMandatory: step?.form?.descriptionMandatory ?? false,
            categoryHelpText: step?.form?.categoryHelpText ?? null,
            descriptionHelpText: step?.form?.descriptionHelpText ?? null,
            canContact: step?.form?.canContact,
            proposalInAZoneRequired: step?.form?.proposalInAZoneRequired || false,
        },
        voteType: step?.voteType,
        votesMin: step?.votesMin,
        votesLimit: step?.votesLimit,
        votesRanking: step?.votesRanking,
        budget: step?.budget,
        voteThreshold: step?.voteThreshold,
        secretBallot: step?.isSecretBallot,
        publishedVoteDate: step?.publishedVoteDate,
        votesHelpText: step?.votesHelpText,
        isProposalSmsVoteEnabled: step.isProposalSmsVoteEnabled,
        proposalArchivedTime: step.proposalArchivedTime,
        proposalArchivedUnitTime: step.proposalArchivedUnitTime,
        requirements: getDefaultRequirements(step),
        // @ts-ignore
        statuses: getStatusesInitialValues(step?.statuses, bgColor),
        defaultStatus: step?.defaultStatus ? step?.defaultStatus.id : null,
        allowAuthorsToAddNews: step?.allowAuthorsToAddNews,
        defaultSort: step?.defaultSort?.toUpperCase(),
        stepVisibilityType: {
            labels: stepVisibilityType,
        },
        private: step?.private,
        mainView: {
            labels: [step?.mainView],
        },
        metaDescription: step?.metaDescription || '',
        customCode: step?.customCode || '',
        enabled: {
            labels: stepEnabledType,
        },
    };
};

export const getProposalFormUpdateVariablesInput = (
    formValues: FormValues['form'],
): Omit<UpdateProposalFormMutationVariables['input'], 'clientMutationId' | 'proposalFormId'> => {
    return {
        proposalFormId: formValues.id,
        description: formValues.description,
        descriptionUsingJoditWysiwyg: false,
        usingThemes: formValues.usingThemes,
        themeMandatory: formValues.themeMandatory,
        usingCategories: formValues.usingCategories,
        categoryMandatory: formValues.categoryMandatory,
        usingAddress: formValues.usingAddress,
        usingDescription: formValues.usingDescription,
        usingSummary: formValues.usingSummary,
        usingIllustration: formValues.usingIllustration,
        descriptionMandatory: formValues.descriptionMandatory,
        canContact: formValues.canContact,
        mapCenter: formValues.mapCenter?.json,
        zoomMap: Number(formValues.zoomMap),
        isGridViewEnabled: formValues.isGridViewEnabled,
        isMapViewEnabled: formValues.isMapViewEnabled,
        isListViewEnabled: formValues.isListViewEnabled,
        proposalInAZoneRequired: formValues.proposalInAZoneRequired,
        illustrationHelpText: formValues.illustrationHelpText,
        addressHelpText: formValues.addressHelpText,
        themeHelpText: formValues.themeHelpText,
        categoryHelpText: formValues.categoryHelpText,
        descriptionHelpText: formValues.descriptionHelpText,
        summaryHelpText: formValues.summaryHelpText,
        titleHelpText: formValues.titleHelpText,
        usingDistrict: formValues.usingDistrict,
        districtHelpText: formValues.districtHelpText,
        districtMandatory: formValues.districtMandatory,
        allowAknowledge: true,
        usingFacebook: true,
        usingWebPage: true,
        usingTwitter: true,
        usingInstagram: true,
        usingYoutube: true,
        usingLinkedIn: false,
        districts: formValues.districts,
        // @ts-ignore
        categories: getFormattedCategories(formValues.categories),
        questions: null,
    };
};

export const getCollectStepInput = (
    formValues: FormValues,
    proposalFormId: string,
    stepId: string,
    bgColor: string,
) => {
    const statusesList = getStatusesInputList(formValues.statuses, bgColor);
    return {
        stepId: stepId,
        label: formValues.label,
        body: formValues.body,
        bodyUsingJoditWysiwyg: false,
        endAt:
            formValues.stepDurationType?.labels[0] === StepDurationTypeEnum.TIMELESS
                ? null
                : formValues.endAt,
        startAt:
            formValues.stepDurationType?.labels[0] === StepDurationTypeEnum.TIMELESS
                ? null
                : formValues.startAt,
        isEnabled: formValues.enabled.labels[0] === EnabledEnum.PUBLISHED,
        timeless: formValues.stepDurationType?.labels[0] === StepDurationTypeEnum.TIMELESS,
        metaDescription: formValues.metaDescription,
        customCode: formValues.customCode,
        requirementsReason: formValues.requirementsReason,
        mainView: formValues.mainView.labels[0],
        statuses: statusesList,
        defaultStatus: formValues.defaultStatus,
        defaultSort: formValues.defaultSort,
        proposalForm: proposalFormId,
        votesHelpText: formValues.votesHelpText,
        votesMin: formValues.votesMin,
        votesLimit: formValues.votesLimit,
        votesRanking: formValues.votesRanking,
        voteThreshold: formValues.voteThreshold,
        isProposalSmsVoteEnabled: formValues.isProposalSmsVoteEnabled,
        proposalArchivedTime: formValues.proposalArchivedTime,
        proposalArchivedUnitTime: formValues.proposalArchivedUnitTime,

        allowAuthorsToAddNews: Boolean(formValues.allowAuthorsToAddNews),
        budget: formValues.budget,
        publishedVoteDate: formValues.publishedVoteDate,
        private: formValues.stepVisibilityType?.labels[0] === StepVisibilityTypeEnum.RESTRICTED,
        voteType: formValues.voteType,
        secretBallot: formValues.secretBallot,
        ...getRequirementsInput(formValues),
    };
};
