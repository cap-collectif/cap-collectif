import * as React from 'react'
import { FormattedHTMLMessage, useIntl } from 'react-intl'
import { Controller, useFormContext } from 'react-hook-form'
import {
  Box,
  Button,
  CapUIFontSize,
  CapUIIcon,
  CapUIIconSize,
  Flex,
  FormLabel,
  Heading,
  Icon,
  Select,
  Text,
  Tooltip,
} from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import MembersModal, { Recipient } from '../Members/MembersModal'
import type { EmailingCampaignFormValues, RecipientOption, RecipientOptionGroup } from './EmailingCampaign.type'

export type RecipientSummary = {
  readonly recipient: Recipient
  readonly consentingCount: number
  readonly projectTitle?: string | null
}

type Props = {
  readonly disabled: boolean
  readonly senderEmails: ReadonlyArray<string>
  readonly recipientOptions: Array<RecipientOption | RecipientOptionGroup>
  readonly recipientPlaceholder: string
  // Members of the saved recipient: hidden while another recipient is selected but not saved yet
  readonly recipientSummary: RecipientSummary | null
}

const isGroup = (option: RecipientOption | RecipientOptionGroup): option is RecipientOptionGroup => 'options' in option

const EmailingCampaignParameters: React.FC<Props> = ({
  disabled,
  senderEmails,
  recipientOptions,
  recipientPlaceholder,
  recipientSummary,
}) => {
  const intl = useIntl()
  const { control } = useFormContext<EmailingCampaignFormValues>()
  const flatRecipientOptions = recipientOptions.flatMap(option => (isGroup(option) ? option.options : [option]))

  return (
    <Flex direction="column" spacing={4} bg="white" borderRadius="accordion" p={6}>
      <Heading as="h4" color="blue.800" fontWeight={600}>
        {intl.formatMessage({ id: 'admin-title-parameter-mailing-list' })}
      </Heading>

      <FormControl name="name" control={control} isRequired isDisabled={disabled}>
        <FormLabel htmlFor="name" label={intl.formatMessage({ id: 'campaign-title' })} />
        <FieldInput type="text" id="name" name="name" control={control} />
      </FormControl>

      <FormControl name="senderEmail" control={control} isRequired isDisabled={disabled}>
        <FormLabel htmlFor="senderEmail" label={intl.formatMessage({ id: 'sender-address' })} />
        <FieldInput
          type="select"
          id="senderEmail"
          name="senderEmail"
          control={control}
          placeholder={intl.formatMessage({ id: 'global.placeholder.email' })}
          options={senderEmails.map(address => ({ value: address, label: address }))}
        />
      </FormControl>

      <FormControl name="recipient" control={control} isRequired isDisabled={disabled}>
        <FormLabel htmlFor="recipient" label={intl.formatMessage({ id: 'recipient' })} />
        {/* Grouped options: the Select of @cap-collectif/form only finds the selected value in a flat list */}
        <Controller
          name="recipient"
          control={control}
          render={({ field }) => (
            <Select
              inputId="recipient"
              isClearable
              isDisabled={disabled}
              placeholder={recipientPlaceholder}
              noOptionsMessage={() => intl.formatMessage({ id: 'result-not-found' })}
              options={recipientOptions}
              value={flatRecipientOptions.find(option => option.value === field.value) ?? null}
              onChange={option => field.onChange((option as RecipientOption | null)?.value ?? null)}
              onBlur={field.onBlur}
            />
          )}
        />
      </FormControl>

      {recipientSummary ? (
        <Flex direction="row" align="center" spacing={2} wrap="wrap">
          <Icon name={CapUIIcon.UserO} size={CapUIIconSize.Md} color="gray.500" />
          <Text>
            {recipientSummary.consentingCount}{' '}
            {intl.formatMessage({ id: 'global.members' }, { num: recipientSummary.consentingCount })}
          </Text>
          <Tooltip
            label={intl.formatMessage(
              { id: 'has-consent-to-internal-email' },
              { num: recipientSummary.consentingCount },
            )}
          >
            <Flex>
              <Icon name={CapUIIcon.Info} size={CapUIIconSize.Md} color="blue.500" />
            </Flex>
          </Tooltip>
          {recipientSummary.projectTitle ? <Text color="gray.700">{recipientSummary.projectTitle}</Text> : null}
          {recipientSummary.consentingCount > 0 ? (
            <MembersModal
              recipient={recipientSummary.recipient}
              disclosure={
                <Button variant="link" variantColor="primary" aria-haspopup="dialog">
                  {intl.formatMessage({ id: 'consult-members' })}
                </Button>
              }
            />
          ) : null}
        </Flex>
      ) : null}

      <Box color="gray.700" fontSize={CapUIFontSize.BodySmall}>
        <FormattedHTMLMessage id="admin-help-mailing-list-access" values={{ linkProject: '/admin-next/projects' }} />
      </Box>
    </Flex>
  )
}

export default EmailingCampaignParameters
