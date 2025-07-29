import { CollectStepFormQuery$data, MainView } from '@relay/CollectStepFormQuery.graphql'
import { FormTabs, FormTabsEnum } from './CollectStepContext'
import { FormValues, StepVisibilityTypeEnum } from '@components/BackOffice/Steps/CollectStep/CollectStepForm'
import { UpdateProposalFormMutation$variables } from '@relay/UpdateProposalFormMutation.graphql'
import {
  getStatusesInitialValues,
  getStatusesInputList,
} from '@components/BackOffice/Steps/ProposalStep/ProposalStepStatuses'
import { getDefaultRequirements, getRequirementsInput } from '@components/BackOffice/Requirements/Requirements'
import { getFormattedCategories } from '@components/BackOffice/Steps/CollectStep/ProposalFormAdminCategories'
import { StepDurationTypeEnum } from '../Shared/StepDurationInput'
import { formatQuestions, formatQuestionsInput, mergeQuestionsAndJumpsBeforeSubmit } from '../QuestionnaireStep/utils'
import { EnabledEnum } from '@components/BackOffice/Steps/Shared/PublicationInput'
import { getVoteParameterInput, voteTypeForTabs } from '../utils'
import { ProposalSort, StepStatusInput } from '@relay/UpdateCollectStepMutation.graphql'

export const getInitialValues = (
  step: CollectStepFormQuery$data['step'],
  stepId: string,
  bgColor: string,
): FormValues => {
  const stepDurationType = step?.timeless ? [StepDurationTypeEnum.TIMELESS] : [StepDurationTypeEnum.CUSTOM]
  const stepVisibilityType = step?.private ? [StepVisibilityTypeEnum.RESTRICTED] : [StepVisibilityTypeEnum.PUBLIC]
  const stepEnabledType = step?.enabled ? [EnabledEnum.PUBLISHED] : [EnabledEnum.DRAFT]

  return {
    requirementsReason: step?.requirements?.reason ?? '',
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
      allowAknowledge: step?.form?.allowAknowledge ?? false,
      usingFacebook: step?.form?.usingFacebook ?? false,
      usingWebPage: step?.form?.usingWebPage ?? false,
      usingTwitter: step?.form?.usingTwitter ?? false,
      usingInstagram: step?.form?.usingInstagram ?? false,
      usingYoutube: step?.form?.usingYoutube ?? false,
      usingLinkedIn: step?.form?.usingLinkedIn ?? false,
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
      questionnaire: {
        questions: step?.form?.questions ? formatQuestions({ questions: step?.form.questions }) : [],
        // @ts-ignore
        questionsWithJumps: step?.form?.questionsWithJumps ?? [],
      },
    },
    voteType: step?.voteType,
    // only used for display purposes
    _voteTypeForTabs: voteTypeForTabs(step),
    votesMin: step?.votesMin,
    votesLimit: step?.votesLimit,
    votesRanking: step?.votesRanking,
    budget: step?.budget,
    voteThreshold: step?.voteThreshold,
    secretBallot: step?.isSecretBallot,
    publishedVoteDate: step?.publishedVoteDate,
    votesHelpText: step?.votesHelpText,
    isProposalSmsVoteEnabled: step?.isProposalSmsVoteEnabled,
    proposalArchivedTime: step?.proposalArchivedTime,
    proposalArchivedUnitTime: step?.proposalArchivedUnitTime,
    // @ts-ignore relay lookup
    requirements: getDefaultRequirements(step),
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
    isCollectByEmailEnabled: step?.isCollectByEmailEnabled,
  }
}

export const getProposalFormUpdateVariablesInput = (
  formValues: FormValues['form'],
  selectedTab: FormTabs,
): Omit<UpdateProposalFormMutation$variables['input'], 'clientMutationId' | 'proposalFormId'> => {
  const mergedArr = mergeQuestionsAndJumpsBeforeSubmit(formValues.questionnaire)

  delete formValues.questionnaire

  return {
    proposalFormId: selectedTab === FormTabsEnum.NEW ? formValues.id : undefined,
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
    title: formValues.title,
    titleHelpText: formValues.titleHelpText,
    usingDistrict: formValues.usingDistrict,
    districtHelpText: formValues.districtHelpText,
    districtMandatory: formValues.districtMandatory,
    allowAknowledge: formValues?.allowAknowledge ?? false,
    usingFacebook: formValues?.usingFacebook ?? false,
    usingWebPage: formValues?.usingWebPage ?? false,
    usingTwitter: formValues?.usingTwitter ?? false,
    usingInstagram: formValues?.usingInstagram ?? false,
    usingYoutube: formValues?.usingYoutube ?? false,
    usingLinkedIn: formValues?.usingLinkedIn ?? false,
    districts: formValues.districts,
    // @ts-ignore
    categories: getFormattedCategories(formValues.categories),
    questions: formatQuestionsInput(mergedArr),
  }
}

export const getCollectStepInput = (
  formValues: FormValues,
  proposalFormId: string,
  stepId: string,
  bgColor: string,
) => {
  const statusesList = getStatusesInputList(formValues.statuses, bgColor)
  return {
    stepId: stepId,
    label: formValues.label,
    body: formValues.body,
    bodyUsingJoditWysiwyg: false,
    endAt: formValues.stepDurationType?.labels[0] === StepDurationTypeEnum.TIMELESS ? null : formValues.endAt,
    startAt: formValues.stepDurationType?.labels[0] === StepDurationTypeEnum.TIMELESS ? null : formValues.startAt,
    isEnabled: formValues.enabled.labels[0] === EnabledEnum.PUBLISHED,
    timeless: formValues.stepDurationType?.labels[0] === StepDurationTypeEnum.TIMELESS,
    metaDescription: formValues.metaDescription,
    customCode: formValues.customCode,
    requirementsReason: formValues.requirementsReason,
    mainView: formValues.mainView.labels[0] as MainView,
    statuses: statusesList as StepStatusInput[],
    defaultStatus: formValues.defaultStatus,
    defaultSort: formValues.defaultSort as ProposalSort,
    proposalForm: proposalFormId,
    isProposalSmsVoteEnabled: formValues.isProposalSmsVoteEnabled,
    allowAuthorsToAddNews: Boolean(formValues.allowAuthorsToAddNews),
    private: formValues.stepVisibilityType?.labels[0] === StepVisibilityTypeEnum.RESTRICTED,
    isCollectByEmailEnabled: formValues.isCollectByEmailEnabled ?? false,
    ...getRequirementsInput(formValues),
    ...getVoteParameterInput(formValues),
  }
}
