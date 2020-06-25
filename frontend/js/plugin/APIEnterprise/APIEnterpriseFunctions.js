// @flow
import { commitLocalUpdate, fetchQuery } from 'react-relay';
import { type IntlShape } from 'react-intl';
import { checkRNA, checkSiret } from '~/services/Validator';
import environment from '~/createRelayEnvironment';
import colors from '~/utils/colors';
import {
  API_ENTERPRISE_ASSOC,
  API_ENTERPRISE_ASSOC_DOC,
  API_ENTERPRISE_ASSOC_DOC_RNA,
  API_ENTERPRISE_ASSOC_RNA,
  API_ENTERPRISE_DOC_ENTER,
  API_ENTERPRISE_DOC_PUB_ORGA,
  API_ENTERPRISE_ENTER,
  API_ENTERPRISE_PUB_ORGA,
  ASSOC_RNA_BASE_QUESTIONS,
  ASSOC_SIRET_BASE_QUESTIONS,
  autocompleteFromId,
  autocompleteFromSiret,
  BASE_QUESTIONS,
  dispatchValuesToForm,
  ENTER_BASE_QUESTIONS,
  fetchAPIDocuments,
  getMatchingObject,
  PUB_ORGA_BASE_QUESTIONS,
} from '~/plugin/APIEnterprise/APIEnterpriseConstants';
import type { Dispatch } from '~/types';
import type { Questions, ResponsesInReduxForm } from '~/components/Form/Form.type';

const INDEX_TYPE_QUESTION = 22;
const INDEX_RNA_QUESTION = 35;
const INDEX_ASSOC_SIRET_QUESTION = 24;
const INDEX_ENTER_QUESTION = 51;
const INDEX_PUB_ORGA_QUESTION = 63;

export const getApiEnterpriseType = (type: string): string => {
  switch (type.trim().toLowerCase()) {
    case 'une entreprise':
    case 'un autre organisme privé':
      return API_ENTERPRISE_ENTER;
    case 'une association':
      return API_ENTERPRISE_ASSOC;
    case 'un organisme public':
      return API_ENTERPRISE_PUB_ORGA;
    default:
      throw new Error('This type of enterprise is not handled currently.');
  }
};

const getSiretQuestionIndex = (type: ?string): number => {
  switch (type) {
    case API_ENTERPRISE_ASSOC:
      return INDEX_ASSOC_SIRET_QUESTION;
    case API_ENTERPRISE_ENTER:
      return INDEX_ENTER_QUESTION;
    case API_ENTERPRISE_PUB_ORGA:
      return INDEX_PUB_ORGA_QUESTION;
    default:
      return -1;
  }
};

export const recapFetchedInfoFromAPI = (
  questions: Questions,
  apiResult: Object,
  isRNA: boolean,
  type: string,
) => {
  const fieldArray = [];
  fieldArray.push(
    `<span style='color: ${colors.successColor}'>Pour faciliter le dépôt de votre dossier, les informations suivantes ont été récupérées ` +
      `automatiquement grâce à l’API Entreprise.<br>`,
  );

  for (const field in apiResult) {
    // eslint-disable-next-line no-prototype-builtins
    if (apiResult.hasOwnProperty(field)) {
      if (apiResult[field]) {
        let tmpStr;
        switch (field) {
          case 'availableSirenSituation':
            tmpStr = 'Avis de situation SIREN';
            break;
          case 'availableTurnover':
            tmpStr = "Chiffres d'affaires comptable";
            break;
          case 'availableKbis':
            tmpStr = 'Extrait KBIS';
            break;
          case 'availableCompositionCA':
            tmpStr = "Composition du conseil d'administration et du bureau";
            break;
          case 'availableStatus':
            tmpStr = 'Statuts en vigueur datés et signés';
            break;
          case 'availablePrefectureReceiptConfirm':
            tmpStr = 'Récépissé de la déclaration en préfecture';
            break;
          case 'availableFiscalRegulationAttestation':
            tmpStr = 'Attestation de régularité fiscale de moins de 3 mois';
            break;
          case 'availableSocialRegulationAttestation':
            tmpStr = 'Attestation de régularité sociale de moins de 3 mois';
            break;
          default:
            tmpStr = null;
            break;
        }
        if (tmpStr) {
          fieldArray.push(`- ${tmpStr}<br>`);
        }
      }
    }
  }
  fieldArray.push(
    'Ces informations sont confidentielles et ne seront accessibles qu’aux agents de la Région' +
      ' au moment de l’étude de votre dossier.</span>',
  );
  const fields = fieldArray.join('');
  const idIndex = isRNA ? INDEX_RNA_QUESTION : getSiretQuestionIndex(type);
  commitLocalUpdate(environment, store => {
    if (typeof questions[idIndex] !== 'undefined') {
      const question = store.get(questions[idIndex].id);
      if (question) {
        question.setValue(fields, 'description');
      }
    }
  });
};

const makeSiretQueries = (
  intl: IntlShape,
  dispatch: Dispatch,
  apiEnterpriseType: string,
  siret: string,
  questions: Questions,
  onlyVisibility: boolean = false,
) => {
  const params = { type: apiEnterpriseType, siret };

  const promiseMainInfo = new Promise(resolve => {
    fetchQuery(environment, autocompleteFromSiret, params).then(res => {
      dispatchValuesToForm(intl, dispatch, res, apiEnterpriseType, questions, onlyVisibility);
      resolve(getMatchingObject(res, apiEnterpriseType));
    });
  });

  const promiseDocInfo = new Promise(resolve => {
    if (apiEnterpriseType === API_ENTERPRISE_ASSOC) {
      fetchQuery(environment, fetchAPIDocuments, { id: siret, type: apiEnterpriseType }).then(
        doc => {
          dispatchValuesToForm(
            intl,
            dispatch,
            doc,
            API_ENTERPRISE_ASSOC_DOC,
            questions,
            onlyVisibility,
          );
          resolve(getMatchingObject(doc, API_ENTERPRISE_ASSOC_DOC));
        },
      );
    } else {
      const docQueryType =
        apiEnterpriseType === API_ENTERPRISE_ENTER
          ? API_ENTERPRISE_DOC_ENTER
          : API_ENTERPRISE_DOC_PUB_ORGA;
      fetchQuery(environment, fetchAPIDocuments, { id: siret, type: apiEnterpriseType }).then(
        doc => {
          dispatchValuesToForm(intl, dispatch, doc, docQueryType, questions, onlyVisibility);
          resolve(getMatchingObject(doc, docQueryType));
        },
      );
    }
  });

  Promise.all([promiseMainInfo, promiseDocInfo]).then(values => {
    recapFetchedInfoFromAPI(questions, { ...values[0], ...values[1] }, false, apiEnterpriseType);
  });
};

const makeRnaQueries = (
  intl: IntlShape,
  dispatch: Dispatch,
  id: string,
  questions: Questions,
  onlyVisibility: boolean = false,
) => {
  const promiseMainInfo = new Promise(resolve => {
    fetchQuery(environment, autocompleteFromId, { id }).then(res => {
      dispatchValuesToForm(
        intl,
        dispatch,
        res,
        API_ENTERPRISE_ASSOC_RNA,
        questions,
        onlyVisibility,
      );
      resolve(getMatchingObject(res, API_ENTERPRISE_ASSOC_RNA));
    });
  });

  const promiseDocInfo = new Promise(resolve => {
    fetchQuery(environment, fetchAPIDocuments, { id, type: API_ENTERPRISE_ASSOC }).then(res => {
      dispatchValuesToForm(
        intl,
        dispatch,
        res,
        API_ENTERPRISE_ASSOC_DOC_RNA,
        questions,
        onlyVisibility,
      );
      resolve(getMatchingObject(res, API_ENTERPRISE_ASSOC_DOC_RNA));
    });
  });

  Promise.all([promiseMainInfo, promiseDocInfo]).then(values => {
    recapFetchedInfoFromAPI(
      questions,
      { ...values[0], ...values[1] },
      true,
      API_ENTERPRISE_ASSOC_RNA,
    );
  });
};

export const TRIGGER_FOR: Array<string> = ['idf-bp-dedicated', 'dev'];

const getInvisibleQuestionIndexesAccordingToType = (
  defaultToHideQuestions: Array<number>,
  apiEnterpriseType: ?string,
) => {
  const assosQuestions = [...ASSOC_SIRET_BASE_QUESTIONS];
  const assosRnaQuestions = [...ASSOC_RNA_BASE_QUESTIONS];
  const enterprisesQuestions = [...ENTER_BASE_QUESTIONS];
  const pubOrgaQuestions = [...PUB_ORGA_BASE_QUESTIONS];
  switch (apiEnterpriseType) {
    case API_ENTERPRISE_ASSOC:
      return [...assosRnaQuestions, ...enterprisesQuestions, ...pubOrgaQuestions];
    case API_ENTERPRISE_ASSOC_RNA:
      return [...assosQuestions, ...enterprisesQuestions, ...pubOrgaQuestions];
    case API_ENTERPRISE_ENTER:
      return [...assosQuestions, ...assosRnaQuestions, ...pubOrgaQuestions];
    case API_ENTERPRISE_PUB_ORGA:
      return [...assosQuestions, ...assosRnaQuestions, ...enterprisesQuestions];
    default:
      return defaultToHideQuestions;
  }
};

const getSiretAccordingToType = (type: ?string, responses: ResponsesInReduxForm): ?string => {
  const index = getSiretQuestionIndex(type);
  if (index === -1) {
    return null;
  }
  // $FlowFixMe Error due to response type not giving good type among severals
  return responses[index] && responses[index].value;
};

export const handleVisibilityAccordingToType = (
  intl: IntlShape,
  dispatch: Dispatch,
  questions: Questions,
  responses: ResponsesInReduxForm,
) => {
  const type = $(
    `input[name="choices-for-field-proposal-form-responses${INDEX_TYPE_QUESTION}"]:checked`,
  ).val();
  const apiEnterpriseType =
    typeof type === 'undefined' || type == null ? null : getApiEnterpriseType(type);
  // The two following lines are using flowfix me because ResponseInReduxForm seems broken (see other uses)
  const siret: ?string = getSiretAccordingToType(apiEnterpriseType, responses);
  // $FlowFixMe
  const rna: ?string = responses[INDEX_RNA_QUESTION] && responses[INDEX_RNA_QUESTION].value;
  const defaultToHideQuestions = BASE_QUESTIONS;
  const isSiretNotValid = siret == null || (siret && !checkSiret(siret));
  const isRnaNotValid = rna == null || (rna && !checkRNA(rna));
  if (isSiretNotValid && isRnaNotValid) {
    // Need to hide all
    defaultToHideQuestions.forEach(questionIndex => {
      commitLocalUpdate(environment, store => {
        if (typeof responses[questionIndex] !== 'undefined') {
          const question = store.get(responses[questionIndex].question);
          if (question) {
            question.setValue(true, 'hidden');
          }
        }
      });
    });
    return;
  }
  // In this case, it's a draft that has been reopened
  // only show fields according to enterprise's type in case user change is mind

  if (apiEnterpriseType) {
    // Refetch to know which hidden fields should be visible again once modal reopen
    if (siret && !isSiretNotValid) {
      makeSiretQueries(intl, dispatch, apiEnterpriseType, siret, questions, true);
    }
    if (rna && !isRnaNotValid) {
      makeRnaQueries(intl, dispatch, rna, questions, true);
    }
  }

  const invisibleQuestionIndexes = getInvisibleQuestionIndexesAccordingToType(
    defaultToHideQuestions,
    apiEnterpriseType,
  );
  invisibleQuestionIndexes.forEach(questionIndex => {
    commitLocalUpdate(environment, store => {
      const question = store.get(responses[questionIndex].question);
      if (question) {
        question.setValue(true, 'hidden');
      }
    });
  });
};

// TODO @Vince utiliser quelque chose comme SyntheticEvent<> & { currentTarget: HTMLInputElement }
export const triggerAutocompleteAPIEnterprise = (
  dispatch: Dispatch,
  event: any,
  questions: Questions,
  intl: IntlShape,
) => {
  if (event && event.currentTarget) {
    if (event.currentTarget.getAttribute('type') === 'siret') {
      const text: ?string = event.currentTarget.value.replace(/\s/g, '');
      const type = $(
        `input[name="choices-for-field-proposal-form-responses${INDEX_TYPE_QUESTION}"]:checked`,
      ).val();
      const apiEnterpriseType = getApiEnterpriseType(type);

      if (text && checkSiret(text)) {
        makeSiretQueries(intl, dispatch, apiEnterpriseType, text, questions);
      }
    } else if (event.currentTarget.getAttribute('type') === 'rna') {
      const id: ?string = event.currentTarget.value.replace(/\s/g, '');
      if (id && checkRNA(id)) {
        makeRnaQueries(intl, dispatch, id, questions);
      }
    }
  }
};
