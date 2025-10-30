export default new (class AdminModerationPage {
  get cy() {
    return cy
  }

  get proposalListPath() {
    return '/admin/capco/app/proposal/list'
  }

  visitProposalList() {
    return this.cy.visit(this.proposalListPath)
  }

  clickButtonFusion() {
    this.buttonFusion.click()
  }

  clickSubmitButton() {
    this.submitButton.click()
  }

  get buttonFusion() {
    return this.cy.get('#add-proposal-fusion')
  }

  fillProposalMergeForm(project: string) {
    this.cy.selectReactSetOption('#ProposalFusionForm-project', project)
    this.cy.wait(3000)
    this.proposals.click()
    this.cy.selectReactSetOption('#ProposalFusionForm-fromProposals', '')
    this.cy.wait(3000)
    this.cy.get('#ProposalFusionForm-fromProposals').click()
    this.cy.wait(3000)
    this.cy.selectReactSelectFirstOption('#ProposalFusionForm-fromProposals-menuList')
  }

  get proposals() {
    return this.cy.get('#ProposalFusionForm-fromProposals')
  }

  get submitButton() {
    return this.cy.get('#confirm-proposal-merge-create')
  }

  interceptRedirect({ path, redirectPath }: { path: string; redirectPath: string }) {
    cy.interceptGraphQLOperation({ operationName: 'NavbarRightQuery' })
    cy.intercept('GET', '/moderate/**').as('moderate')
    cy.visit(path, {
      failOnStatusCode: false,
    })

    cy.wait('@moderate', { timeout: 10000 }).then(interception => {
      const redirectUrl = interception?.response?.headers['location'] ?? ''
      cy.wrap(redirectUrl).should('equal', redirectPath)
    })

    cy.wait(`@NavbarRightQuery`, { timeout: 10000 })
  }
})()
