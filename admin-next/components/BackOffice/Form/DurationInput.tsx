import { Box, BoxProps, CapUIFontSize, CapUILineHeight, Flex, FormLabel, Text } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { useFormContext } from 'react-hook-form'

type DurationProps = {
  startAt?: {
    required: boolean
  }
  endAt?: {
    required: boolean
  }
  disabled?: boolean
}

const DurationInput: React.FC<DurationProps & BoxProps> = ({
  startAt = { required: true },
  endAt = { required: false },
  disabled,
  ...rest
}) => {
  const intl = useIntl()
  const { control } = useFormContext()

  return (
    <Box color="gray.900" sx={{ '.cap-input-group': { maxWidth: 'fit-content' } }} {...rest}>
      <Flex>
        <FormControl name="startAt" control={control} width="max-content" mr={6} isRequired={startAt.required}>
          <FormLabel htmlFor="startAt" label={intl.formatMessage({ id: 'start-date' })}>
            {!startAt.required && (
              <Text fontSize={CapUIFontSize.BodySmall} color="gray.500" lineHeight={CapUILineHeight.S}>
                {intl.formatMessage({ id: 'global.optional' })}
              </Text>
            )}
          </FormLabel>
          <FieldInput id="startAt" name="startAt" control={control} type="dateHour" disabled={disabled} />
        </FormControl>
        <FormControl name="endAt" control={control} width="max-content" isRequired={endAt.required}>
          <FormLabel htmlFor="endAt" label={intl.formatMessage({ id: 'ending-date' })}>
            {!endAt.required && (
              <Text fontSize={CapUIFontSize.BodySmall} color="gray.500" lineHeight={CapUILineHeight.S}>
                {intl.formatMessage({ id: 'global.optional' })}
              </Text>
            )}
          </FormLabel>
          <FieldInput id="endAt" name="endAt" control={control} type="dateHour" disabled={disabled} />
        </FormControl>
      </Flex>
    </Box>
  )
}

export default DurationInput
