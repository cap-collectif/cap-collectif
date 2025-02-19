import moment from 'moment'
import { DATE_FORMAT } from './ConfigureParticipatoryBudgetAnalysisInput'
import { PreConfigureProjectInput } from '@relay/PreConfigureProjectMutation.graphql'

const stepsDates = {
  collectStep: {
    startAt: () => moment().format(DATE_FORMAT),
    endAt: () => moment().add(2, 'w').format(DATE_FORMAT),
  },
  customStep: {
    startAt: () => moment(stepsDates.collectStep.startAt()).add(1, 'M').format(DATE_FORMAT),
  },
}

const getPublicInquiryInput = ({
  projectTitle,
  authors,
  intl,
  isNewBackOfficeEnabled,
  visibility,
}): PreConfigureProjectInput => {
  const proposalFormTitle = `${projectTitle} - ${intl.formatMessage({ id: 'proposal-form' })}`
  const questionnaireTitle = `${projectTitle} - ${intl.formatMessage({ id: 'publicInquiry.analysisFormTitle' })}`
  const collectStepLabel = intl.formatMessage({ id: 'publicInquiry.collectStepLabel' })
  const text = intl.formatMessage

  const input: PreConfigureProjectInput = {
    questionnaires: [
      {
        title: questionnaireTitle,
        description: '',
        questions: [
          {
            question: {
              title: intl.formatMessage({ id: 'publicInquiry.analysisQuestionnaire.firstQuestionTitle' }),
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
              required: false,
              type: 'select',
              choices: [
                {
                  title: `${intl.formatMessage({ id: 'export_proposal_category_name' })} 1`,
                },
                {
                  title: `${intl.formatMessage({ id: 'export_proposal_category_name' })} 2`,
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
        descriptionMandatory: true,
        isGridViewEnabled: true,
        isMapViewEnabled: false,
        suggestingSimilarProposals: false,
        objectType: 'OPINION',
        allowAknowledge: false,
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
            color: 'COLOR_1B5E20',
            icon: null,
            name: intl.formatMessage({ id: 'opinion' }),
          },
          {
            categoryImage: null,
            color: 'COLOR_1E88E5',
            icon: null,
            name: intl.formatMessage({ id: 'admin.fields.source.opinion' }),
          },
          {
            categoryImage: null,
            color: 'COLOR_9C27B0',
            icon: null,
            name: intl.formatMessage({ id: 'global.testimony' }),
          },
        ],
        questions: [
          {
            question: {
              title: intl.formatMessage({ id: 'publicInquiry.collectStepQuestionnaire.document' }),
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
        }
      },
    ],
    project: {
      title: `${projectTitle}`,
      authors,
      projectType: 'public-inquiry',
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
         <td style="width:50%;">
            <h3>${text({ id: 'publicInquiry.presentationStep.isAbout' })}<br><br></h3>
            <p style="text-align:justify;margin-bottom:16px;">${text({
              id: 'publicInquiry.presentationStep.dateInfo',
            })}</p>
            <p style="text-align:justify;margin-bottom:16px;">
               ${text({ id: 'publicInquiry.presentationStep.subject' })}<br><br>
            </p>
            <p><strong>${text({ id: 'publicInquiry.presentationStep.ordinance' })}</strong></p>
            <p style="margin-bottom:8px;">${text({
              id: 'publicInquiry.presentationStep.ordinanceDateAndNumber',
            })}<br></p>
            <p><strong>${text({ id: 'publicInquiry.presentationStep.tribunalReference' })}</strong></p>
            <p style="margin-bottom:8px;">${text({
              id: 'publicInquiry.presentationStep.tribunalDecision',
            })}</p>
            <p style="margin-bottom:8px;"><strong>${text({
              id: 'publicInquiry.presentationStep.commissioner',
            })}<br></strong>${text({
            id: 'publicInquiry.presentationStep.name',
          })}</p>
            <p style="margin-bottom:16px;"><br></p>
            <strong>${text({
              id: 'publicInquiry.presentationStep.calendar',
            })}<br></strong>${text({ id: 'publicInquiry.presentationStep.redaction' })}<br>
         </td>
         <td style="width:50%;vertical-align:top;background-color:rgb(255,255,255);">
            <div style="padding:16px;width:100%;background:#FFFFFF;">
               <h4 style="margin-bottom:16px;">${text({ id: 'publicInquiry.presentationStep.publicInformation' })}</h4>
               <p style="margin-bottom:16px;">${text({ id: 'publicInquiry.presentationStep.useToDownload' })}</p>
               <p><strong>&gt;&nbsp;<a href="https://liendudocument.fr" target="_blank">${text({
                 id: 'publicInquiry.presentationStep.inquiryNotice',
               })}</a>&nbsp;</strong>${text({ id: 'publicInquiry.presentationStep.toAdd' })}<br></p>
               <p><strong><br></strong></p>
               <p><strong>&gt; <a href="https://liendudocument.fr" target="_blank">${intl.formatMessage({
                 id: 'publicInquiry.presentationStep.inquiryOrder',
               })}</a></strong>&nbsp;${text({ id: 'publicInquiry.presentationStep.toAdd' })}<br></p>
            </div>
            <div style="padding:16px;width:100%;background:#FFFFFF;">
               <h4 style="margin-bottom:16px;">${text({ id: 'publicInquiry.presentationStep.contribute' })}</h4>
               <p style="margin-bottom:16px;">${text({ id: 'publicInquiry.presentationStep.contributeInfo' })}</p>
               <p><strong>&gt; <a href="https://liendeletape.fr">${text({
                 id: 'publicInquiry.presentationStep.contributeCTA',
               })}</a>&nbsp;</strong>${text({ id: 'publicInquiry.presentationStep.linkToAdd' })}</p>
            </div>
            <br>
            <div style="color:rgba(0,0,0,0.01);width:0;height:0">&nbsp;<br></div>
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
          body: `<p><span style="color:rgb(67,67,67);">${text({
            id: 'publicInquiry.mediaStep.documentsAvailable',
          })}</span></p>
<p><span style="color:rgb(67,67,67);"><br></span></p>
<div class="level_0">
   <div class="level_1">
      <span style="color:rgb(67,67,67);"><a target="_blank" href="https://liendudocument.fr" rel="noreferrer noopener"><u>${text(
        { id: 'publicInquiry.mediaStep.docExample1' },
      )}</u></a>&nbsp;(0.27Mo)&nbsp;${text({ id: 'publicInquiry.mediaStep.toEdit' })}</span>
      <div class="excerpt"><span style="color:rgb(67,67,67);"><br></span></div>
   </div>
   <div class="level_1"><span style="color:rgb(67,67,67);"><a target="_blank" href="https://liendudocument.fr" class="file_name" rel="noreferrer noopener"><u>${text(
     { id: 'publicInquiry.mediaStep.docExample2' },
   )}</u></a>&nbsp;(0.37Mo)&nbsp;${text({ id: 'publicInquiry.mediaStep.toEdit' })}</span></div>
   <div class="level_1">
      <span style="color:rgb(67,67,67);"><br></span>
      <div class="excerpt"><span style="color:rgb(67,67,67);"><br></span></div>
   </div>
   <h3 class="level_1"><strong style="color:rgb(67,67,67);">${text({
     id: 'publicInquiry.mediaStep.publicInquiryFile',
   })}</strong></h3>
   <p><u style="color:rgb(67,67,67);"><br></u></p>
   <div class="level_1">
      ${text({ id: 'publicInquiry.mediaStep.documentsToAdd' })}<span style="color:rgb(67,67,67);"><br></span>
   </div>
   <p><span style="color:rgb(67,67,67);"><br></span></p>
   <p><span style="color:rgb(67,67,67);">&nbsp;<br></span></p>
</div>
<h3 class="level_1"><strong style="color:rgb(67,67,67);">${text({ id: 'publicInquiry.mediaStep.notice' })}</strong></h3>
<p><span style="color:rgb(67,67,67);"><br></span></p>
<div class="level_1">
   ${text({
     id: 'publicInquiry.mediaStep.documentsToAdd',
   })}<span style="color:rgb(67,67,67);"><br class="Apple-interchange-newline"></span>
</div>`,
          title: isNewBackOfficeEnabled ? '' : `${intl.formatMessage({ id: 'global.question.types.medias' })}`,
          label: intl.formatMessage({ id: 'global.question.types.medias' }),
          isEnabled: true,
          requirements: [],
          type: 'OTHER',
          timeless: true,
        },
        {
          body: `<p>${intl.formatMessage({ id: 'publicInquiry.collectStep.body' })}</p>`,
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
              name: intl.formatMessage({ id: 'publicInquiry.status.published' }),
            },
            {
              color: 'DANGER',
              name: intl.formatMessage({ id: 'publicInquiry.status.outOfScope' }),
            },
          ],
        },
        {
          body: `<p>${intl.formatMessage({ id: 'publicInquiry.checkupStep.body' })}</p>`,
          title: isNewBackOfficeEnabled ? '' : `${intl.formatMessage({ id: 'global.checkup' })}`,
          label: intl.formatMessage({ id: 'global.checkup' }),
          isEnabled: true,
          requirements: [],
          type: 'OTHER',
          startAt: stepsDates.customStep.startAt(),
        },
      ],
      locale: null,
      archived: false,
    },
    analysisForm: {
      proposalFormId: proposalFormTitle,
      evaluationFormId: questionnaireTitle,
      analysisStepId: collectStepLabel,
      selectionStepStatusId: intl.formatMessage({ id: 'publicInquiry.status.published' }),
      unfavourableStatuses: [intl.formatMessage({ id: 'publicInquiry.status.outOfScope' })],
      costEstimationEnabled: false,
      moveToSelectionStepId: null,
    },
  }

  return input
}

export { getPublicInquiryInput }
