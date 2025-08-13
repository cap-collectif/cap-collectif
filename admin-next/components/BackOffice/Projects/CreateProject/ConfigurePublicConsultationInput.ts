import moment from 'moment'
import { DATE_FORMAT } from './ConfigureParticipatoryBudgetAnalysisInput'
import { PreConfigureProjectInput } from '@relay/PreConfigureProjectMutation.graphql'

const stepsDates = {
  collectStep: {
    startAt: () => moment().format(DATE_FORMAT),
    endAt: () => moment().add(3, 'M').format(DATE_FORMAT),
  },
  analysisStep: {
    startAt: () => moment(stepsDates.collectStep.endAt()).add(1, 'd').format(DATE_FORMAT),
  },
}

const getPublicConsultationInput = ({
  projectTitle,
  authors,
  intl,
  isNewBackOfficeEnabled,
  visibility,
}): PreConfigureProjectInput => {
  const proposalFormTitle = `${projectTitle} - ${intl.formatMessage({ id: 'proposal-form' })}`
  const questionnaireTitle = `${projectTitle} - ${intl.formatMessage({ id: 'publicConsultation.analysisFormTitle' })}`
  const collectStepLabel = intl.formatMessage({ id: 'publicConsultation.collectStepLabel' })
  const text = intl.formatMessage

  const input: PreConfigureProjectInput = {
    questionnaires: [
      {
        title: questionnaireTitle,
        description: '',
        questions: [
          {
            question: {
              title: intl.formatMessage({ id: 'publicConsultation.analysisQuestionnaire.firstQuestionTitle' }),
              private: false,
              required: false,
              jumps: [],
              alwaysJumpDestinationQuestion: null,
              type: 'textarea',
            },
          },
          {
            question: {
              title: intl.formatMessage({ id: 'categorization' }),
              private: false,
              required: true,
              type: 'select',
              choices: [
                {
                  title: `${intl.formatMessage({ id: 'publicConsultation.category' })} 1`,
                },
                {
                  title: `${intl.formatMessage({ id: 'publicConsultation.category' })} 2`,
                },
              ],
              jumps: [],
              alwaysJumpDestinationQuestion: null,
            },
          },
        ],
      },
    ],
    proposalForms: [
      {
        title: proposalFormTitle,
        usingCategories: true,
        usingAddress: false,
        usingDescription: true,
        descriptionMandatory: false,
        isGridViewEnabled: true,
        isMapViewEnabled: false,
        suggestingSimilarProposals: false,
        objectType: 'OPINION',
        allowAknowledge: true,
        usingFacebook: false,
        usingWebPage: false,
        usingTwitter: false,
        usingInstagram: false,
        usingYoutube: false,
        usingLinkedIn: false,
        usingIllustration: false,
        commentable: false,
        categories: [
          {
            categoryImage: null,
            color: 'COLOR_0097A7',
            icon: null,
            name: `${intl.formatMessage({ id: 'publicConsultation.collectStep.categories' })} 1`,
          },
          {
            categoryImage: null,
            color: 'COLOR_C2185B',
            icon: null,
            name: `${intl.formatMessage({ id: 'publicConsultation.collectStep.categories' })} 2`,
          },
        ],
        questions: [
          {
            question: {
              title: intl.formatMessage({ id: 'publicConsultation.collectStepQuestionnaire.document' }),
              private: false,
              required: false,
              jumps: [],
              alwaysJumpDestinationQuestion: null,
              type: 'medias',
            },
          },
        ],
        notifications: {
          onCreate: true,
          onDelete: true,
          onUpdate: true,
        },
      },
    ],
    project: {
      title: `${projectTitle}`,
      authors,
      projectType: null,
      themes: [],
      districts: [],
      metaDescription: null,
      publishedAt: moment().format(DATE_FORMAT),
      visibility,
      opinionCanBeFollowed: false,
      isExternal: false,
      isProposalStepSplitViewEnabled: false,
      steps: [
        {
          body: `<table style="border-collapse:collapse;width:100%;">
   <tbody>
      <tr>
         <td style="width:66%;">
            <h3 style="margin-bottom:16px;"><strong>${text({
              id: 'publicConsultation.presentationStep.isAbout',
            })}</strong><br><br></h3>
            <p style="text-align:justify;margin-bottom:16px;">${text({
              id: 'publicConsultation.presentationStep.dateInfo',
            })}</p>
            <p style="text-align:justify;margin-bottom:16px;">
               ${text({ id: 'publicConsultation.presentationStep.subject' })}<br><br>
            </p>

            <p style="margin-bottom:16px;"><br></p>
            <h3><strong>${text({
              id: 'publicConsultation.presentationStep.calendar',
            })}<br><br></strong></h3>

            <p style="margin-bottom:8px;"><strong>${text({
              id: 'publicConsultation.presentationStep.consultationOpen',
            })}&nbsp;</strong> ${text({
            id: 'publicConsultation.presentationStep.dates',
          })}</p>

            <p style="margin-bottom:8px;"><strong>${text({
              id: 'publicConsultation.presentationStep.contributionAnalysis',
            })}&nbsp;</strong> ${text({
            id: 'publicConsultation.presentationStep.dates',
          })}</p>

            <p style="margin-bottom:8px;"><strong>${text({
              id: 'publicConsultation.presentationStep.summaryPublication',
            })}&nbsp;</strong> ${text({
            id: 'publicConsultation.presentationStep.dates',
          })}</p>

            <p style="margin-bottom:8px;"><strong>${text({
              id: 'publicConsultation.presentationStep.projectEvolution',
            })}&nbsp;</strong> ${text({
            id: 'publicConsultation.presentationStep.dates',
          })}</p>

            <p style="margin-bottom:8px;"><strong>${text({
              id: 'publicConsultation.presentationStep.finalDecision',
            })}&nbsp;</strong> ${text({
            id: 'publicConsultation.presentationStep.dates',
          })}</p>
           
         </td>
         <td style="width:33%;vertical-align:top;background-color:rgb(255,255,255);">
            <div style="padding:16px;width:100%;background:#FFFFFF;">
               <h4 style="margin-bottom:16px;"><strong>${text({
                 id: 'publicConsultation.presentationStep.participate',
               })}</strong></h4>
               <p style="margin-bottom:16px; display:inline-block;">${text({
                 id: 'publicConsultation.presentationStep.submitAProposal',
               })}</p>
               <p><strong>&gt; ${text({
                 id: 'publicConsultation.presentationStep.submitContribution',
               })}&nbsp;</strong></p>
               <p>${text({ id: 'publicConsultation.presentationStep.linkToAdd' })}<br></p>
            </div>
            
            
         </td>
      </tr>
   </tbody>
</table>`,
          title: isNewBackOfficeEnabled ? '' : `${intl.formatMessage({ id: 'presentation-of-your-project' })}`,
          label: intl.formatMessage({ id: 'presentation_step' }),
          isEnabled: true,
          requirements: [],
          type: 'PRESENTATION',
        },
        {
          body: `<div><h3 style="margin-bottom:16px;"><strong>${text({
            id: 'publicConsultation.mediaStep.title',
          })}</strong></h3>
<p>${text({ id: 'publicConsultation.mediaStep.description' })}</p>
<p><br></p>
<p>${text({ id: 'publicConsultation.mediaStep.availableDocuments' })}</p>
<ul>
    <li>${text({ id: 'publicConsultation.mediaStep.documentToAdd' })}</li>
    <li>${text({ id: 'publicConsultation.mediaStep.documentToAdd' })}</li>
</ul>
<p>${text({
            id: 'publicConsultation.mediaStep.additionalComments',
          })}</p></div>
`,
          title: isNewBackOfficeEnabled
            ? ''
            : `${intl.formatMessage({ id: 'publicConsultation.mediaStep.documents' })}`,
          label: intl.formatMessage({ id: 'publicConsultation.mediaStep.documents' }),
          isEnabled: true,
          requirements: [],
          type: 'OTHER',
          timeless: true,
        },
        {
          body: `<div><h3 style="margin-bottom:16px;"><strong>${text({
            id: 'publicConsultation.collectStep.title',
          })}</strong></h3>
          <br>
<p>${text({ id: 'publicConsultation.collectStep.description' })}</p>
<p>${text({ id: 'publicConsultation.collectStep.additionalInfo' })}</p>
<ul style="margin-bottom:16px;">
<li>${text({ id: 'publicConsultation.collectStep.themes' }, { number: 1 })}</li>
<li>${text({ id: 'publicConsultation.collectStep.themes' }, { number: 2 })}</li>
</ul>
<br>
<p>${text({ id: 'publicConsultation.collectStep.analysis' })}</p>
</div>`,
          title: isNewBackOfficeEnabled ? '' : collectStepLabel,
          startAt: stepsDates.collectStep.startAt(),
          endAt: stepsDates.collectStep.endAt(),
          label: collectStepLabel,
          isEnabled: true,
          defaultSort: 'RANDOM',
          mainView: 'GRID',
          proposalForm: proposalFormTitle,
          private: false,
          requirements: [],
          type: 'COLLECT',
          voteType: 'DISABLED',
          proposalArchivedTime: 0,
          proposalArchivedUnitTime: 'MONTHS',
          statuses: [
            {
              color: 'INFO',
              name: intl.formatMessage({ id: 'publicConsultation.status.newNotice' }),
            },
            {
              color: 'DANGER',
              name: intl.formatMessage({ id: 'publicConsultation.status.offTopic' }),
            },
            {
              color: 'SUCCESS',
              name: intl.formatMessage({ id: 'publicConsultation.status.publishedResponse' }),
            },
          ],
        },
        {
          body: `<div><h3 style="margin-bottom:16px;"><strong>${text({
            id: 'publicConsultation.analysisStep.bodyTitle',
          })}</strong></h3>
      <p>${intl.formatMessage({ id: 'publicConsultation.analysisStep.body' })}</p></div>`,
          title: isNewBackOfficeEnabled ? '' : `${intl.formatMessage({ id: 'publicConsultation.analysisStep.title' })}`,
          label: intl.formatMessage({ id: 'publicConsultation.analysisStep.title' }),
          isEnabled: true,
          requirements: [],
          type: 'OTHER',
          startAt: stepsDates.analysisStep.startAt(),
        },
      ],
      locale: null,
      archived: false,
    },
    analysisForm: {
      proposalFormId: proposalFormTitle,
      evaluationFormId: questionnaireTitle,
      analysisStepId: collectStepLabel,
      favourableStatus: intl.formatMessage({ id: 'publicConsultation.status.publishedResponse' }),
      unfavourableStatuses: [intl.formatMessage({ id: 'publicConsultation.status.offTopic' })],
      costEstimationEnabled: false,
      moveToSelectionStepId: null,
    },
  }

  return input
}

export { getPublicConsultationInput }
