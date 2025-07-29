import * as React from 'react'
import { Flex, FormLabel, Modal, Text } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useFormContext } from 'react-hook-form'

export const SettingsModalTab = (): JSX.Element => {
  const intl = useIntl()
  const methods = useFormContext()
  const { control } = methods

  return (
    <Modal.Body width={'100%'}>
      <Flex direction="column" spacing={2}>
        <FormControl name="title" id="title" control={control} isRequired>
          <FormLabel htmlFor="title" label={intl.formatMessage({ id: 'admin.users.group-name' })} />
          <FieldInput name="title" control={control} type="text" />
        </FormControl>

        <FormControl name="description" id="description" control={control}>
          <FormLabel htmlFor="description" label={intl.formatMessage({ id: 'global.description' })}>
            <Text color="gray.500">{intl.formatMessage({ id: 'global.optional' })}</Text>
          </FormLabel>
          <FieldInput type="textarea" control={control} name="description" />
        </FormControl>
      </Flex>
    </Modal.Body>
  )
}

export default SettingsModalTab
