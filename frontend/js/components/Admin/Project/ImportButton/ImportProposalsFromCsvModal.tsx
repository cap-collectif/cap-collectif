import * as React from 'react'
import type { IntlShape } from 'react-intl'
import { FormattedHTMLMessage, FormattedMessage, useIntl } from 'react-intl'
import { HelpBlock } from 'react-bootstrap'
import { useState } from 'react'
import type { DropzoneFile } from 'react-dropzone'
import { submit, Field, reduxForm, getFormError, change, updateSyncErrors, reset } from 'redux-form'
import { connect } from 'react-redux'
import Flex from '~ui/Primitives/Layout/Flex'
import Modal from '~ds/Modal/Modal'
import Text from '~ui/Primitives/Text'
import colors, { styleGuideColors } from '~/utils/colors'
import Icon, { ICON_NAME as ICON, ICON_SIZE } from '~ds/Icon/Icon'
import Button from '~ds/Button/Button'
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup'
import Heading from '~ui/Primitives/Heading'
import AddProposalsFromCsvMutation from '~/mutations/AddProposalsFromCsvMutation'
import type { AddProposalsFromCsvMutationResponse } from '~relay/AddProposalsFromCsvMutation.graphql'
import type { Dispatch, Uuid, GlobalState } from '~/types'
import { ProposalCsvDropZoneInput, formName } from '~/components/Utils/ProposalCsvDropZoneInput'
import useFeatureFlag from '~/utils/hooks/useFeatureFlag'

type Props = ReduxFormFormProps & {
  dispatch: Dispatch
  show: boolean
  loading?: boolean
  proposalFormId: Uuid
  selectedStepId: Uuid
  projectId: string
  viewerIsAdmin: boolean
  onClose: () => void
  onSubmit: () => void
  intl: IntlShape
}

const getInputFromFile = (
  dispatch: Dispatch,
  media: {
    id: string
    name: string
    url: string
  },
  proposalFormId: string,
  projectId: string,
  viewerIsAdmin: boolean,
  proposalRevisionsEnabled: boolean,
  selectedStepId: string,
  intl: IntlShape,
) => {
  const input = {
    csvToImport: media.id,
    proposalFormId,
    dryRun: true,
    delimiter: ';',
  }
  dispatch(
    updateSyncErrors(
      formName,
      {
        csvProposals: '',
      },
      'LOADING',
    ),
  )
  const output: any = {}
  output.csvToImport = media.id
  output.errorCode = null
  return AddProposalsFromCsvMutation.commit({
    input,
    proposalRevisionsEnabled,
    isAdminView: true,
    step: selectedStepId,
  })
    .then((response: AddProposalsFromCsvMutationResponse) => {
      if (response.addProposalsFromCsv && response.addProposalsFromCsv.badLines.length >= 1) {
        let lines = response.addProposalsFromCsv.badLines
        const last = lines.length > 1 ? lines[lines.length - 1] : 0
        lines = lines.length > 1 ? lines.slice(0, lines.length - 1) : lines
        output.badLines = {
          num: response.addProposalsFromCsv.badLines.length,
          lines: lines.toString().replace(',', ', '),
          last,
        }
      }

      if (response.addProposalsFromCsv && response.addProposalsFromCsv.duplicates.length >= 1) {
        let lines = response.addProposalsFromCsv.duplicates
        const last = lines.length > 1 ? lines[lines.length - 1] : 0
        lines = lines.length > 1 ? lines.slice(0, lines.length - 1) : lines
        output.duplicates = {
          num: response.addProposalsFromCsv.duplicates.length,
          lines: lines.toString().replace(',', ', '),
          last,
        }
      }

      if (response.addProposalsFromCsv && response.addProposalsFromCsv.mandatoryMissing.length >= 1) {
        let lines = response.addProposalsFromCsv.mandatoryMissing
        const last = lines.length > 1 ? lines[lines.length - 1] : 0
        lines = lines.length > 1 ? lines.slice(0, lines.length - 1) : lines
        output.mandatoryMissing = {
          num: response.addProposalsFromCsv.mandatoryMissing.length,
          lines: lines.toString().replace(',', ', '),
          last,
        }
      }

      if (response.addProposalsFromCsv && response.addProposalsFromCsv.errorCode) {
        output.errorCode = response.addProposalsFromCsv.errorCode
        // force to trigger error and disable "next" button
        dispatch(
          updateSyncErrors(
            formName,
            {
              csvProposals: '',
            },
            response.addProposalsFromCsv.errorCode,
          ),
        )
        dispatch(change(formName, 'csvProposals', { ...output }))
        return
      }

      if (response.addProposalsFromCsv && response.addProposalsFromCsv.importableProposals > 0) {
        output.importableProposals = {
          num: response.addProposalsFromCsv.importableProposals,
        }
      } else {
        output.importableProposals = {
          num: 0,
        }
        dispatch(change(formName, 'csvProposals', { ...output }))
        dispatch(
          updateSyncErrors(
            formName,
            {
              csvProposals: '',
            },
            'no-proposal-importable',
          ),
        )
        return
      }

      dispatch(
        updateSyncErrors(formName, {
          csvProposals: '',
        }),
      )
      dispatch(change(formName, 'csvProposals', { ...output }))
    })
    .catch(() => {
      output.errorCode = 'verification-failed'

      output.verificationFailed = () => (
        <Flex fontSize="11px" fontWeight="400">
          {intl.formatMessage({
            id: 'verification-failed',
          })}
          &nbsp;
          <Button
            fontWeight="600"
            lineHeight="0"
            fontSize="11px"
            onClick={() => {
              getInputFromFile(
                dispatch,
                media,
                proposalFormId,
                projectId,
                viewerIsAdmin,
                proposalRevisionsEnabled,
                selectedStepId,
                intl,
              )
            }}
          >
            <u>
              {intl.formatMessage({
                id: 'button.try.again',
              })}
            </u>
          </Button>
        </Flex>
      )

      dispatch(change(formName, 'csvProposals', { ...output }))
      dispatch(
        updateSyncErrors(
          formName,
          {
            csvProposals: '',
          },
          'verification-failed-retry',
        ),
      )
    })
}

export const ImportProposalsFromCsvModal = ({
  show,
  selectedStepId,
  onClose,
  dispatch,
  pristine,
  invalid,
  handleSubmit,
  submitting,
  loading = false,
  proposalFormId,
  projectId,
  viewerIsAdmin,
}: Props) => {
  const isFeatureReady = true
  const intl = useIntl()
  const [file, setFile] = useState<DropzoneFile | null | undefined>(null)
  const proposalRevisionsEnabled = useFeatureFlag('proposal_revisions')
  return (
    <Modal hideCloseButton ariaLabel="contained-modal-title-lg" show={show} width={['100%', '555px']}>
      <Modal.Header paddingY={6} borderBottom={`1px solid ${colors.borderColor}`}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading>
            <FormattedMessage id="import-proposals" />
          </Heading>
          <Icon
            name={ICON.CROSS}
            onClick={() => {
              onClose()
              dispatch(reset(formName))
            }}
            size={ICON_SIZE.MD}
            color={colors.darkGray}
            style={{
              cursor: 'pointer',
            }}
          />
        </Flex>
      </Modal.Header>
      <Modal.Body>
        <HelpBlock className="no-margin">
          <Text lineHeight="24px" color="gray.900" fontWeight="600">
            {intl.formatMessage({
              id: 'csv-file',
            })}
          </Text>
          <Text lineHeight="24px" color="gray.500">
            <FormattedHTMLMessage
              id="import-proposals-help-text"
              values={{
                url: `/export-step-proposal-form-csv-model/${selectedStepId}`,
              }}
            />
          </Text>
        </HelpBlock>
        <form onSubmit={handleSubmit} id={`${formName}`}>
          <Field
            name="csvProposals"
            component={ProposalCsvDropZoneInput}
            groupClassName="padding-bottom-0 py-0"
            dispatch={dispatch}
            onPostDrop={media => {
              dispatch(
                change(
                  formName,
                  'csvProposals',
                  getInputFromFile(
                    dispatch,
                    media,
                    proposalFormId,
                    projectId,
                    viewerIsAdmin,
                    proposalRevisionsEnabled,
                    selectedStepId,
                    intl,
                  ),
                ),
              )
              setFile(media)
            }}
            disabled={false}
            currentFile={file}
          />
        </form>
      </Modal.Body>
      <Modal.Footer as="div" paddingY={4} borderTop={`1px solid ${colors.borderColor}`}>
        <Flex justify="space-between" align="baseline" flex={1}>
          <div>
            {isFeatureReady && (
              <a
                href="https://aide.cap-collectif.com/article/254-importer-des-propositions"
                target="_blank"
                rel="noreferrer"
              >
                <Text color={styleGuideColors.blue500} fontWeight="600">
                  <Icon name={ICON.CIRCLE_INFO} size={ICON_SIZE.MD} verticalAlign="-7px" marginRight="4px" />
                  <Text as="span" fontWeight={600} className="ml-10">
                    <FormattedMessage className="ml-8" id="information" />
                  </Text>
                </Text>
              </a>
            )}
          </div>
          <ButtonGroup flexDirection="row">
            <Button
              disabled={pristine || invalid || submitting || loading}
              onClick={() => {
                dispatch(submit(formName))
              }}
              variant="primary"
              variantColor="primary"
              variantSize="big"
              isLoading={loading || submitting}
            >
              {intl.formatMessage({
                id: loading ? 'verification' : submitting ? 'importing' : 'import',
              })}
            </Button>
          </ButtonGroup>
        </Flex>
      </Modal.Footer>
    </Modal>
  )
}
const formContainer = reduxForm({
  form: formName,
  destroyOnUnmount: false,
  enableReinitialize: true,
})(ImportProposalsFromCsvModal)

const mapStateToProps = (state: GlobalState, { proposalFormId }: Props) => {
  return {
    initialValue: {
      media: null,
      proposalFormId,
    },
    loading: getFormError(formName)(state) === 'LOADING',
  }
}

export default connect(mapStateToProps)(formContainer)
