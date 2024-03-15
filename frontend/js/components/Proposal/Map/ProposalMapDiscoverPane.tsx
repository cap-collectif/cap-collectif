import React, { useEffect } from 'react'
import type { IntlShape } from 'react-intl'
import { useIntl } from 'react-intl'
import { useLeafletContext } from '@react-leaflet/core'
import ReactDOM from 'react-dom'
import L from 'leaflet'
import Icon, { ICON_NAME } from '~ds/Icon/Icon'
import AppBox from '~ui/Primitives/AppBox'
import Text from '~ui/Primitives/Text'
import MapClickSVG from './MapClickSVG'
import MapSelectSVG from './MapSelectSVG'

type Props = {
  show: boolean
  handleClose: () => void
  type?: 'CLICK' | 'SELECT'
}
export const Pane = ({ intl, type }: { intl: IntlShape; type: 'CLICK' | 'SELECT' }) => (
  <AppBox
    position="relative"
    width="132px"
    display="flex"
    flexDirection="column"
    alignItems="center"
    bg="white"
    p={3}
    borderRadius="4px"
  >
    {type === 'CLICK' ? <MapClickSVG /> : <MapSelectSVG />}
    <Icon name={ICON_NAME.CROSS} size="sm" cursor="pointer" position="absolute" right={22} top={12} color="gray.500" />
    <Text fontFamily="OpenSans" color="gray.700" textAlign="center" fontSize={11}>
      {intl.formatMessage({
        id: type === 'CLICK' ? 'click-on-map-to-deposit' : 'select-on-map',
      })}
    </Text>
  </AppBox>
)

const ProposalMapDiscoverPane = ({ show, handleClose, type = 'CLICK' }: Props): null => {
  const context = useLeafletContext()
  const intl = useIntl()
  useEffect(() => {
    if (!show) return
    const MapInfoComponent = L.Control.extend({
      onAdd: () => {
        const div = L.DomUtil.create('div', 'map-discover')
        const root = ReactDOM.createRoot(div)
        root.render(
          Pane({
            intl,
            type,
          }),
          div,
        )
        L.DomEvent.on(div, 'click', L.DomEvent.stopPropagation)
        div.addEventListener('click', handleClose)
        return div
      },
    })
    const mapInfoInstance = new MapInfoComponent({
      position: 'topright',
    })
    mapInfoInstance.addTo(context.map)
    return (): void => {
      mapInfoInstance.remove()
    }
  }, [context.map, intl, show, handleClose, type])
  return null
}

export default ProposalMapDiscoverPane
