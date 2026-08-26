import { FieldInput, FormControl } from '@cap-collectif/form'
import type { AddressComplete } from '@cap-collectif/form'
import { Button, CapUIIconSize, Flex, FormLabel, Spinner, Text } from '@cap-collectif/ui'
import { useJsApiLoader } from '@react-google-maps/api'
import dynamic from 'next/dynamic'
import * as React from 'react'
import { Control, useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { FormValues } from '../ProposalFormModal.type'

const LocateOnMapModal = dynamic(() => import('../LocateOnMapModal'), { ssr: false })
const AddressMapPreview = dynamic(() => import('./AddressMapPreview'), { ssr: false })

const GOOGLE_MAPS_LIBRARIES: 'places'[] = ['places']

type Props = {
  control: Control<FormValues>
  addressHelpText: string | null
  showLocateButton: boolean
  onAddressChange?: (address: AddressComplete | null) => void
  currentAddress?: AddressComplete | null
  initialPosition?: { lat: number; lng: number } | null
  category?: { color?: string | null; icon?: string | null } | null
  mapCenter?: { lat: number; lng: number } | null
  proposalInAZoneRequired: boolean
  districts: any[]
  onDistrictChange: (district: string | null) => void
}

const AddressInput: React.FC<Props> = ({
  control,
  addressHelpText,
  showLocateButton,
  onAddressChange,
  currentAddress,
  initialPosition,
  category,
  mapCenter,
  proposalInAZoneRequired,
  districts,
  onDistrictChange,
}) => {
  const intl = useIntl()
  const { setValue } = useFormContext<FormValues>()
  const [showMapModal, setShowMapModal] = React.useState(false)
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  })

  const handleMapAddressConfirm = (address: AddressComplete) => {
    setValue('address', address.formatted_address)
    onAddressChange?.(address)
  }

  React.useEffect(() => {
    if (!isLoaded || !initialPosition || currentAddress) return

    new window.google.maps.Geocoder().geocode({ location: initialPosition }).then(response => {
      const address = response.results?.[0]
      if (!address) return
      const completeAddress = {
        ...address,
        geometry: { ...address.geometry, location: initialPosition },
      } as unknown as AddressComplete
      setValue('address', completeAddress.formatted_address)
      onAddressChange?.(completeAddress)
    })
  }, [currentAddress, initialPosition, isLoaded, onAddressChange, setValue])

  return (
    <>
      <FormControl name="address" control={control} mb={showLocateButton ? 1 : 4}>
        <FormLabel label={intl.formatMessage({ id: 'proposal_form.address' })} htmlFor="address" />
        {isLoaded ? (
          <FieldInput
            type="address"
            control={control}
            name="address"
            id="address"
            placeholder={intl.formatMessage({ id: 'proposal_form.address' })}
            getAddress={onAddressChange}
            width="100%"
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

      {currentAddress && <AddressMapPreview address={currentAddress} category={category} />}

      {showLocateButton && (
        <Button variant="link" variantColor="primary" pl={0} pt={0} onClick={() => setShowMapModal(true)}>
          {intl.formatMessage({ id: currentAddress ? 'edit-on-card' : 'locate-on-card' })}
        </Button>
      )}

      {isLoaded && (
        <LocateOnMapModal
          show={showMapModal}
          onClose={() => setShowMapModal(false)}
          onConfirm={handleMapAddressConfirm}
          initialAddress={currentAddress || null}
          category={category || null}
          mapCenter={mapCenter || null}
          proposalInAZoneRequired={proposalInAZoneRequired}
          districts={districts}
          onDistrictChange={onDistrictChange}
        />
      )}
    </>
  )
}

export default AddressInput
