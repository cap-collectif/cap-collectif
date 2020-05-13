// @flow
import { graphql, commitLocalUpdate } from 'react-relay';
import { change } from 'redux-form';
import { type IntlShape } from 'react-intl';
import type { Dispatch } from '~/types';
import environment from '~/createRelayEnvironment';
import type { Questions } from '~/components/Form/Form.type';
import colors from '~/utils/colors';

export const API_ENTERPRISE_ENTER = 'ENTER';
export const API_ENTERPRISE_PUB_ORGA = 'PUB_ORGA';
export const API_ENTERPRISE_ASSOC = 'ASSOC';
export const API_ENTERPRISE_ASSOC_RNA = 'ASSOC_RNA';
export const API_ENTERPRISE_ASSOC_DOC = 'ASSOC_DOC';
export const API_ENTERPRISE_ASSOC_DOC_RNA = 'ASSOC_DOC_RNA';
export const API_ENTERPRISE_DOC_ENTER = 'DOC_ENTER';
export const API_ENTERPRISE_DOC_PUB_ORGA = 'DOC_PUB_ORGA';

export const ASSOC_SIRET_BASE_QUESTIONS = [23, 24, 25, 26];
export const ASSOC_RNA_BASE_QUESTIONS = [34, 35, 36, 37];
export const ENTER_BASE_QUESTIONS = [50, 51, 52, 53];
export const PUB_ORGA_BASE_QUESTIONS = [62, 63, 64, 65];
export const BASE_QUESTIONS: Array<number> = [
  ...ASSOC_SIRET_BASE_QUESTIONS,
  ...ASSOC_RNA_BASE_QUESTIONS,
  ...ENTER_BASE_QUESTIONS,
  ...PUB_ORGA_BASE_QUESTIONS,
];

const isFieldModificableIfNoResult = (questionNumber: number): boolean => {
  return BASE_QUESTIONS.includes(questionNumber);
};

const dispatchFromApi = (
  dispatch: Dispatch,
  formName: string,
  arr: Array<{ responseNumber?: number, questionNumber?: number, value: any }>,
  questions: Questions,
  intl: IntlShape,
  onlyVisibility: boolean = false,
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
        const isModificable = isFieldModificableIfNoResult(responseNumber);
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
  formName: string = 'proposal-form',
) => {
  const obj = getMatchingObject(object, type);
  const orderedSiretAssocMapping: Array<{
    responseNumber?: number,
    questionNumber?: number,
    value: any,
  }> = [
    { responseNumber: ASSOC_SIRET_BASE_QUESTIONS[0], value: obj.corporateName },
    { responseNumber: ASSOC_SIRET_BASE_QUESTIONS[1], value: obj.corporateAddress },
    { responseNumber: ASSOC_SIRET_BASE_QUESTIONS[2], value: obj.legalRepresentative },
    { responseNumber: ASSOC_SIRET_BASE_QUESTIONS[3], value: obj.qualityRepresentative },
    { questionNumber: 27, value: obj.availableSirenSituation },
  ];

  const orderedRNAAssocMapping: Array<{
    responseNumber?: number,
    questionNumber?: number,
    value: any,
  }> = [
    { responseNumber: ASSOC_RNA_BASE_QUESTIONS[0], value: obj.corporateName },
    { responseNumber: ASSOC_RNA_BASE_QUESTIONS[1], value: obj.corporateAddress },
    { responseNumber: ASSOC_RNA_BASE_QUESTIONS[2], value: obj.legalRepresentative },
    { responseNumber: ASSOC_RNA_BASE_QUESTIONS[3], value: obj.qualityRepresentative },
  ];

  const orderedEnterpriseMapping: Array<{
    responseNumber?: number,
    questionNumber?: number,
    value: any,
  }> = [
    { responseNumber: ENTER_BASE_QUESTIONS[0], value: obj.corporateName },
    { responseNumber: ENTER_BASE_QUESTIONS[1], value: obj.corporateAddress },
    { responseNumber: ENTER_BASE_QUESTIONS[2], value: obj.legalRepresentative },
    { responseNumber: ENTER_BASE_QUESTIONS[3], value: obj.qualityRepresentative },
    { questionNumber: 54, value: obj.availableSirenSituation },
    { questionNumber: 57, value: obj.availableTurnover },
  ];

  const orderedPublicOrgaMapping: Array<{
    responseNumber?: number,
    questionNumber?: number,
    value: any,
  }> = [
    { responseNumber: PUB_ORGA_BASE_QUESTIONS[0], value: obj.corporateName },
    { responseNumber: PUB_ORGA_BASE_QUESTIONS[1], value: obj.corporateAddress },
    { responseNumber: PUB_ORGA_BASE_QUESTIONS[2], value: obj.legalRepresentative },
    { responseNumber: PUB_ORGA_BASE_QUESTIONS[3], value: obj.qualityRepresentative },
    { questionNumber: 66, value: obj.availableSirenSituation },
  ];

  /**
   *
   * DOCS
   *
   */

  const docAssocMapping: Array<{ responseNumber?: number, questionNumber?: number, value: any }> = [
    { questionNumber: 28, value: obj.availableCompositionCA },
    { questionNumber: 29, value: obj.availableStatus },
  ];

  const docAssocRNAMapping: Array<{
    responseNumber?: number,
    questionNumber?: number,
    value: any,
  }> = [
    { questionNumber: 38, value: obj.availableCompositionCA },
    { questionNumber: 39, value: obj.availablePrefectureReceiptConfirm },
    { questionNumber: 41, value: obj.availableStatus },
  ];

  const docEnterMapping: Array<{ responseNumber?: number, questionNumber?: number, value: any }> = [
    { questionNumber: 55, value: obj.availableFiscalRegulationAttestation },
    { questionNumber: 56, value: obj.availableSocialRegulationAttestation },
    { questionNumber: 58, value: obj.availableKbis },
  ];

  const docPubOrgaMapping: Array<{
    responseNumber?: number,
    questionNumber?: number,
    value: any,
  }> = [];

  let mapping;
  switch (type) {
    case API_ENTERPRISE_ASSOC:
      showAPIVisibleQuestions(intl, ASSOC_SIRET_BASE_QUESTIONS, questions);
      mapping = orderedSiretAssocMapping;
      break;
    case API_ENTERPRISE_ASSOC_RNA:
      showAPIVisibleQuestions(intl, ASSOC_RNA_BASE_QUESTIONS, questions);
      mapping = orderedRNAAssocMapping;
      break;
    case API_ENTERPRISE_ENTER:
      showAPIVisibleQuestions(intl, ENTER_BASE_QUESTIONS, questions);
      mapping = orderedEnterpriseMapping;
      break;
    case API_ENTERPRISE_PUB_ORGA:
      showAPIVisibleQuestions(intl, PUB_ORGA_BASE_QUESTIONS, questions);
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
  dispatchFromApi(dispatch, formName, mapping, questions, intl, onlyVisibility);
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
