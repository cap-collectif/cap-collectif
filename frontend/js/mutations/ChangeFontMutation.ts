// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type { ChangeFontMutationVariables, ChangeFontMutationResponse } from '~relay/ChangeFontMutation.graphql'

const mutation = graphql`
  mutation ChangeFontMutation($input: ChangeFontInput!) {
    changeFont(input: $input) {
      fonts {
        ...FontAdminContent_fonts
      }
    }
  }
`

const sharedUpdater = (variables, store) => {
  const rootStore = store.getRoot()
  const fonts = rootStore.getLinkedRecords('fonts')
  const {
    input: { heading, body },
  } = variables
  fonts.filter(Boolean).map(f => {
    f.setValue(f.getValue('id') === heading, 'useAsHeading')
    f.setValue(f.getValue('id') === body, 'useAsBody')
    return f
  })
}

const commit = (variables: ChangeFontMutationVariables): Promise<ChangeFontMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticUpdater: store => sharedUpdater(variables, store),
    updater: store => sharedUpdater(variables, store),
  })

export default {
  commit,
}
