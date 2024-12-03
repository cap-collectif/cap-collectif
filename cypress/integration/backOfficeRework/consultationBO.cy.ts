import { AdminConsultationPage } from '~e2e/pages'

describe('Consultation back office', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'unstable__new_create_project')
    cy.directLoginAs('super_admin')
  })

  it('should update the step when editing a existing consultation', () => {
    AdminConsultationPage.visitConsultationPage()
    AdminConsultationPage.fillLabel('label')
    AdminConsultationPage.fillDescription('description')
    AdminConsultationPage.addSection()
    AdminConsultationPage.getSectionsList().children().should('have.length', 4)
    AdminConsultationPage.getSectionItem(0, 3).contains('project.preview.action.participe')
    AdminConsultationPage.editSection(0, 0, {
      title: 'titre',
      description: 'description',
      contribuable: true,
      versionable: true,
      sourceable: true,
      subtitle: 'sous titre',
      filter: 'global.random',
      helpText: "texte d'aide",
    })
    AdminConsultationPage.getSectionItem(0, 0).contains('titre')
    AdminConsultationPage.save()
  })

  // uncomment when we fix toggle in test env
  // it('should update the step with 2 consultations', () => {
  //   cy.task('enable:feature', 'multi_consultations')
  //   AdminConsultationPage.visitConsultationPage()
  //   AdminConsultationPage.getAppendConsultationButton().click()
  //   AdminConsultationPage.getConsultationList().should('have.length', 2)
  //   AdminConsultationPage.getSaveButton().should('be.disabled')
  //   AdminConsultationPage.fillConsultation(1, {
  //     title: 'consultation numéro 2',
  //     description: 'description de la consultation numéro 2',
  //   })
  //   AdminConsultationPage.save()
  // })

  it('should create the step with an existing consultation model', () => {
    AdminConsultationPage.visitConsultationPage('CREATE')
    AdminConsultationPage.fillModel(0, "Stratégie technologique de l'Etat et services publics - Simple")
    AdminConsultationPage.getSectionsList(0, 'MODEL').children().should('have.length', 2)
    AdminConsultationPage.getAppendSectionButton(0).click()
    AdminConsultationPage.save()
    AdminConsultationPage.visitConsultationPage()
    cy.wait('@ConsultationStepFormQuery')
    AdminConsultationPage.getSectionsList(0, 'EDIT').children().should('have.length', 3)
  })

  it('should remove subsections if parent section is removed', () => {
    AdminConsultationPage.visitConsultationPage('CREATE')
    AdminConsultationPage.fillModel(0, 'Projet de loi Renseignement - Projet de loi')

    cy.get('[aria-labelledby=MODEL-0] .section-item').should('have.length', 20)
    AdminConsultationPage.getSectionDeleteButton(0, 1, 'MODEL').click()
    cy.get('[aria-labelledby=MODEL-0] .section-item').should('have.length', 18)

    AdminConsultationPage.save()
    AdminConsultationPage.visitConsultationPage()
    cy.wait('@ConsultationStepFormQuery')
    cy.get('.section-item').should('have.length', 18)
  })
})
