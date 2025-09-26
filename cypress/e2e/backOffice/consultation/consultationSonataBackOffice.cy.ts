describe('Consultation Sonata Back office', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.directLoginAs('admin')
  })

  it('An admin wants to create a consultation', () => {
    cy.visit('/admin/capco/app/consultation/create')
    cy.get("[type='text']").type('My consultation')
    cy.get("button[name='btn_create_and_edit']").click({ force: true })
    cy.contains('success.creation.flash {"name":"My consultation"}')
  })
})
