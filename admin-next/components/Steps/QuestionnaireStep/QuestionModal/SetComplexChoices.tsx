import * as React from 'react'
import { useIntl } from 'react-intl'
import {
  Box,
  Button,
  ButtonQuickAction,
  CapUIIcon,
  Card,
  Flex,
  FormLabel,
  Heading,
  Switch,
  Text,
  UPLOADER_SIZE,
} from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { UPLOAD_PATH } from '@utils/config'
import TextEditor from '@components/Form/TextEditor/TextEditor'

const SetComplexChoices: React.FC<{ defaultLocale?: string }> = ({ defaultLocale }) => {
  const intl = useIntl()
  const { control, watch, setValue } = useFormContext()

  const {
    fields: choices,
    append,
    remove,
  } = useFieldArray({
    control,
    name: `temporaryQuestion.choices`,
  })

  const otherAllowed = watch(`temporaryQuestion.otherAllowed`)
  const type = watch(`temporaryQuestion.type`)

  return (
    <Flex direction="column" mt={1}>
      <Box>
        <FormLabel mb={2} label={intl.formatMessage({ id: 'admin.fields.reply.group_responses' })} />
        {choices.map((choice, index) => {
          const formFieldName = `temporaryQuestion.choices.${index}`
          return (
            <Card
              key={choice.id}
              mt={4}
              display="flex"
              bg="white"
              position="relative"
              justifyContent="space-between"
              borderRadius="accordion"
            >
              <ButtonQuickAction
                variantColor="red"
                icon={CapUIIcon.Trash}
                label={intl.formatMessage({ id: 'action_delete' })}
                onClick={() => remove(index)}
                position="absolute"
                top={1}
                right={1}
                type="button"
              />
              <Flex direction="column" width="100%" mr={6}>
                <FormControl name={`${formFieldName}.title`} control={control}>
                  <FormLabel htmlFor={`${formFieldName}.title`} label={intl.formatMessage({ id: 'global.title' })} />
                  <FieldInput
                    id={`${formFieldName}.title`}
                    name={`${formFieldName}.title`}
                    control={control}
                    type="text"
                  />
                </FormControl>
                <TextEditor
                  mb={0}
                  name={`${formFieldName}.description`}
                  label={intl.formatMessage({ id: 'global.description' })}
                  platformLanguage={defaultLocale}
                  selectedLanguage={defaultLocale}
                />
              </Flex>
              <FormControl name={`${formFieldName}.image`} control={control} width="auto">
                <FormLabel htmlFor={`${formFieldName}.image`} label={intl.formatMessage({ id: 'illustration' })}>
                  <Text fontSize={2} color="gray.500">
                    {intl.formatMessage({ id: 'global.optional' })}
                  </Text>
                </FormLabel>
                <FieldInput
                  id={`${formFieldName}.image`}
                  name={`${formFieldName}.image`}
                  control={control}
                  type="uploader"
                  format=".jpg,.jpeg,.png,.svg"
                  maxSize={204800}
                  size={UPLOADER_SIZE.SM}
                  showThumbnail
                  uploadURI={UPLOAD_PATH}
                />
              </FormControl>
            </Card>
          )
        })}
        <Button
          variant="tertiary"
          mb={4}
          mt={choices.length ? 4 : 0}
          onClick={() => {
            append({})
          }}
        >
          {intl.formatMessage({ id: 'add-choice' })}
        </Button>
      </Box>
      {type !== 'ranking' ? (
        <Flex justify="space-between" alignItems="flex-start" bg="white" p={4} mb={2} borderRadius="normal">
          <Heading as="h5" color="blue.900" fontWeight={600} fontSize={3}>
            {intl.formatMessage({ id: 'add-other-choice' })}
          </Heading>
          <Switch
            id={`temporaryQuestion.otherAllowed`}
            checked={otherAllowed}
            onChange={() => setValue(`temporaryQuestion.otherAllowed`, !otherAllowed)}
          />
        </Flex>
      ) : null}
    </Flex>
  )
}

export default SetComplexChoices
