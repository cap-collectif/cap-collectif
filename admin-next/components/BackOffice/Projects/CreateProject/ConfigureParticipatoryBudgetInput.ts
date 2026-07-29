import { getParticipatoryBudgetAnalysisInput } from './ConfigureParticipatoryBudgetAnalysisInput'
import { PreConfigureProjectInput } from '@relay/PreConfigureProjectMutation.graphql'

const getParticipatoryBudgetInput = ({
  projectTitle,
  authors,
  intl,
  isNewBackOfficeEnabled,
  isSsoByPassAuthEnabled,
}): PreConfigureProjectInput => {
  const { proposalForms, project } = getParticipatoryBudgetAnalysisInput({
    projectTitle,
    authors,
    intl,
    isNewBackOfficeEnabled,
    isSsoByPassAuthEnabled,
  })

  const updatedInput = {
    proposalForms: [...proposalForms],
    project: {
      ...project,
    },
  }

  return updatedInput
}

export { getParticipatoryBudgetInput }
