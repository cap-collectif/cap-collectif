// @flow
import { commitLocalUpdate, fetchQuery } from 'react-relay';
import { checkRNA, checkSiret } from '~/services/Validator';
import environment from '~/createRelayEnvironment';
import {
  API_ENTERPRISE_ASSOC,
  API_ENTERPRISE_ASSOC_DOC,
  API_ENTERPRISE_ASSOC_DOC_RNA,
  API_ENTERPRISE_ASSOC_RNA,
  API_ENTERPRISE_DOC_ENTER,
  API_ENTERPRISE_DOC_PUB_ORGA,
  API_ENTERPRISE_ENTER,
  API_ENTERPRISE_PUB_ORGA,
  autocompleteFromId,
  autocompleteFromSiret,
  dispatchValuesToForm,
  fetchAPIDocuments,
} from '~/plugin/APIEnterprise/APIEnterpriseConstants';
import type { Dispatch } from '~/types';
import type { Questions, ResponsesInReduxForm } from '~/components/Form/Form.type';

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

const makeSiretQueries = (
  dispatch: Dispatch,
  apiEnterpriseType: string,
  siret: string,
  questions: Questions,
  onlyVisibility: boolean = false,
) => {
  const params = { type: apiEnterpriseType, siret };
  fetchQuery(environment, autocompleteFromSiret, params).then(res => {
    dispatchValuesToForm(dispatch, res, apiEnterpriseType, questions, onlyVisibility);
  });
  if (apiEnterpriseType === API_ENTERPRISE_ASSOC) {
    fetchQuery(environment, fetchAPIDocuments, { id: siret, type: apiEnterpriseType }).then(doc => {
      dispatchValuesToForm(dispatch, doc, API_ENTERPRISE_ASSOC_DOC, questions, onlyVisibility);
    });
  } else {
    const docQueryType =
      apiEnterpriseType === API_ENTERPRISE_ENTER
        ? API_ENTERPRISE_DOC_ENTER
        : API_ENTERPRISE_DOC_PUB_ORGA;
    fetchQuery(environment, fetchAPIDocuments, { id: siret, type: apiEnterpriseType }).then(doc => {
      dispatchValuesToForm(dispatch, doc, docQueryType, questions, onlyVisibility);
    });
  }
};

const makeRnaQueries = (
  dispatch: Dispatch,
  id: string,
  questions: Questions,
  onlyVisibility: boolean = false,
) => {
  fetchQuery(environment, autocompleteFromId, { id }).then(res => {
    dispatchValuesToForm(dispatch, res, API_ENTERPRISE_ASSOC_RNA, questions, onlyVisibility);
  });
  fetchQuery(environment, fetchAPIDocuments, { id, type: API_ENTERPRISE_ASSOC }).then(res => {
    dispatchValuesToForm(dispatch, res, API_ENTERPRISE_ASSOC_DOC_RNA, questions, onlyVisibility);
  });
};

export const TRIGGER_FOR = ['idf-bp-dedicated', 'dev', '10091-api-enterprise-part-2'];

const INDEX_TYPE_QUESTION = 19;
const INDEX_SIRET_QUESTION = 21;
const INDEX_RNA_QUESTION = 30;
const ASSO_SIRET_QUESTIONS = [22, 23, 24, 25];
const ASSO_RNA_QUESTIONS = [31, 32, 33, 34];
const ENTREPRISE_QUESTIONS = [46, 47, 48, 49];
const ORGA_PUBLIQUE_QUESTIONS = [58, 59, 60, 61];

const getInvisibleQuestionIndexesAccordingToType = (
  defaultToHideQuestions: Array<number>,
  apiEnterpriseType: string,
) => {
  const assosQuestions = [...ASSO_SIRET_QUESTIONS];
  const assosRnaQuestions = [...ASSO_RNA_QUESTIONS];
  const enterprisesQuestions = [...ENTREPRISE_QUESTIONS];
  const pubOrgaQuestions = [...ORGA_PUBLIQUE_QUESTIONS];
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

export const handleVisibilityAccordingToType = (
  dispatch: Dispatch,
  questions: Questions,
  responses: ResponsesInReduxForm,
) => {
  // The two following lines are using flowfix me because ResponseInReduxForm seems broken (see other uses)
  // $FlowFixMe
  const siret: ?string = responses[INDEX_SIRET_QUESTION] && responses[INDEX_SIRET_QUESTION].value;
  // $FlowFixMe
  const rna: ?string = responses[INDEX_RNA_QUESTION] && responses[INDEX_RNA_QUESTION].value;
  const defaultToHideQuestions = [
    ...ASSO_SIRET_QUESTIONS,
    ...ASSO_RNA_QUESTIONS,
    ...ENTREPRISE_QUESTIONS,
    ...ORGA_PUBLIQUE_QUESTIONS,
  ];
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
  const type = $(
    `input[name="choices-for-field-proposal-form-responses${INDEX_TYPE_QUESTION}"]:checked`,
  ).val();
  const apiEnterpriseType = getApiEnterpriseType(type);
  // Refetch to know which hidden fields should be visible again once modal reopen
  if (siret && !isSiretNotValid) {
    makeSiretQueries(dispatch, apiEnterpriseType, siret, questions, true);
  }
  if (rna && !isRnaNotValid) {
    makeRnaQueries(dispatch, rna, questions, true);
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
) => {
  if (event && event.currentTarget) {
    if (event.currentTarget.getAttribute('type') === 'siret') {
      const text: ?string = event.currentTarget.value.replace(/\s/g, '');
      const type = $(
        `input[name="choices-for-field-proposal-form-responses${INDEX_TYPE_QUESTION}"]:checked`,
      ).val();
      const apiEnterpriseType = getApiEnterpriseType(type);

      if (text && checkSiret(text)) {
        makeSiretQueries(dispatch, apiEnterpriseType, text, questions);
      }
    } else if (event.currentTarget.getAttribute('type') === 'rna') {
      const id: ?string = event.currentTarget.value.replace(/\s/g, '');
      if (id && checkRNA(id)) {
        makeRnaQueries(dispatch, id, questions);
      }
    }
  }
};
