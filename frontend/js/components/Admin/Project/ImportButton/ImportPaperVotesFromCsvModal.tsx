import * as React from 'react'
import { FormattedHTMLMessage, useIntl } from 'react-intl'
import { HelpBlock } from 'react-bootstrap'
import { useState } from 'react'
import type { DropzoneFile } from 'react-dropzone'
import { Heading } from '@cap-collectif/ui'
import Flex from '~ui/Primitives/Layout/Flex'
import Modal from '~ds/Modal/Modal'
import Text from '~ui/Primitives/Text'
import colors, { styleGuideColors } from '~/utils/colors'
import Icon, { ICON_NAME as ICON, ICON_SIZE } from '~ds/Icon/Icon'
import Button from '~ds/Button/Button'
import type { Uuid } from '~/types'
import FileUpload from '~/components/Form/FileUpload'
import UpdatePaperVoteMutation from '~/mutations/UpdatePaperVoteMutation'
import type { UpdatePaperVoteInput } from '~relay/UpdatePaperVoteMutation.graphql'
import InfoMessage from '~ds/InfoMessage/InfoMessage'
import {
  formatData,
  generateCsvContent,
  getCsvTitle,
  isAlreadyThere,
  isEmptyDatum,
  isValidDatum,
  splitResult,
  splitRow,
} from '~/components/Admin/Project/ImportButton/ImportPaperVotesFromCsvModal.utils'
import type { ProposalType } from '~/components/Admin/Project/ImportButton/ImportPaperVotesFromCsvModal.utils'
import { toast } from '~ds/Toast'

const CSV_MAX_UPLOAD_SIZE = 80000
type Props = {
  show: boolean
  projectTitle: string
  selectedStepId: Uuid
  selectedStepTitle: string
  isVoteRanking: boolean
  proposals: Array<ProposalType>
  onClose: () => void
}
type AnalyseDataType = {
  validData: Array<UpdatePaperVoteInput>
  errors: Array<number>
  doubles: Array<number>
}
export const ImportPaperVotesFromCsvModal = ({
  show,
  onClose,
  proposals,
  selectedStepId,
  selectedStepTitle,
  projectTitle,
  isVoteRanking,
}: Props) => {
  const [inputData, setInputData] = useState<Array<UpdatePaperVoteInput>>([])
  const [error, setError] = useState<string | null | undefined>(undefined)
  const [warning, setWarning] = useState<string | null | undefined>(undefined)
  const intl = useIntl()

  const clear = (): void => {
    setInputData([])
    setError(undefined)
    setWarning(undefined)
  }

  const setInputAndMessages = ({ validData, errors, doubles }: AnalyseDataType): void => {
    if (validData.length === 0) {
      setError(
        intl.formatMessage(
          {
            id: 'count-identified-votes',
          },
          {
            count: 0,
          },
        ),
      )
    } else {
      setInputData(validData)

      if (errors.length > 0) {
        setError(
          intl.formatMessage(
            {
              id: 'paper-votes-import-lines-errors',
            },
            {
              count: errors.length,
              lines: errors.length > 1 ? errors.slice(0, -1).toString() : errors.toString(),
              last: errors.pop(),
            },
          ),
        )
      }

      if (doubles.length > 0) {
        setWarning(
          intl.formatMessage(
            {
              id: 'duplicate-lines',
            },
            {
              count: doubles.length,
              lines: doubles.length > 1 ? doubles.slice(0, -1).toString() : doubles.toString(),
              last: doubles.pop(),
            },
          ),
        )
      }
    }
  }

  const analyseData = (rows: Array<string>): AnalyseDataType => {
    const data: AnalyseDataType = {
      validData: [],
      errors: [],
      doubles: [],
    }
    rows.forEach((row: string, index: number) => {
      const split = splitRow(row)

      if (isValidDatum(split, isVoteRanking, proposals)) {
        if (isAlreadyThere(data.validData, split)) {
          data.doubles.push(index + 2)
        }

        if (!isEmptyDatum(split)) {
          data.validData.push(formatData(split, selectedStepId, isVoteRanking, proposals))
        }
      } else {
        data.errors.push(index + 2)
      }
    })
    return data
  }

  const analyseReaderResult = (result: string): void => {
    const rows = splitResult(result)

    if (rows) {
      if (rows.length > 500) {
        setError(
          intl.formatMessage({
            id: 'error-import-max-proposals',
          }),
        )
      } else {
        setInputAndMessages(analyseData(rows))
      }
    } else {
      setError(
        intl.formatMessage({
          id: 'invalid-model',
        }),
      )
    }
  }

  return (
    <Modal
      hideCloseButton
      ariaLabel={intl.formatMessage({
        id: 'paper-votes-add',
      })}
      show={show}
      width={['100%', '555px']}
    >
      <Modal.Header paddingY={6} borderBottom={`1px solid ${colors.borderColor}`}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading>
            {intl.formatMessage({
              id: 'add-paper-votes',
            })}
          </Heading>
          <Icon
            name={ICON.CROSS}
            onClick={() => {
              onClose()
              clear()
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
              id={isVoteRanking ? 'import-paper-votes-and-points-help-text' : 'import-paper-votes-help-text'}
              values={{
                uri: generateCsvContent(proposals, isVoteRanking),
                fileName: getCsvTitle(projectTitle, selectedStepTitle),
              }}
            />
          </Text>
        </HelpBlock>
        <FileUpload
          accept="text/csv"
          maxSize={CSV_MAX_UPLOAD_SIZE}
          inputProps={{
            id: 'csv-file_field',
          }}
          minSize={1}
          onDrop={(files: Array<DropzoneFile>) => {
            const file = files[0]
            const reader = new window.FileReader()

            reader.onload = () => {
              analyseReaderResult(reader.result)
            }

            reader.onerror = () => {
              setError(
                intl.formatMessage({
                  id: 'invalid-format',
                }),
              )
            }

            reader.readAsText(file)
          }}
        />
        {inputData.length > 0 && (
          <InfoMessage
            variant="success"
            style={{
              wordWrap: 'anywhere',
            }}
            paddingTop={2}
            paddingBottom={0}
            paddingX={0}
            width="100%"
            border="none"
          >
            <InfoMessage.Title withIcon>
              {intl.formatMessage(
                {
                  id: 'count-identified-votes',
                },
                {
                  count: inputData.length,
                },
              )}
            </InfoMessage.Title>
          </InfoMessage>
        )}
        {error && (
          <InfoMessage
            variant="danger"
            style={{
              wordWrap: 'anywhere',
            }}
            paddingTop={2}
            paddingBottom={0}
            paddingX={0}
            width="100%"
            border="none"
          >
            <InfoMessage.Title withIcon>{error}</InfoMessage.Title>
          </InfoMessage>
        )}
        {warning && (
          <InfoMessage
            variant="warning"
            style={{
              wordWrap: 'anywhere',
            }}
            paddingTop={2}
            paddingBottom={0}
            paddingX={0}
            width="100%"
            border="none"
          >
            <InfoMessage.Title withIcon>{warning}</InfoMessage.Title>
          </InfoMessage>
        )}
      </Modal.Body>
      <Modal.Footer as="div" paddingY={4} borderTop={`1px solid ${colors.borderColor}`}>
        <Flex justify="space-between" align="baseline" flex={1}>
          <a
            href="https://aide.cap-collectif.com/article/272-ajouter-des-votes-papiers"
            target="_blank"
            rel="noreferrer"
          >
            <Text color={styleGuideColors.blue500} fontWeight="600">
              <Icon name={ICON.CIRCLE_INFO} size={ICON_SIZE.MD} verticalAlign="-7px" marginRight="4px" />
              <Text as="span" fontWeight={600} className="ml-10">
                {intl.formatMessage({
                  id: 'information',
                })}
              </Text>
            </Text>
          </a>
          <Button
            disabled={inputData.length === 0}
            onClick={() => {
              inputData.forEach((inputDatum: UpdatePaperVoteInput) => {
                UpdatePaperVoteMutation.commit({
                  input: inputDatum,
                })
              })
              clear()
              toast({
                variant: 'success',
                content: intl.formatMessage({
                  id: 'paper-vote-import-success',
                }),
              })
              onClose()
              window.location.reload()
            }}
            variant="primary"
            variantColor="primary"
            variantSize="big"
          >
            {intl.formatMessage({
              id: 'import',
            })}
          </Button>
        </Flex>
      </Modal.Footer>
    </Modal>
  )
}
export default ImportPaperVotesFromCsvModal
