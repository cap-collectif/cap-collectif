import { graphql, useMutation } from 'react-relay'
import { SaveImapConfigMutation } from '@relay/SaveImapConfigMutation.graphql'

const mutation = graphql`
  mutation SaveImapConfigMutation($input: SaveImapConfigInput!) {
    saveImapConfig(input: $input) {
      errorCode
      imapConfig {
        id
        serverUrl
        email
        folder
      }
    }
  }
`

export const useSaveImapConfigMutation = () => {
  const [commit, isLoading] = useMutation<SaveImapConfigMutation>(mutation)
  return {
    commit,
    isLoading,
  }
}
