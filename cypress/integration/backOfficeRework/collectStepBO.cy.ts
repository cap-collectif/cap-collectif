import { AdminCollectStepPage } from '~e2e/pages'

describe('Collect Step back office', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'display_pictures_in_depository_proposals_list')
    cy.task('enable:feature', 'votes_min')
    cy.task('enable:feature', 'unstable__new_create_project')
    cy.task('disable:feature', 'helpscout_beacon')
    cy.directLoginAs('super_admin')
  })

  it('should update the step when editing a existing collect step', () => {
    AdminCollectStepPage.visitCollectPage('EDIT')
    AdminCollectStepPage.fillLabel('Updated text')
    AdminCollectStepPage.fillDescription('Updated description')
    AdminCollectStepPage.openProposalFormAccordion()
    AdminCollectStepPage.fillProposalFormDescription('ProposalForm description')

    AdminCollectStepPage.addProposalFormNeededInfos('proposal_form.summary')
    AdminCollectStepPage.addProposalFormNeededInfos('proposal_form.description')
    AdminCollectStepPage.addProposalFormNeededInfos('proposal_form.illustration')
    AdminCollectStepPage.addProposalFormNeededInfos('proposal_form.theme')
    AdminCollectStepPage.addProposalFormNeededInfos('proposal_form.category')
    AdminCollectStepPage.addProposalFormNeededInfos('proposal_form.address')
    AdminCollectStepPage.addProposalFormNeededInfos('proposal_form.districts')

    AdminCollectStepPage.addCategory()
    AdminCollectStepPage.addDistrict()

    AdminCollectStepPage.openVotesAccordion()
    AdminCollectStepPage.selectAdvancedTab()
    AdminCollectStepPage.configAdvancedVotes({
      budget: {
        max: '2000',
      },
      threshold: {
        threshold: '3',
        archivingTime: '2',
        archivingUnit: 'global.days',
      },
      limit: {
        min: '2',
        max: '4',
      },
      voteHelpText: 'Vote help text',
    })

    AdminCollectStepPage.openStatusAccordion()
    AdminCollectStepPage.addStatus()
    AdminCollectStepPage.fillStatus('3', 'new status')

    AdminCollectStepPage.openProposalConfigAccordion()
    AdminCollectStepPage.configProposal({
      addNews: true,
      visibility: 'public',
      sort: 'global.filter_f_last',
      defaultStatus: 'confined',
    })

    AdminCollectStepPage.openOptionnalSettingsAccordion()
    AdminCollectStepPage.checkListView()
    AdminCollectStepPage.checkGridView()
    AdminCollectStepPage.checkMapView()
    AdminCollectStepPage.fillMapInfos({
      address: 'Paris',
      zoomLevel: '3',
    })
    AdminCollectStepPage.selectDefaultView('map')

    AdminCollectStepPage.fillMetaDescription('Meta description')
    AdminCollectStepPage.fillCustomCode('Custom code')
    AdminCollectStepPage.checkCanContact(true)
    AdminCollectStepPage.selectPublication('draft')
    AdminCollectStepPage.save()
  })
})
