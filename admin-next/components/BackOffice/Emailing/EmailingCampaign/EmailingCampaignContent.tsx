import * as React from 'react'
import { useIntl } from 'react-intl'
import { useFormContext } from 'react-hook-form'
import { Box, Flex, FormLabel, Heading, Text } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import TextEditor from '@components/BackOffice/Form/TextEditor/TextEditor'
import type { EmailingCampaignFormValues } from './EmailingCampaign.type'
import SendTestEmailModal from './SendTestEmailModal'

type Props = {
  readonly emailingCampaignId: string
  readonly disabled: boolean
  // Email rendered by the server from the saved content
  readonly preview: string | null
  readonly saveDraft: () => Promise<boolean>
}

const EmailingCampaignContent: React.FC<Props> = ({ emailingCampaignId, disabled, preview, saveDraft }) => {
  const intl = useIntl()
  const { control } = useFormContext<EmailingCampaignFormValues>()

  return (
    <Flex direction="column" spacing={4} bg="white" borderRadius="accordion" p={6}>
      <Flex direction="row" justify="space-between" align="center">
        <Heading as="h4" color="blue.800" fontWeight={600}>
          {intl.formatMessage({ id: 'global.contenu' })}
        </Heading>
        <SendTestEmailModal emailingCampaignId={emailingCampaignId} disabled={disabled} saveDraft={saveDraft} />
      </Flex>

      <FormControl name="object" control={control} isRequired isDisabled={disabled}>
        <FormLabel htmlFor="object" label={intl.formatMessage({ id: 'mail-subject' })} />
        <FieldInput type="text" id="object" name="object" control={control} />
      </FormControl>

      <FormControl name="content" control={control} isRequired isDisabled={disabled}>
        <TextEditor
          label={intl.formatMessage({ id: 'mail-content' })}
          name="content"
          id="content"
          required
          disabled={disabled}
          noModalAdvancedEditor
        />
      </FormControl>

      {preview ? (
        <Flex direction="column" spacing={2}>
          <Text fontWeight={600} color="gray.900">
            {intl.formatMessage({ id: 'global.preview' })}
          </Text>
          {/* Isolated from the back office styles and scripts: the email has its own layout */}
          <Box
            as="iframe"
            title={intl.formatMessage({ id: 'global.preview' })}
            srcDoc={preview}
            sandbox=""
            width="100%"
            height="600px"
            border="normal"
            borderColor="gray.200"
            borderRadius="normal"
          />
        </Flex>
      ) : null}
    </Flex>
  )
}

export default EmailingCampaignContent
