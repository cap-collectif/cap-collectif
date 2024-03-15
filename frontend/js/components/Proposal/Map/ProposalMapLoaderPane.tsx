import React, { useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { useLeafletContext } from '@react-leaflet/core'
import ReactDOM from 'react-dom'
import L from 'leaflet'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'
import Loader from '~/components/Ui/FeedbacksIndicators/Loader'
import { LoaderPane } from './ProposalLeafletMap.style'

type Props = {
  hasError: boolean
  retry: () => void
}

const Pane = (hasError, retry, isOffline, intl) => (
  <LoaderPane>
    {isOffline ? (
      <div>
        <Icon name={ICON_NAME.wifiOff} size={14} color="#ff8b00" />
        {intl.formatMessage({
          id: 'attempt.to.connect',
        })}
      </div>
    ) : hasError ? (
      <div>
        <Icon name={ICON_NAME.removeCircle} size={14} color="#f00040" />
        {intl.formatMessage({
          id: 'loading.failed.retry',
        })}
        <button onClick={retry} type="button">
          {intl.formatMessage({
            id: 'global.retry',
          })}
        </button>
      </div>
    ) : (
      <div>
        <Loader size={14} />
        {intl.formatMessage({
          id: 'loading.proposals',
        })}
      </div>
    )}
  </LoaderPane>
)

const ProposalMapLoaderPane = ({ hasError, retry }: Props): null => {
  const context = useLeafletContext()
  const intl = useIntl()
  const [isOffline, setIsOffline] = useState<boolean>(!window.navigator.onLine)
  useEffect(() => {
    window.addEventListener('offline', () => setIsOffline(true))
    window.addEventListener('online', () => setIsOffline(false))
    return () => {
      window.removeEventListener('offline', () => setIsOffline(true))
      window.removeEventListener('online', () => setIsOffline(false))
    }
  })
  useEffect(() => {
    const MapInfoComponent = L.Control.extend({
      onAdd: () => {
        const div = L.DomUtil.create('div', 'map-loader')
        const root = ReactDOM.createRoot(div)
        root.render(Pane(hasError, retry, isOffline, intl), div)
        L.DomEvent.on(div, 'click', L.DomEvent.stopPropagation)
        return div
      },
    })
    const mapInfoInstance = new MapInfoComponent({
      position: 'bottomleft',
    })
    mapInfoInstance.addTo(context.map)
    return (): void => {
      mapInfoInstance.remove()
    }
  }, [context.map, hasError, retry, isOffline, intl])
  return null
}

export default ProposalMapLoaderPane
