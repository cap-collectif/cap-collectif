// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateProposalFormMutationVariables,
  UpdateProposalFormMutationResponse
} from './__generated__/UpdateProposalFormMutation.graphql';

const mutation = graphql`
  mutation UpdateProposalFormMutation($input: UpdateProposalFormInput!) {
    updateProposalForm(input: $input) {
      proposalForm {
        id
        description
        usingThemes
        themeMandatory
        usingCategories
        categoryMandatory
        usingAddress
        latMap
        lngMap
        zoomMap
        proposalInAZoneRequired
        illustrationHelpText
        addressHelpText
        themeHelpText
        categoryHelpText
        descriptionHelpText
        summaryHelpText
        titleHelpText
        usingDistrict
        districtHelpText
        districtMandatory
        districts {
          id
          name
          displayedOnMap
          geojson
        }
        categories {
          id
          name
        }
        questions {
          id
          title
          helpText
          type
          private
          required
          position
          kind
        }
      }
    }
  }
`;

const commit = (
  variables: UpdateProposalFormMutationVariables
): Promise<UpdateProposalFormMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables
  });

export default { commit };
