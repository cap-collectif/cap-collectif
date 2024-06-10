import { getParticipatoryBudgetAnalysisInput } from './ConfigureParticipatoryBudgetAnalysisInput'
import { PreConfigureProjectInput } from '@relay/PreConfigureProjectMutation.graphql'

const getParticipatoryBudgetInput = ({
  projectTitle,
  authors,
  intl,
  isNewBackOfficeEnabled,
}): PreConfigureProjectInput => {
  const { proposalForms, project } = getParticipatoryBudgetAnalysisInput({
    projectTitle,
    authors,
    intl,
    isNewBackOfficeEnabled,
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
