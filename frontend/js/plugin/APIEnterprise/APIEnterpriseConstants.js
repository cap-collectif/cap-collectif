// @flow
import { graphql, commitLocalUpdate } from 'react-relay';
import { change } from 'redux-form';
import { type IntlShape } from 'react-intl';
import type { Dispatch } from '~/types';
import environment from '~/createRelayEnvironment';
import type { Questions } from '~/components/Form/Form.type';
import colors from '~/utils/colors';

export const ID_BP_1 = 'd6b98b9b-5e3c-11ea-8fab-0242ac110004';
export const ID_DEV = 'proposalformIdf';

export const API_ENTERPRISE_ENTER = 'ENTER';
export const API_ENTERPRISE_PUB_ORGA = 'PUB_ORGA';
export const API_ENTERPRISE_ASSOC = 'ASSOC';
export const API_ENTERPRISE_ASSOC_RNA = 'ASSOC_RNA';
export const API_ENTERPRISE_ASSOC_DOC = 'ASSOC_DOC';
export const API_ENTERPRISE_ASSOC_DOC_RNA = 'ASSOC_DOC_RNA';
export const API_ENTERPRISE_DOC_ENTER = 'DOC_ENTER';
export const API_ENTERPRISE_DOC_PUB_ORGA = 'DOC_PUB_ORGA';

export const ASSOC_SIRET_BASE_QUESTIONS = (id: string): Array<number> =>
  id === ID_DEV ? [25, 26, 27, 28] : [23, 24, 25, 26];
export const ASSOC_RNA_BASE_QUESTIONS = (id: string): Array<number> =>
  id === ID_DEV ? [36, 37, 38, 39] : [34, 35, 36, 37];
export const ENTER_BASE_QUESTIONS = (id: string): Array<number> =>
  id === ID_DEV ? [52, 53, 54, 55] : [50, 51, 52, 53];
export const PUB_ORGA_BASE_QUESTIONS = (id: string): Array<number> =>
  id === ID_DEV ? [64, 65, 66, 67] : [62, 63, 64, 65];
export const BASE_QUESTIONS = (id: string): Array<number> => [
  ...ASSOC_SIRET_BASE_QUESTIONS(id),
  ...ASSOC_RNA_BASE_QUESTIONS(id),
  ...ENTER_BASE_QUESTIONS(id),
  ...PUB_ORGA_BASE_QUESTIONS(id),
];

const PUB_ORGA_SIREN = (id: string) => (id === ID_DEV ? 68 : 66);
const ASSOC_SIRET_SIREN = (id: string) => (id === ID_DEV ? 29 : 27);
const ENTER_SIREN = (id: string) => (id === ID_DEV ? 56 : 54);
const ENTER_TURNOVER = (id: string) => (id === ID_DEV ? 59 : 57);
const ASSO_AVAILABLE_CA = (id: string) => (id === ID_DEV ? 30 : 28);
const ASSO_AVAILABLE_STATUS = (id: string) => (id === ID_DEV ? 31 : 29);

const isFieldModificableIfNoResult = (questionNumber: number, formId: string): boolean => {
  return BASE_QUESTIONS(formId).includes(questionNumber);
};

const dispatchFromApi = (
  dispatch: Dispatch,
  formName: string,
  arr: Array<{ responseNumber?: number, questionNumber?: number, value: any }>,
  questions: Questions,
  intl: IntlShape,
  onlyVisibility: boolean = false,
  formId: string,
) => {
  const positiveResultMessage = `<span style='color: ${colors.successColor}'>${intl.formatMessage({
    id: 'api.entreprise.result',
  })}</span>`;
  const negativeResultMessage = `<span style='color: ${colors.dangerColor}'>${intl.formatMessage({
    id: 'api.entreprise.no.result',
  })}</span>`;

  arr.forEach((element: { responseNumber?: number, questionNumber?: number, value: ?string }) => {
    const { responseNumber, value, questionNumber } = element;
    if (questionNumber != null && typeof questionNumber !== 'undefined') {
      // Check if is not available thanks to API
      if (!value) {
        // Ask for user to complete
        commitLocalUpdate(environment, store => {
          const question = store.get(questions[questionNumber].id);
          if (question) {
            question.setValue(false, 'hidden');
            question.setValue('', 'helpText');
            question.setValue(negativeResultMessage, 'description');
          }
        });
      } else {
        // Let the user know we've fetched the field for him
        commitLocalUpdate(environment, store => {
          const question = store.get(questions[questionNumber].id);
          if (question) {
            question.setValue(positiveResultMessage, 'description');
            question.setValue('', 'helpText');
          }
        });
      }
    } else if (!onlyVisibility) {
      if (responseNumber) {
        const isModificable = isFieldModificableIfNoResult(responseNumber, formId);
        if (!isModificable) return;
        if (
          (Array.isArray(value) && value.length > 0 && value[0] != null) ||
          (value && value !== '')
        ) {
          dispatch(change(formName, `responses.${responseNumber}.value`, value));
          commitLocalUpdate(environment, store => {
            const question = store.get(questions[responseNumber].id);
            if (question) {
              question.setValue(positiveResultMessage, 'description');
              question.setValue('', 'helpText');
              question.setValue(false, 'hidden');
            }
          });
        } else {
          commitLocalUpdate(environment, store => {
            const question = store.get(questions[responseNumber].id);
            if (question) {
              question.setValue(negativeResultMessage, 'description');
              question.setValue('', 'helpText');
              question.setValue(false, 'hidden');
            }
          });
        }
      }
    }
  });
};

export const getMatchingObject = (object: Object, type: string) => {
  switch (type) {
    case API_ENTERPRISE_ENTER:
    case API_ENTERPRISE_ASSOC:
    case API_ENTERPRISE_PUB_ORGA:
      return object.apiEnterpriseAutocompleteFromSiret;
    case API_ENTERPRISE_ASSOC_RNA:
      return object.apiEnterpriseAutocompleteFromId;
    case API_ENTERPRISE_ASSOC_DOC:
    case API_ENTERPRISE_ASSOC_DOC_RNA:
    case API_ENTERPRISE_DOC_PUB_ORGA:
    case API_ENTERPRISE_DOC_ENTER:
      return object.fetchAPIEnterpriseDocuments;
    default:
      throw new Error('Unknown type.');
  }
};
// Once data fetched, we must always show:
// Raison sociale
// Adresse du siège social
// Prénom et Nom du représentant légal
// Qualité du représentant légal
const showAPIVisibleQuestions = (intl: IntlShape, indexes: Array<number>, questions: Questions) => {
  const positiveResultMessage = `<span style='color: ${colors.successColor}'>${intl.formatMessage({
    id: 'api.entreprise.modificable.result',
  })}</span>`;

  indexes.forEach(value => {
    commitLocalUpdate(environment, store => {
      const question = store.get(questions[value].id);
      if (question) {
        question.setValue(positiveResultMessage, 'description');
        question.setValue('', 'helpText');
        question.setValue(false, 'hidden');
      }
    });
  });
};

export const dispatchValuesToForm = (
  intl: IntlShape,
  dispatch: Dispatch,
  object: Object,
  type: string,
  questions: Questions,
  onlyVisibility: boolean,
  formId: string,
) => {
  const formName = 'proposal-form';
  const obj = getMatchingObject(object, type);
  const orderedSiretAssocMapping: Array<{
    responseNumber?: number,
    questionNumber?: number,
    value: any,
  }> = [
    { responseNumber: ASSOC_SIRET_BASE_QUESTIONS(formId)[0], value: obj.corporateName },
    { responseNumber: ASSOC_SIRET_BASE_QUESTIONS(formId)[1], value: obj.corporateAddress },
    { responseNumber: ASSOC_SIRET_BASE_QUESTIONS(formId)[2], value: obj.legalRepresentative },
    { responseNumber: ASSOC_SIRET_BASE_QUESTIONS(formId)[3], value: obj.qualityRepresentative },
    { questionNumber: ASSOC_SIRET_SIREN(formId), value: obj.availableSirenSituation },
  ];

  const orderedRNAAssocMapping: Array<{
    responseNumber?: number,
    questionNumber?: number,
    value: any,
  }> = [
    { responseNumber: ASSOC_RNA_BASE_QUESTIONS(formId)[0], value: obj.corporateName },
    { responseNumber: ASSOC_RNA_BASE_QUESTIONS(formId)[1], value: obj.corporateAddress },
    { responseNumber: ASSOC_RNA_BASE_QUESTIONS(formId)[2], value: obj.legalRepresentative },
    { responseNumber: ASSOC_RNA_BASE_QUESTIONS(formId)[3], value: obj.qualityRepresentative },
  ];

  const orderedEnterpriseMapping: Array<{
    responseNumber?: number,
    questionNumber?: number,
    value: any,
  }> = [
    { responseNumber: ENTER_BASE_QUESTIONS(formId)[0], value: obj.corporateName },
    { responseNumber: ENTER_BASE_QUESTIONS(formId)[1], value: obj.corporateAddress },
    { responseNumber: ENTER_BASE_QUESTIONS(formId)[2], value: obj.legalRepresentative },
    { responseNumber: ENTER_BASE_QUESTIONS(formId)[3], value: obj.qualityRepresentative },
    { questionNumber: ENTER_SIREN(formId), value: obj.availableSirenSituation },
    { questionNumber: ENTER_TURNOVER(formId), value: obj.availableTurnover },
  ];

  const orderedPublicOrgaMapping: Array<{
    responseNumber?: number,
    questionNumber?: number,
    value: any,
  }> = [
    { responseNumber: PUB_ORGA_BASE_QUESTIONS(formId)[0], value: obj.corporateName },
    { responseNumber: PUB_ORGA_BASE_QUESTIONS(formId)[1], value: obj.corporateAddress },
    { responseNumber: PUB_ORGA_BASE_QUESTIONS(formId)[2], value: obj.legalRepresentative },
    { responseNumber: PUB_ORGA_BASE_QUESTIONS(formId)[3], value: obj.qualityRepresentative },
    { questionNumber: PUB_ORGA_SIREN(formId), value: obj.availableSirenSituation },
  ];

  /**
   *
   * DOCS
   *
   */

  const docAssocMapping: Array<{ responseNumber?: number, questionNumber?: number, value: any }> = [
    { questionNumber: ASSO_AVAILABLE_CA(formId), value: obj.availableCompositionCA },
    { questionNumber: ASSO_AVAILABLE_STATUS(formId), value: obj.availableStatus },
  ];

  const ASSO_RNA_CA = (id: string) => (id === ID_DEV ? 40 : 38);
  const ASSO_RNA_PREF_CONFIRM = (id: string) => (id === ID_DEV ? 41 : 39);
  const ASSO_RNA_STATUS = (id: string) => (id === ID_DEV ? 43 : 41);

  const docAssocRNAMapping: Array<{
    responseNumber?: number,
    questionNumber?: number,
    value: any,
  }> = [
    { questionNumber: ASSO_RNA_CA(formId), value: obj.availableCompositionCA },
    { questionNumber: ASSO_RNA_PREF_CONFIRM(formId), value: obj.availablePrefectureReceiptConfirm },
    { questionNumber: ASSO_RNA_STATUS(formId), value: obj.availableStatus },
  ];
  const ENTER_DISC_REG = (id: string) => (id === ID_DEV ? 57 : 55);
  const ENTER_SOCIAL_REG = (id: string) => (id === ID_DEV ? 58 : 56);
  const ENTER_KBIS = (id: string) => (id === ID_DEV ? 60 : 58);

  const docEnterMapping: Array<{ responseNumber?: number, questionNumber?: number, value: any }> = [
    { questionNumber: ENTER_DISC_REG(formId), value: obj.availableFiscalRegulationAttestation },
    { questionNumber: ENTER_SOCIAL_REG(formId), value: obj.availableSocialRegulationAttestation },
    { questionNumber: ENTER_KBIS(formId), value: obj.availableKbis },
  ];

  const docPubOrgaMapping: Array<{
    responseNumber?: number,
    questionNumber?: number,
    value: any,
  }> = [];

  let mapping;
  switch (type) {
    case API_ENTERPRISE_ASSOC:
      showAPIVisibleQuestions(intl, ASSOC_SIRET_BASE_QUESTIONS(formId), questions);
      mapping = orderedSiretAssocMapping;
      break;
    case API_ENTERPRISE_ASSOC_RNA:
      showAPIVisibleQuestions(intl, ASSOC_RNA_BASE_QUESTIONS(formId), questions);
      mapping = orderedRNAAssocMapping;
      break;
    case API_ENTERPRISE_ENTER:
      showAPIVisibleQuestions(intl, ENTER_BASE_QUESTIONS(formId), questions);
      mapping = orderedEnterpriseMapping;
      break;
    case API_ENTERPRISE_PUB_ORGA:
      showAPIVisibleQuestions(intl, PUB_ORGA_BASE_QUESTIONS(formId), questions);
      mapping = orderedPublicOrgaMapping;
      break;
    case API_ENTERPRISE_ASSOC_DOC:
      mapping = docAssocMapping;
      break;
    case API_ENTERPRISE_ASSOC_DOC_RNA:
      mapping = docAssocRNAMapping;
      break;
    case API_ENTERPRISE_DOC_ENTER:
      mapping = docEnterMapping;
      break;
    case API_ENTERPRISE_DOC_PUB_ORGA:
      mapping = docPubOrgaMapping;
      break;
    default:
      return;
  }
  dispatchFromApi(dispatch, formName, mapping, questions, intl, onlyVisibility, formName);
};

export const autocompleteFromId = graphql`
  query APIEnterpriseConstants_AutocompleteFromIdQuery($id: String!) {
    apiEnterpriseAutocompleteFromId(id: $id) {
      corporateName
      corporateAddress
    }
  }
`;

export const autocompleteFromSiret = graphql`
  query APIEnterpriseConstants_AutocompleteFromSiretQuery(
    $type: APIEnterpriseType!
    $siret: String!
  ) {
    apiEnterpriseAutocompleteFromSiret(type: $type, siret: $siret) {
      ... on APIEnterpriseAssociation {
        corporateName
        corporateAddress
        availableSirenSituation
        legalRepresentative
        qualityRepresentative
      }
      ... on APIEnterpriseEnterprise {
        corporateName
        corporateAddress
        availableSirenSituation
        availableTurnover
        legalRepresentative
        qualityRepresentative
      }
      ... on APIEnterprisePublicOrganization {
        corporateName
        corporateAddress
        availableSirenSituation
        legalRepresentative
        qualityRepresentative
      }
    }
  }
`;

export const fetchAPIDocuments = graphql`
  query APIEnterpriseConstants_fetchAssociationDocQuery($id: String!, $type: APIEnterpriseType!) {
    fetchAPIEnterpriseDocuments(id: $id, type: $type) {
      availableCompositionCA
      availableStatus
      availablePrefectureReceiptConfirm
      availableFiscalRegulationAttestation
      availableSocialRegulationAttestation
      availableKbis
    }
  }
`;
