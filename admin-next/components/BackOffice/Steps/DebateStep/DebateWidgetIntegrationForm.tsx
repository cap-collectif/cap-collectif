import React from 'react'
import { Box, CapUIFontSize, CapUIIcon, Flex, FormLabel, Icon, Input, Text, toast, Tooltip } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useIntl } from 'react-intl'
import { useForm } from 'react-hook-form'
import { getBaseUrl } from 'config'
import { graphql, useFragment } from 'react-relay'
import { DebateWidgetIntegrationForm_debate$key } from '@relay/DebateWidgetIntegrationForm_debate.graphql'

type Props = {
  debate: DebateWidgetIntegrationForm_debate$key
}

type FormValues = {
  bgColor: string
  borderColor: string
  height: string
  width: string
  destinationLink: string
  integrationCode: string
}

const DEBATE_FRAGMENT = graphql`
  fragment DebateWidgetIntegrationForm_debate on Debate {
    id
  }
`

const DebateWidgetIntegrationForm: React.FC<Props> = ({ debate: debateRef }) => {
  const debate = useFragment(DEBATE_FRAGMENT, debateRef)
  const intl = useIntl()

  const defaultValues: FormValues = {
    bgColor: '',
    borderColor: '',
    height: '',
    width: '',
    destinationLink: '',
    integrationCode: '',
  }
  const { control, watch } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: defaultValues,
  })

  const getWidgetUrl = () => {
    const baseUrl = getBaseUrl()
    const debateId = debate?.id
    const bgColor = watch('bgColor')
    const borderColor = watch('borderColor')
    const height = watch('height')
    const width = watch('width')
    const destinationLink = watch('destinationLink')

    const url = `<iframe src="${baseUrl}/widget_debate/${debateId}?background=${bgColor}&destination=${destinationLink}" width="${width}" style="border: 1px solid ${borderColor}; height: ${height}"></iframe>`
    return url
  }

  return (
    <form>
      <Text color="gray.700" fontSize={CapUIFontSize.BodyRegular} mb={6}>
        {intl.formatMessage({ id: 'help-widget-integration' })}
      </Text>
      <Box>
        <Flex alignItems="center" mb={4}>
          <FormLabel label={intl.formatMessage({ id: 'widget-appearance' })} />
          <Text ml={1} color="gray.500">
            {intl.formatMessage({ id: 'global.optional' })}
          </Text>
        </Flex>
        <Flex mb={4} spacing={4}>
          <FormControl name="bgColor" control={control} width="130px" position="relative">
            <FormLabel htmlFor="bgColor" label={intl.formatMessage({ id: 'background' })} />
            <FieldInput type="colorPicker" control={control} name="bgColor" id="bgColor" />
          </FormControl>
          <FormControl name="borderColor" control={control} width="130px" position="relative">
            <FormLabel htmlFor="borderColor" label={intl.formatMessage({ id: 'border' })} />
            <FieldInput type="colorPicker" control={control} name="borderColor" id="borderColor" />
          </FormControl>
          <FormControl name="height" control={control} width="130px">
            <FormLabel htmlFor="height" label={intl.formatMessage({ id: 'global.height' })} />
            <FieldInput type="text" control={control} name="height" id="height" />
          </FormControl>
          <FormControl name="width" control={control} width="130px">
            <FormLabel htmlFor="width" label={intl.formatMessage({ id: 'global.width' })} />
            <FieldInput type="text" control={control} name="width" id="width" />
          </FormControl>
        </Flex>
        <FormControl name="destinationLink" control={control}>
          <Flex alignItems="center" spacing={1}>
            <FormLabel htmlFor="destinationLink" label={intl.formatMessage({ id: 'destination-link' })} />
            <Text color="gray.500">{intl.formatMessage({ id: 'global.optional' })}</Text>
            <Tooltip label={intl.formatMessage({ id: 'allow-display-contributions-sources' })}>
              <Box>
                <Icon name={CapUIIcon.Info} color="blue.500" />
              </Box>
            </Tooltip>
          </Flex>
          <FieldInput
            id="destinationLink"
            name="destinationLink"
            control={control}
            type="text"
            placeholder={intl.formatMessage({ id: 'paste-widget-destination-link' })}
          />
        </FormControl>
        <FormControl name="integrationCode" control={control}>
          <Flex>
            <FormLabel htmlFor="integrationCode" label={intl.formatMessage({ id: 'integration-code' })} />
            <Tooltip label={intl.formatMessage({ id: 'copy-paste-in-html-page' })}>
              <Box>
                <Icon name={CapUIIcon.Info} color="blue.500" />
              </Box>
            </Tooltip>
          </Flex>
          <Input
            type="text"
            value={getWidgetUrl()}
            onClickActions={[
              {
                icon: CapUIIcon.Duplicate,
                onClick: () =>
                  navigator.clipboard.writeText(getWidgetUrl()).then(() => {
                    toast({
                      variant: 'info',
                      content: intl.formatMessage({ id: 'copied-link' }),
                    })
                  }),
                label: intl.formatMessage({ id: 'copy-link' }),
              },
            ]}
          />
        </FormControl>
      </Box>
    </form>
  )
}

export default DebateWidgetIntegrationForm
