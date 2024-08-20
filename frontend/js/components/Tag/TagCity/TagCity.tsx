import * as React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import type { TagCity_address } from '~relay/TagCity_address.graphql'
import { formatAddressFromGoogleAddress, getCityFromGoogleAddress } from '~/utils/googleMapAddress'
import Tag from '~/components/Ui/Labels/Tag'
import colors from '~/utils/colors'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import IconRounded from '@shared/ui/LegacyIcons/IconRounded'
type Props = {
  readonly address: TagCity_address
  readonly size: string
}
export const TagCity = ({ address, size }: Props) => {
  const addressFormatted = formatAddressFromGoogleAddress(JSON.parse(address.json)[0])
  return (
    <Tag size={size}>
      <IconRounded size={18} color={colors.darkGray}>
        <Icon name={ICON_NAME.pin2} color="#fff" size={10} />
      </IconRounded>

      {getCityFromGoogleAddress(addressFormatted)}
    </Tag>
  )
}
export default createFragmentContainer(TagCity, {
  address: graphql`
    fragment TagCity_address on GoogleMapsAddress {
      json
    }
  `,
})
