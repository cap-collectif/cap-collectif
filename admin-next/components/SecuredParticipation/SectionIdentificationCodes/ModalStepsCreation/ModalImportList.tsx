import type { ChangeEvent, FC } from 'react'
import {
  Button,
  CapUIIcon,
  Flex,
  FormControl,
  FormGuideline,
  FormLabel,
  Heading,
  Input,
  MultiStepModal,
  Text,
  Uploader,
  useMultiStepModal,
} from '@cap-collectif/ui'
import { FormattedHTMLMessage, useIntl } from 'react-intl'
import { extractAndSetData } from '../FileAnalyse'
import IdentificationCodesListCreationModalFormUploadAnalyse from './IdentificationCodesListCreationModalFormUploadAnalyse'
import { CSVModelName, CSVModelURI } from './CSVModel'
import type { DataType } from '../DataType'
import { CreateUserIdentificationCodeListMutation$data } from '@relay/CreateUserIdentificationCodeListMutation.graphql'
import CreateUserIdentificationCodeListMutation from '@mutations/CreateUserIdentificationCodeListMutation'

type ModalImportListProps = {
  connectionName: string
  isFirst?: boolean
  name: string
  setName: (name: string) => void
  setData: (data: DataType) => void
  setResponse: (data: CreateUserIdentificationCodeListMutation$data) => void
  data: DataType | null
}

const DEFAULT_CODE_LENGTH = 8

const onSubmit = (
  data: DataType,
  name: string,
  connectionName: string,
  setResponse: (data: CreateUserIdentificationCodeListMutation$data) => void,
  isFirst?: boolean,
) => {
  return CreateUserIdentificationCodeListMutation.commit({
    input: {
      data: data.validData,
      name: name,
      codeLength: DEFAULT_CODE_LENGTH,
    },
    connections: [connectionName],
  }).then((value: CreateUserIdentificationCodeListMutation$data) => {
    /* There is no second step when creating for the first time */
    if (!isFirst) setResponse(value)
  })
}

const ModalImportList: FC<ModalImportListProps> = ({
  setData,
  name,
  setName,
  setResponse,
  data,
  connectionName,
  isFirst,
}) => {
  const intl = useIntl()
  const { goToNextStep, hide } = useMultiStepModal()

  return (
    <>
      <MultiStepModal.Header>
        <Heading>{intl.formatMessage({ id: 'import-list' })}</Heading>
      </MultiStepModal.Header>
      <MultiStepModal.Body>
        <Flex as="form" direction="column" width="100%" id="create-code-identification-list">
          <Text color="gray.400" mb={4} sx={{ '& a': { color: 'blue.500', textDecoration: 'underline' } }}>
            <FormattedHTMLMessage
              id="identification-code-import-users-help"
              values={{
                uri: CSVModelURI,
                fileName: CSVModelName,
              }}
            />
          </Text>

          <FormControl mb={4}>
            <FormLabel label={intl.formatMessage({ id: 'list-name' })} />
            <Input
              id="name"
              name="name"
              type="text"
              placeholder={intl.formatMessage({ id: 'choose-name' })}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            />
          </FormControl>

          <FormControl mt={1} mb={2}>
            <FormLabel label={intl.formatMessage({ id: 'import-your-list' })} />
            <FormGuideline>
              {intl.formatMessage({ id: 'uploader.banner.format' }) +
                ' csv. ' +
                intl.formatMessage({ id: 'uploader.banner.weight' }) +
                ' 10mo.'}
            </FormGuideline>
            <Uploader
              onDrop={(acceptedFiles: File[]) => {
                extractAndSetData(acceptedFiles[0], data => {
                  setData(data)
                })
              }}
              wording={{
                fileDeleteLabel: intl.formatMessage({ id: 'admin.global.delete' }),
                uploaderPrompt: intl.formatMessage({ id: 'uploader-prompt' }, { count: 1, fileType: 'csv' }),
                uploaderLoadingPrompt: intl.formatMessage({
                  id: 'page-media-add--loading',
                }),
              }}
            />
          </FormControl>
          {data && <IdentificationCodesListCreationModalFormUploadAnalyse data={data} />}
        </Flex>
      </MultiStepModal.Body>
      <MultiStepModal.Footer>
        <Button variant="secondary" variantColor="hierarchy" variantSize="medium" onClick={hide}>
          {intl.formatMessage({ id: 'cancel' })}
        </Button>
        <Button
          variant="secondary"
          variantColor="primary"
          variantSize="medium"
          rightIcon={CapUIIcon.LongArrowRight}
          disabled={!name && !data}
          onClick={async () => {
            if (data) {
              await onSubmit(data, name, connectionName, setResponse, isFirst)
              if (!isFirst) goToNextStep()
            }
          }}
        >
          {intl.formatMessage({ id: 'code-generate' })}
        </Button>
      </MultiStepModal.Footer>
    </>
  )
}

export default ModalImportList
