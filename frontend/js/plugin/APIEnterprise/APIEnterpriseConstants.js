// @flow
import {graphql, commitLocalUpdate} from "react-relay";
import {change} from "redux-form";
import type {Dispatch} from '~/types';
import environment from '~/createRelayEnvironment';
import type {Questions} from "~/components/Form/Form.type";

const dispatchFromApi = (dispatch: Dispatch, formName: string, arr: Array<{ key?: string, questionNumber?: number,
  value: any }>, questions: Questions) => {
  arr.forEach((element: { key?: string, questionNumber?: number, value: ?string }) => {

    console.log("key", element.key, "number", element.questionNumber, "value", element.value);

    if (element?.questionNumber !== null && typeof element?.questionNumber !== 'undefined') {
      // Check if is not available thanks to API
      if (!element.value && element.questionNumber){
        const index = element.questionNumber;
        // Ask for user to complete
        commitLocalUpdate(environment, store => {
          const question = store.get(questions[index].id);
          if (question){
            question.setValue(false, 'hidden');
          }
        });
      }
    } else if (Array.isArray(element.value) && element.key) {

      if (element.value.length > 0 && element.value[0] != null) {
        dispatch(
          change(
            formName,
            element.key,
            element.value.length > 0 ? element.value : null,
          ),
        );
      }
    } else if (element.key && element.value) {
      dispatch(
        change(
          formName,
          element.key,
          element.value,
        ),
      );
    }
  });
};
export const API_ENTERPRISE_ENTER = 'ENTER';
export const API_ENTERPRISE_PUB_ORGA = 'PUB_ORGA';
export const API_ENTERPRISE_ASSOC = 'ASSOC';
export const API_ENTERPRISE_ASSOC_RNA = 'ASSOC_RNA';


export const API_ENTERPRISE_ASSOC_DOC = 'ASSOC_DOC';
export const API_ENTERPRISE_ASSOC_DOC_RNA = 'ASSOC_DOC_RNA';
export const API_ENTERPRISE_DOC_ENTER = 'DOC_ENTER';
export const API_ENTERPRISE_DOC_PUB_ORGA = 'DOC_PUB_ORGA';

const getMatchingObject = (object: Object, type: string) => {
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

const showAPIVisibleQuestions = (indexes: Array<number>, questions: Questions) => {
  indexes.forEach((index) =>{
    commitLocalUpdate(environment, store => {
      const question = store.get(questions[index].id);
      if (question){
        question.setValue(false, 'hidden');
      }
    });
  });
};

export const dispatchValuesToForm = (dispatch: Dispatch, object: Object, type: string, questions: Questions,
                                     formName: string = "proposal-form") => {

  const obj = getMatchingObject(object, type);

  const orderedSiretAssocMapping: Array<{ key?: string, questionNumber?: number, value: any }> = [
    {key: "responses.13.value", value: obj.corporateName},
    {key: "responses.14.value", value: obj.corporateAddress},

    {questionNumber: 17, value: obj.availableSirenSituation},
    {questionNumber: 20, value: obj.availableTurnover},
    {questionNumber: 21, value: obj.availableKbis},
  ];

  const orderedRNAAssocMapping: Array<{ key?: string, questionNumber?: number, value: any }> = [
    {key: "responses.28.value", value: obj.corporateName},
    {key: "responses.29.value", value: obj.corporateAddress},
  ];

  const orderedEnterpriseMapping: Array<{ key?: string, questionNumber?: number, value: any }> = [
    {key: "responses.45.value", value: obj.corporateName},
    {key: "responses.46.value", value: obj.corporateAddress},

    {questionNumber: 49, value : obj.availableSirenSituation},
    {questionNumber: 52, value : obj.availableTurnover},
  ];

  const orderedPublicOrgaMapping: Array<{ key?: string, questionNumber?: number, value: any }> = [
    {key: "responses.57.value", value: obj.corporateName},
    {key: "responses.58.value", value: obj.corporateAddress},

    {questionNumber: 61, value : obj.availableSirenSituation},
  ];

  // DOCS
  const docAssocMapping: Array<{ key?: string, questionNumber?: number, value: any }> = [
    {questionNumber: 22, value : obj.availableCompositionCA},
    {questionNumber: 23, value : obj.availableStatus},
    {questionNumber: 18, value : obj.availableFiscalRegulationAttestation},
    {questionNumber: 19, value : obj.availableSocialRegulationAttestation},
  ];

  const docAssocRNAMapping: Array<{ key?: string, questionNumber?: number, value: any }> = [
    {questionNumber: 32, value : obj.availableCompositionCA},
    {questionNumber: 33, value : obj.availableStatus},
    {questionNumber: 34, value : obj.availablePrefectureReceiptConfirm},
  ];

  const docEnterMapping: Array<{ key?: string, questionNumber?: number, value: any }> = [
    {questionNumber: 50, value : obj.availableFiscalRegulationAttestation},
    {questionNumber: 51, value : obj.availableSocialRegulationAttestation},
    {questionNumber: 53, value : obj.availableKbis},
  ];

  const docPubOrgaMapping: Array<{ key?: string, questionNumber?: number, value: any }> = [
    {questionNumber: 62, value : obj.availableKbis},
  ];

  switch (type) {
    case API_ENTERPRISE_ASSOC:
      showAPIVisibleQuestions([13, 14], questions);
      dispatchFromApi(dispatch, formName, orderedSiretAssocMapping, questions);
      break;
    case API_ENTERPRISE_ASSOC_RNA:
      showAPIVisibleQuestions([28, 29], questions);
      dispatchFromApi(dispatch, formName, orderedRNAAssocMapping, questions);
      break;
    case API_ENTERPRISE_ENTER:
      showAPIVisibleQuestions([45, 46], questions);
      dispatchFromApi(dispatch, formName, orderedEnterpriseMapping, questions);
      break;
    case API_ENTERPRISE_PUB_ORGA:
      showAPIVisibleQuestions([57, 58], questions);
      dispatchFromApi(dispatch, formName, orderedPublicOrgaMapping, questions);
      break;
    case API_ENTERPRISE_ASSOC_DOC:
      dispatchFromApi(dispatch, formName, docAssocMapping, questions);
      break;
    case API_ENTERPRISE_ASSOC_DOC_RNA:
      dispatchFromApi(dispatch, formName, docAssocRNAMapping, questions);
      break;
    case API_ENTERPRISE_DOC_ENTER:
      dispatchFromApi(dispatch, formName, docEnterMapping, questions);
      break;
    case API_ENTERPRISE_DOC_PUB_ORGA:
      dispatchFromApi(dispatch, formName, docPubOrgaMapping, questions);
      break;
    default:
      break;
  }
};

export const autocompleteFromId = graphql`
  query APIEnterpriseConstants_AutocompleteFromIdQuery(
    $id: String!
  ) {
    apiEnterpriseAutocompleteFromId(id: $id){
      corporateName
      corporateAddress
      availableTurnover
    }
  }
`;

export const autocompleteFromSiret = graphql`
  query APIEnterpriseConstants_AutocompleteFromSiretQuery(
    $type: APIEnterpriseType!
    $siret: String!
  ) {
    apiEnterpriseAutocompleteFromSiret(type: $type, siret: $siret){
      ... on APIEnterpriseAssociation {
        corporateName
        corporateAddress
        availableSirenSituation
        availableTurnover
      }
      ... on APIEnterpriseEnterprise {
        corporateName
        corporateAddress
        availableSirenSituation
        availableTurnover
      }
      ... on APIEnterprisePublicOrganization {
        corporateName
        corporateAddress
        availableSirenSituation
      }
    }
  }
`;

export const fetchAPIDocuments = graphql`
  query APIEnterpriseConstants_fetchAssociationDocQuery(
    $id: String!
    $type: APIEnterpriseType!
  ) {
    fetchAPIEnterpriseDocuments(id: $id, type: $type){
      ... on APIEnterpriseDocuments {
        availableCompositionCA
        availableStatus
        availablePrefectureReceiptConfirm
        availableFiscalRegulationAttestation
        availableSocialRegulationAttestation
        availableKbis
      }
    }
  }
`;
