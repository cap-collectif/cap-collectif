import * as React from 'react'
import { useIntl } from 'react-intl'
import { Flex, FormLabel, Heading, Switch, Text } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useFormContext } from 'react-hook-form'

const NumberRange: React.FC = () => {
  const intl = useIntl()
  const { control, watch, setValue } = useFormContext()

  const isRangeBetween = watch(`temporaryQuestion.isRangeBetween`)
  const rangeMin = watch(`temporaryQuestion.rangeMin`)

  return (
    <Flex direction="column" bg="white" borderRadius="normal" p={6} mt={6}>
      <Flex justify="space-between" alignItems="flex-start">
        <Heading as="h5" color="blue.900" fontWeight={600} fontSize={3}>
          {intl.formatMessage({ id: 'define-range' })}
        </Heading>
        <Switch
          id="number-range"
          checked={isRangeBetween}
          onChange={() => {
            if (isRangeBetween) {
              setValue(`temporaryQuestion.rangeMin`, undefined)
              setValue(`temporaryQuestion.rangeMax`, undefined)
            }
            setValue(`temporaryQuestion.isRangeBetween`, !isRangeBetween)
          }}
        />
      </Flex>
      {isRangeBetween ? (
        <>
          <Text color="gray.700">{intl.formatMessage({ id: 'range-help' })}</Text>
          <Flex mt={4} spacing={2}>
            <FormControl name={`temporaryQuestion.rangeMin`} control={control} position="relative" width="unset">
              <FormLabel
                htmlFor={`temporaryQuestion.rangeMin`}
                label={intl.formatMessage({ id: 'global-minimum-full' })}
              />
              <FieldInput
                id={`temporaryQuestion.rangeMin`}
                name={`temporaryQuestion.rangeMin`}
                control={control}
                type="number"
                min={0}
              />
            </FormControl>
            <FormControl name={`temporaryQuestion.rangeMax`} control={control} position="relative">
              <FormLabel htmlFor={`temporaryQuestion.rangeMax`} label={intl.formatMessage({ id: 'maximum-vote' })} />
              <FieldInput
                id={`temporaryQuestion.rangeMax`}
                name={`temporaryQuestion.rangeMax`}
                control={control}
                type="number"
                min={Number(rangeMin) + 1}
              />
            </FormControl>
          </Flex>
        </>
      ) : null}
    </Flex>
  )
}

export default NumberRange
