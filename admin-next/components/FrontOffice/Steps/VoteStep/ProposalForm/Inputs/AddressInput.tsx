import { FieldInput, FormControl } from '@cap-collectif/form'
import { Button, CapUIIconSize, Flex, FormLabel, Spinner, Text } from '@cap-collectif/ui'
import { useJsApiLoader } from '@react-google-maps/api'
import * as React from 'react'
import { Control } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { FormValues } from '../ProposalFormModal.type'

const GOOGLE_MAPS_LIBRARIES: 'places'[] = ['places']

type Props = {
  control: Control<FormValues>
  addressHelpText: string | null
  showLocateButton: boolean
  onAddressChange?: (address: any) => void
}

const AddressInput: React.FC<Props> = ({ control, addressHelpText, showLocateButton, onAddressChange }) => {
  const intl = useIntl()
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  })

  return (
    <>
      <FormControl name="address" control={control}>
        <FormLabel label={intl.formatMessage({ id: 'proposal_form.address' })} htmlFor="address" />
        {isLoaded ? (
          <FieldInput
            type="address"
            control={control}
            name="address"
            id="address"
            placeholder={intl.formatMessage({ id: 'proposal_form.address' })}
            getAddress={onAddressChange}
          />
        ) : (
          <Flex align="center" gap={2} p={2} border="1px solid" borderColor="gray.200" borderRadius="normal">
            <Spinner size={CapUIIconSize.Sm} />
            <Text color="text.tertiary" fontSize="sm">
              {intl.formatMessage({ id: 'global.loading' })}
            </Text>
          </Flex>
        )}
        {addressHelpText && (
          <Text color="text.tertiary" fontSize="sm" mt={1}>
            {addressHelpText}
          </Text>
        )}
      </FormControl>

      {showLocateButton && (
        <Button variant="link" variantColor="primary" pl={0} pt={0}>
          {intl.formatMessage({ id: 'front.proposal.locate-on-map' })}
        </Button>
      )}
    </>
  )
}

export default AddressInput
