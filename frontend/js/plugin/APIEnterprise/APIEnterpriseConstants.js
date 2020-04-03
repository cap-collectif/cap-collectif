// @flow
import {graphql} from "react-relay";
import {change} from "redux-form";
import type {Dispatch} from '~/types';

const dispatchFromApi = (dispatch: Dispatch, formName: string, arr: Array<{key: string, value: ?string}>) => {
  arr.forEach((element: {key: string, value: ?string}) => {
    if (Array.isArray(element.value)){
      if (element.value.length > 0 && element.value[0] != null){
        dispatch(
          change(
            formName,
            element.key,
            element.value,
          ),
        );
      }
    } else if (element.value){
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

export const dispatchValuesToForm = (dispatch: Dispatch, object: Object, type: string,
                                     formName: string = "proposal-form") => {

  const obj = getMatchingObject(object, type);

  const orderedSiretAssocMapping: Array<{key: string, value: any}> = [
    {key: "responses.13.value", value : obj.corporateName},
    {key: "responses.14.value", value : obj.corporateAddress},
    {key: "responses.15.value", value : obj.legalRepresentative},
    {key: "responses.16.value", value : obj.qualityRepresentative},
    {key: "responses.17.value", value : [obj.sirenSituation]},
    {key: "responses.20.value", value : obj.turnover},
    {key: "responses.21.value", value : [obj.kbis]},
  ];

  const orderedRNAAssocMapping: Array<{key: string, value: any}> = [
    {key: "responses.28.value", value : obj.corporateName},
    {key: "responses.29.value", value : obj.corporateAddress},
    {key: "responses.30.value", value : [obj.legalRepresentative]},
    {key: "responses.31.value", value : [obj.qualityRepresentative]},
  ];

  const orderedEnterpriseMapping: Array<{key: string, value: any}> = [
    {key: "responses.45.value", value : obj.corporateName},
    {key: "responses.46.value", value : obj.corporateAddress},
    {key: "responses.47.value", value : obj.legalRepresentative},
    {key: "responses.48.value", value : obj.qualityRepresentative},
    {key: "responses.49.value", value : [obj.sirenSituation]},
    {key: "responses.52.value", value : obj.turnover},
  ];

  const orderedPublicOrgaMapping: Array<{key: string, value: any}> = [
    {key: "responses.57.value", value : obj.corporateName},
    {key: "responses.58.value", value : obj.corporateAddress},
    {key: "responses.59.value", value : [obj.legalRepresentative]},
    {key: "responses.60.value", value : [obj.qualityRepresentative]},
    {key: "responses.61.value", value : [obj.sirenSituation]},
  ];

  // DOCS
  const docAssocMapping: Array<{key: string, value: any}> = [
    {key: "responses.22.value", value : [obj.compositionCA]},
    {key: "responses.23.value", value : [obj.status]},
    {key: "responses.18.value", value : [obj.fiscalRegulationAttestation]},
    {key: "responses.19.value", value : [obj.socialRegulationAttestation]},
  ];

  const docAssocRNAMapping: Array<{key: string, value: any}> = [
    {key: "responses.32.value", value : [obj.compositionCA]},
    {key: "responses.33.value", value : [obj.status]},
    {key: "responses.34.value", value : [obj.prefectureReceiptConfirm]},
  ];

  const docEnterMapping: Array<{key: string, value: any}> = [
    {key: "responses.50.value", value : [obj.fiscalRegulationAttestation]},
    {key: "responses.51.value", value : [obj.socialRegulationAttestation]},
    {key: "responses.53.value", value : [obj.kbis]},
  ];

  const docPubOrgaMapping: Array<{key: string, value: any}> = [
    {key: "responses.62.value", value : [obj.kbis]},
  ];

  switch (type) {
    case API_ENTERPRISE_ASSOC:
      dispatchFromApi(dispatch, formName, orderedSiretAssocMapping);
      break;
    case API_ENTERPRISE_ASSOC_RNA:

      dispatchFromApi(dispatch, formName, orderedRNAAssocMapping);
      break;
    case API_ENTERPRISE_ENTER:
      dispatchFromApi(dispatch, formName, orderedEnterpriseMapping);
      break;
    case API_ENTERPRISE_PUB_ORGA:
      dispatchFromApi(dispatch, formName, orderedPublicOrgaMapping);
      break;
    case API_ENTERPRISE_ASSOC_DOC:
      dispatchFromApi(dispatch, formName, docAssocMapping);
      break;
    case API_ENTERPRISE_ASSOC_DOC_RNA:
      dispatchFromApi(dispatch, formName, docAssocRNAMapping);
      break;
    case API_ENTERPRISE_DOC_ENTER:
      dispatchFromApi(dispatch, formName, docEnterMapping);
      break;
    case API_ENTERPRISE_DOC_PUB_ORGA:
      dispatchFromApi(dispatch, formName, docPubOrgaMapping);
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
      qualityRepresentative
      legalRepresentative
      turnover
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
        siret
        corporateName
        corporateAddress
        qualityRepresentative
        legalRepresentative
        sirenSituation{
          id
          name
        }
        turnover
      }
      ... on APIEnterpriseEnterprise {
        corporateName
        corporateAddress
        qualityRepresentative
        legalRepresentative
        sirenSituation{
          id
          name
        }
        turnover
      }
      ... on APIEnterprisePublicOrganization {
        corporateName
        corporateAddress
        qualityRepresentative
        legalRepresentative
        sirenSituation {
          id 
          name
        }
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
        compositionCA{
          id
          name
        }
        status {
          id
          name
        }
        prefectureReceiptConfirm {
          id
          name
        }
        fiscalRegulationAttestation {
          id
          name
        }
        socialRegulationAttestation {
          id
          name
        }
        kbis {
          id
          name
        }
      }
    }
  }
`;
