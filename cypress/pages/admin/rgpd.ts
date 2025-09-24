import { Base } from '..'

export default new (class RGPDPage {
  get cy() {
    return cy
  }

  visitProject() {
    Base.visit({
      path: `project/budget-participatif-rennes/collect/collecte-des-propositions`,
      withIntercept: true,
      operationName: 'ProposalListViewRefetchQuery',
    })
  }
})()
