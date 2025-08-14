import { graphql, useMutation } from 'react-relay'
import {
  ValidateContributionMutation
} from '~relay/ValidateContributionMutation.graphql';

const mutation = graphql`
    mutation ValidateContributionMutation($input: ValidateContributionInput!) {
        validateContribution(input: $input) {
            redirectUrl
        }
    }
`;
export const useValidateContributionMutation = () => {
  const [commit, isLoading] = useMutation<ValidateContributionMutation>(mutation)

  return {
    commit,
    isLoading
  }

}
