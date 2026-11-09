import { FieldInput, FormControl } from '@cap-collectif/form'
import { Accordion, CapUIAccordionSize, Flex, FormLabel, Switch } from '@cap-collectif/ui'
import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { OpinionFormValues } from './Opinion.type'
import { NOT_TRASHED } from './utils'

type Props = {
  // Null on creation: the publication is decided when the opinion is saved
  published: boolean | null
}

const OpinionFormSide: React.FC<Props> = ({ published }) => {
  const intl = useIntl()
  const { control, watch } = useFormContext<OpinionFormValues>()
  const isTrashed = watch('trashedStatus') !== NOT_TRASHED

  const trashedStatusOptions = [
    { value: NOT_TRASHED, label: intl.formatMessage({ id: 'global.none.feminine' }) },
    { value: 'VISIBLE', label: intl.formatMessage({ id: 'trashed-visible-content' }) },
    { value: 'INVISIBLE', label: intl.formatMessage({ id: 'trashed-hidden-content' }) },
  ]

  return (
    <Accordion
      allowMultiple
      size={CapUIAccordionSize.md}
      sx={{ '.cap-accordion__button p': { fontWeight: 600 } }}
      defaultAccordion={['publication']}
      color="white"
    >
      <Accordion.Item id="publication">
        <Accordion.Button>{intl.formatMessage({ id: 'admin.fields.opinion.group_publication' })}</Accordion.Button>
        <Accordion.Panel>
          {/* Read only, as in Sonata: the publication is set when the opinion is created */}
          {published !== null ? (
            <Flex direction="column" spacing="xxs" mb="lg">
              <FormLabel htmlFor="published" label={intl.formatMessage({ id: 'global.published' })} />
              <Switch id="published" checked={published} disabled />
            </Flex>
          ) : null}

          <FormControl name="pinned" control={control}>
            <FormLabel htmlFor="pinned" label={intl.formatMessage({ id: 'admin.fields.comment.pinned' })} />
            <FieldInput type="switch" name="pinned" control={control} id="pinned" />
          </FormControl>

          <FormControl name="trashedStatus" control={control}>
            <FormLabel htmlFor="trashedStatus" label={intl.formatMessage({ id: 'global.is_trashed' })} />
            <FieldInput
              type="select"
              id="trashedStatus"
              name="trashedStatus"
              control={control}
              options={trashedStatusOptions}
            />
          </FormControl>

          {isTrashed ? (
            <FormControl name="trashedReason" control={control}>
              <FormLabel htmlFor="trashedReason" label={intl.formatMessage({ id: 'global.trashed_reason' })} />
              <FieldInput type="textarea" id="trashedReason" name="trashedReason" control={control} />
            </FormControl>
          ) : null}
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default OpinionFormSide
