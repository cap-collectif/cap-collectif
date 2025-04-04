import * as React from 'react'
import { useState } from 'react'
import { FormattedHTMLMessage, useIntl } from 'react-intl'
import { useRouteMatch } from 'react-router-dom'
import { reset, submit } from 'redux-form'
import css from '@styled-system/css'
import type { Dispatch } from '~/types'
import ImportProposalsFromCsvModal from '~/components/Admin/Project/ImportButton/ImportProposalsFromCsvModal'
import { formName } from '~/components/Utils/ProposalCsvDropZoneInput'
import ImportPaperVotesFromCsvModal from '~/components/Admin/Project/ImportButton/ImportPaperVotesFromCsvModal'
import colors from '~/utils/colors'
import AddProposalsFromCsvMutation from '~/mutations/AddProposalsFromCsvMutation'
import type { AddProposalsFromCsvMutationResponse } from '~relay/AddProposalsFromCsvMutation.graphql'
import { toast } from '~ds/Toast'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { useProjectAdminProposalsContext } from '~/components/Admin/Project/ProjectAdminPage.context'
import type { StepFilter } from '~/components/Admin/Project/ProjectAdminProposals.utils'
import { Button, CapUIIcon, Menu, Text } from '@cap-collectif/ui'
type Props = {
  proposalFormId: string
  selectedStep: StepFilter
  proposals: Array<{
    readonly id: string
    readonly fullReference: string
    readonly title: string
    readonly paperVotesTotalCount: number
    readonly paperVotesTotalPointsCount: number
    readonly canContactAuthor: boolean
    readonly nbrOfMessagesSentToAuthor: number
  }>
  projectTitle: string
  projectId: string
  viewerIsAdmin: boolean
}
type FormValue = {
  csvProposals: {
    csvToImport: string
    badLines?: {
      num: number
      lines: string
      last: string
    }
    duplicates?: {
      num: number
      lines: string
      last: number
    }
    mandatoryMissing?: {
      num: number
      lines: string
      last: number
    }
    importableProposals?: {
      num: number
    }
    errorCode?: string
  }
}

const ImportButton = ({ proposalFormId, selectedStep, proposals, projectId, projectTitle, viewerIsAdmin }: Props) => {
  const intl = useIntl()
  const { url: baseLinkUrl } = useRouteMatch()
  const [showModal, setShowModal] = useState<boolean>(false)
  const [showPaperVotesModal, setShowPaperVotesModal] = useState<boolean>(false)
  const [failOneTime, setFailOneTime] = useState<boolean>(false)
  const proposalRevisionsEnabled = useFeatureFlag('proposal_revisions')
  const paperVotesEnabled = useFeatureFlag('paper_vote')
  const { parameters } = useProjectAdminProposalsContext()

  if (!selectedStep) {
    return null
  }

  const submitImportProposalsVerified = (values: FormValue, dispatch: Dispatch) => {
    const input = {
      csvToImport: values.csvProposals.csvToImport,
      proposalFormId,
      dryRun: false,
      delimiter: ';',
    }
    return AddProposalsFromCsvMutation.commit({
      input,
      proposalRevisionsEnabled,
      isAdminView: true,
      step: selectedStep.id,
      projectId,
      parameters,
    })
      .then((response: AddProposalsFromCsvMutationResponse) => {
        setShowModal(false)

        if (response.addProposalsFromCsv && response.addProposalsFromCsv.importedProposals) {
          dispatch(reset(formName))
          toast({
            variant: 'success',
            content: (
              <FormattedHTMLMessage
                id="success-proposals-imported"
                values={{
                  num: response.addProposalsFromCsv?.importedProposals?.totalCount || 0,
                }}
              />
            ),
          })
        } else {
          toast({
            variant: 'danger',
            content: failOneTime ? (
              <FormattedHTMLMessage id="error-again-contact-assist" />
            ) : (
              <div>
                <Button
                  onClick={() => {
                    dispatch(submit(formName))
                  }}
                >
                  <FormattedHTMLMessage id="import-failed-retry" />
                </Button>
              </div>
            ),
          })
          setFailOneTime(true)
        }
      })
      .catch(() => {
        setShowModal(false)
        toast({
          variant: 'danger',
          content: failOneTime ? (
            <FormattedHTMLMessage id="error-again-contact-assist" />
          ) : (
            <div>
              <Button
                onClick={() => {
                  dispatch(submit(formName))
                }}
              >
                {intl.formatMessage({
                  id: 'import-failed-retry',
                })}
              </Button>
            </div>
          ),
        })
        setFailOneTime(true)
      })
  }

  return (
    <>
      <Menu
        placement="bottom-start"
        disclosure={
          <Button rightIcon={CapUIIcon.ArrowDownO} variantSize="small" variant="secondary" variantColor="primary">
            {intl.formatMessage({
              id: 'link_action_create',
            })}
          </Button>
        }
      >
        <Menu.List mt={0} minWidth="240px">
          <Menu.Item>
            <Text
              as="span"
              css={css({
                a: {
                  textDecoration: 'none',
                  color: colors.darkText,
                },
              })}
            >
              <a href={`${baseLinkUrl}/${selectedStep.id}/create`}>
                {intl.formatMessage({
                  id: 'add.proposal.hand',
                })}
              </a>
            </Text>
          </Menu.Item>
          <Menu.Item
            onClick={() => {
              setShowModal(true)
            }}
          >
            {intl.formatMessage({
              id: 'add.proposal.csv',
            })}
          </Menu.Item>
          {paperVotesEnabled && selectedStep.votable && (
            <Menu.Item
              onClick={() => {
                setShowPaperVotesModal(true)
              }}
            >
              {intl.formatMessage({
                id: 'add.paper_votes.csv',
              })}
            </Menu.Item>
          )}
        </Menu.List>
      </Menu>
      <ImportProposalsFromCsvModal
        show={showModal}
        proposalFormId={proposalFormId}
        selectedStepId={selectedStep.id}
        projectId={projectId}
        viewerIsAdmin={viewerIsAdmin}
        onSubmit={submitImportProposalsVerified}
        onClose={() => {
          setShowModal(false)
        }}
      />
      <ImportPaperVotesFromCsvModal
        show={showPaperVotesModal}
        selectedStepId={selectedStep.id}
        selectedStepTitle={selectedStep.title}
        projectTitle={projectTitle}
        isVoteRanking={selectedStep.votesRanking}
        proposals={proposals}
        onClose={() => {
          setShowPaperVotesModal(false)
        }}
      />
    </>
  )
}

export default ImportButton
