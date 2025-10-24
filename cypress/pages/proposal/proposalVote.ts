import { Base } from '..'

export default new (class ProposalVote {
  get cy() {
    return cy
  }

  visitSelection({
    projectSlug,
    stepSlug,
    operationName,
  }: {
    projectSlug: string
    stepSlug: string
    operationName: string
  }) {
    Base.visit({ path: `/project/${projectSlug}/selection/${stepSlug}`, operationName })
  }

  visitProposal({
    projectSlug,
    stepSlug,
    proposalSlug,
    operationName,
  }: {
    projectSlug: string
    stepSlug: string
    proposalSlug: string
    operationName: string
  }) {
    Base.visit({ path: `/project/${projectSlug}/selection/${stepSlug}/proposals/${proposalSlug}`, operationName })
  }

  visitCollect({
    projectSlug,
    stepSlug,
    proposalSlug,
    operationName,
  }: {
    projectSlug: string
    stepSlug: string
    proposalSlug: string
    operationName: string
  }) {
    Base.visit({ path: `/project/${projectSlug}/collect/${stepSlug}/proposals/${proposalSlug}`, operationName })
  }
})()
