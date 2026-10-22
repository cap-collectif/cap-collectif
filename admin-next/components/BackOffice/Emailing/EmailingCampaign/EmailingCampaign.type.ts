export type SendingMode = 'NOW' | 'PLANNED'

export type RecipientType = 'MAILING_LIST' | 'INTERNAL' | 'GROUP' | 'PROJECT'

export type RecipientOption = {
  readonly value: string
  readonly label: string
  readonly type: RecipientType
}

export type RecipientOptionGroup = {
  readonly label: string
  readonly options: RecipientOption[]
}

export type EmailingCampaignFormValues = {
  name: string
  senderEmail: string
  // Global id of a mailing list, group or project, or the name of an internal list
  recipient: string | null
  object: string
  content: string
  // Value shape of the radio FieldInput of @cap-collectif/form
  sendingMode: { labels: SendingMode[] }
  sendAt: string | null
}

// Read by the yup schema through `$isSending`: sending requires a complete campaign, saving a draft does not
export type EmailingCampaignFormContext = {
  isSending: boolean
}
