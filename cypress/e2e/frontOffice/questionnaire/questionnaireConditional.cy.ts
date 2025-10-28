import { Base, QuestionnairePage } from '~e2e-pages/index'

describe('Conditional Questionnaire', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.directLoginAs('user')
  })

  describe('when filling questionnaire with branch Hap -> Marvel', () => {
    it('displays correct conditional questions based on selections', () => {
      QuestionnairePage.visitQuestionnaireConditional()

      cy.contains('Hap ou Noel ?', { timeout: 8000 }).should('be.visible')
      cy.contains('Votre fleuve préféré').should('be.visible')

      QuestionnairePage.verifyQuestionsNotVisible([
        "Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)",
        'Par qui Hap a t-il été créé ?',
        'Hap est-il un homme bon ?',
        "Comment ça ce n'est pas un homme bon, comment oses-tu ?",
        'Noel a t-il un rapport avec la fête de Noël ?',
        'De quelle couleur est le chapeau de Noël ?',
        'Plutôt Marvel ou DC ?',
        "T'aimes bien Superman ?",
        "T'aimes bien Batman ?",
        "T'aimes bien Supergirl ?",
        "T'aimes bien Iron Man ?",
        "T'aimes bien Luke Cage ?",
        "T'aimes bien Thor ?",
        "C'est la fin mais j'affiche quand même des choix",
      ])

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses0', 'Hap')
      cy.contains('Par qui Hap a t-il été créé ?').should('be.visible')

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses1', 'Le gange')
      cy.contains("Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)").should(
        'be.visible',
      )

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses3', 'Cisla')
      cy.contains('Hap est-il un homme bon ?').should('be.visible')

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses4', 'Oui')
      cy.contains('Plutôt Marvel ou DC ?').should('be.visible')

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses8', 'Marvel')
      cy.contains("T'aimes bien Iron Man ?").should('be.visible')

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses12', 'Oui')
      cy.contains("T'aimes bien Luke Cage ?").should('be.visible')

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses13', 'Oui c un bo chauve ténébreux')
      cy.contains("T'aimes bien Thor ?").should('be.visible')

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses14', 'ui')
      cy.contains("C'est la fin mais j'affiche quand même des choix").should('be.visible')

      Base.reload({ operationName: 'NavBarMenuQuery' })
      cy.on('window:confirm', text => {
        expect(text).to.exist
        return false
      })
    })
  })

  describe('when filling questionnaire with branch Hap -> DC', () => {
    it('displays correct conditional questions based on selections', () => {
      QuestionnairePage.visitQuestionnaireConditional()

      cy.contains('Hap ou Noel ?', { timeout: 8000 }).should('be.visible')
      cy.contains('Votre fleuve préféré').should('be.visible')

      QuestionnairePage.verifyQuestionsNotVisible([
        "Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)",
        'Par qui Hap a t-il été créé ?',
        'Hap est-il un homme bon ?',
        "Comment ça ce n'est pas un homme bon, comment oses-tu ?",
        'Noel a t-il un rapport avec la fête de Noël ?',
        'De quelle couleur est le chapeau de Noël ?',
        'Plutôt Marvel ou DC ?',
        "T'aimes bien Superman ?",
        "T'aimes bien Batman ?",
        "T'aimes bien Supergirl ?",
        "T'aimes bien Iron Man ?",
        "T'aimes bien Luke Cage ?",
        "T'aimes bien Thor ?",
        "C'est la fin mais j'affiche quand même des choix",
      ])

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses0', 'Hap')
      cy.contains('Par qui Hap a t-il été créé ?').should('be.visible')

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses1', 'Le gange')
      cy.contains("Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)").should(
        'be.visible',
      )

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses3', 'Cisla')
      cy.contains('Hap est-il un homme bon ?').should('be.visible')

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses4', 'Oui')
      cy.contains('Plutôt Marvel ou DC ?').should('be.visible')

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses8', 'DC')
      cy.contains("T'aimes bien Superman ?").should('be.visible')

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses9', 'Oui')
      cy.contains("T'aimes bien Batman ?").should('be.visible')

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses10', 'Oui')
      cy.contains("T'aimes bien Supergirl ?").should('be.visible')

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses11', 'Non')
      cy.contains("C'est la fin mais j'affiche quand même des choix").should('be.visible')

      Base.reload({ operationName: 'NavBarMenuQuery' })
      cy.on('window:confirm', text => {
        expect(text).to.exist
        return false
      })
    })
  })

  describe('when switching from DC branch to Marvel branch', () => {
    it('updates displayed questions correctly', () => {
      QuestionnairePage.visitQuestionnaireConditional()

      cy.contains('Hap ou Noel ?', { timeout: 8000 }).should('be.visible')

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses0', 'Hap')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses1', 'Le gange')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses3', 'Cisla')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses4', 'Oui')
      cy.contains('Plutôt Marvel ou DC ?').should('be.visible')

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses8', 'DC')
      cy.contains("T'aimes bien Superman ?").should('be.visible')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses9', 'Oui')
      cy.contains("T'aimes bien Batman ?").should('be.visible')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses10', 'Oui')
      cy.contains("T'aimes bien Supergirl ?").should('be.visible')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses11', 'Non')
      cy.contains("C'est la fin mais j'affiche quand même des choix").should('be.visible')

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses8', 'Marvel')

      cy.contains("T'aimes bien Superman ?").should('not.exist')
      cy.contains("T'aimes bien Batman ?").should('not.exist')
      cy.contains("T'aimes bien Supergirl ?").should('not.exist')

      cy.contains("T'aimes bien Iron Man ?").should('be.visible')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses12', 'Oui')
      cy.contains("T'aimes bien Luke Cage ?").should('be.visible')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses13', 'Oui c un bo chauve ténébreux')
      cy.contains("T'aimes bien Thor ?").should('be.visible')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses14', 'ui')
      cy.contains("C'est la fin mais j'affiche quand même des choix").should('be.visible')

      Base.reload({ operationName: 'NavBarMenuQuery' })
      cy.on('window:confirm', text => {
        expect(text).to.exist
        return false
      })
    })
  })

  describe('when switching from Marvel branch to DC branch', () => {
    it('updates displayed questions correctly', () => {
      QuestionnairePage.visitQuestionnaireConditional()

      cy.contains('Hap ou Noel ?', { timeout: 8000 }).should('be.visible')

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses0', 'Hap')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses1', 'Le gange')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses3', 'Cisla')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses4', 'Oui')

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses8', 'Marvel')
      cy.contains("T'aimes bien Iron Man ?").should('be.visible')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses12', 'Oui')
      cy.contains("T'aimes bien Luke Cage ?").should('be.visible')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses13', 'Oui c un bo chauve ténébreux')
      cy.contains("T'aimes bien Thor ?").should('be.visible')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses14', 'ui')
      cy.contains("C'est la fin mais j'affiche quand même des choix").should('be.visible')

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses8', 'DC')

      cy.contains("T'aimes bien Iron Man ?").should('not.exist')
      cy.contains("T'aimes bien Luke Cage ?").should('not.exist')
      cy.contains("T'aimes bien Thor ?").should('not.exist')

      cy.contains("T'aimes bien Superman ?").should('be.visible')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses9', 'Oui')
      cy.contains("T'aimes bien Batman ?").should('be.visible')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses10', 'Oui')
      cy.contains("T'aimes bien Supergirl ?").should('be.visible')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses11', 'Non')
      cy.contains("C'est la fin mais j'affiche quand même des choix").should('be.visible')

      Base.reload({ operationName: 'NavBarMenuQuery' })
      cy.on('window:confirm', text => {
        expect(text).to.exist
        return false
      })
    })
  })

  describe('when selecting "Non" for "Hap est-il un homme bon ?"', () => {
    it('displays nested conditional question', () => {
      QuestionnairePage.visitQuestionnaireConditional()

      cy.contains('Hap ou Noel ?', { timeout: 8000 }).should('be.visible')

      QuestionnairePage.verifyQuestionsNotVisible([
        "Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)",
        'Par qui Hap a t-il été créé ?',
        'Hap est-il un homme bon ?',
        "Comment ça ce n'est pas un homme bon, comment oses-tu ?",
        'Noel a t-il un rapport avec la fête de Noël ?',
        'De quelle couleur est le chapeau de Noël ?',
        'Plutôt Marvel ou DC ?',
        "T'aimes bien Superman ?",
        "T'aimes bien Batman ?",
        "T'aimes bien Supergirl ?",
        "T'aimes bien Iron Man ?",
        "T'aimes bien Luke Cage ?",
        "T'aimes bien Thor ?",
        "C'est la fin mais j'affiche quand même des choix",
      ])

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses0', 'Hap')
      cy.contains('Par qui Hap a t-il été créé ?').should('be.visible')

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses1', 'Le gange')
      cy.contains("Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)").should(
        'be.visible',
      )

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses3', 'Cisla')
      cy.contains('Hap est-il un homme bon ?').should('be.visible')

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses4', 'Non')
      cy.contains("Comment ça ce n'est pas un homme bon, comment oses-tu ?").should('be.visible')

      Base.reload({ operationName: 'NavBarMenuQuery' })
      cy.on('window:confirm', text => {
        expect(text).to.exist
        return false
      })
    })
  })

  describe('when switching from Hap branch to Noel branch', () => {
    it('updates displayed questions correctly', () => {
      QuestionnairePage.visitQuestionnaireConditional()

      cy.contains('Hap ou Noel ?', { timeout: 8000 }).should('be.visible')

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses0', 'Hap')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses1', 'Le gange')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses3', 'Cisla')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses4', 'Oui')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses8', 'Marvel')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses12', 'Oui')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses13', 'Oui c un bo chauve ténébreux')
      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses14', 'ui')
      cy.contains("C'est la fin mais j'affiche quand même des choix").should('be.visible')

      QuestionnairePage.selectFromReactDropdown('#CreateReplyForm-responses0', 'Noel')

      cy.contains('Par qui Hap a t-il été créé ?').should('not.exist')
      cy.contains("Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)").should(
        'not.exist',
      )
      cy.contains('Hap est-il un homme bon ?').should('not.exist')

      cy.contains('Noel a t-il un rapport avec la fête de Noël ?').should('be.visible')
      cy.contains('De quelle couleur est le chapeau de Noël ?').should('be.visible')
      cy.contains('Plutôt Marvel ou DC ?').should('be.visible')
      cy.contains("T'aimes bien Iron Man ?").should('be.visible')
      cy.contains("T'aimes bien Luke Cage ?").should('be.visible')
      cy.contains("T'aimes bien Thor ?").should('be.visible')
      cy.contains("C'est la fin mais j'affiche quand même des choix").should('be.visible')

      Base.reload({ operationName: 'NavBarMenuQuery' })
      cy.on('window:confirm', text => {
        expect(text).to.exist
        return false
      })
    })
  })
})
