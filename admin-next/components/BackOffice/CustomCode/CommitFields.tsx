import { FormControl, FieldInput } from '@cap-collectif/form'
import { Box, Flex, FormLabel, Text } from '@cap-collectif/ui'
import { FC } from 'react'
import { useIntl } from 'react-intl'
import { CommitFormControl } from './customCodeVersioning.types'

type CommitFieldsProps = {
  control: CommitFormControl
  errorMessage: string | null
}

export const CommitFields: FC<CommitFieldsProps> = ({ control, errorMessage }) => {
  const intl = useIntl()

  return (
    <Flex direction="column" spacing={4}>
      {errorMessage ? (
        <Box bg="red.100" borderRadius="8px" p={3}>
          <Text color="red.700">{errorMessage}</Text>
        </Box>
      ) : null}
      <FormControl name="title" control={control} isRequired>
        <FormLabel htmlFor="title" label={intl.formatMessage({ id: 'global.title' })} />
        <FieldInput id="title" name="title" control={control} type="text" />
      </FormControl>
      <FormControl name="authorName" control={control} isRequired>
        <FormLabel htmlFor="authorName" label={intl.formatMessage({ id: 'admin.custom-code.author-label' })} />
        <FieldInput id="authorName" name="authorName" control={control} type="text" />
      </FormControl>
      <FormControl name="description" control={control}>
        <FormLabel htmlFor="description" label={intl.formatMessage({ id: 'global.description' })} />
        <FieldInput id="description" name="description" control={control} type="textarea" rows={4} />
      </FormControl>
      <FormControl name="referenceUrl" control={control}>
        <FormLabel htmlFor="referenceUrl" label={intl.formatMessage({ id: 'admin.custom-code.reference-url-label' })} />
        <FieldInput id="referenceUrl" name="referenceUrl" control={control} type="text" placeholder="https://..." />
      </FormControl>
    </Flex>
  )
}
