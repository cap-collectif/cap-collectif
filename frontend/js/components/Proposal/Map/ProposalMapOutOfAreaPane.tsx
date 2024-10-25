import React, { useEffect, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { useLeafletContext } from '@react-leaflet/core'
import ReactDOM from 'react-dom'
import L from 'leaflet'
import AppBox from '~ui/Primitives/AppBox'
import Toast from '~/components/DesignSystem/Toast/Toast'
import { theme } from '~/styles/theme'
import jsxInnerText from '~/utils/jsxInnerText'
import useTimeout from '@shared/hooks/useTimeout'
import { Emitter } from '~/config'
import { MapEvents } from './Map.events'

const Pane = content => (
  <ThemeProvider theme={theme}>
    <AppBox width={['80vw', 500]} fontSize={14}>
      <Toast position="bottom" content={content} id="pane" variant="warning" />
    </AppBox>
  </ThemeProvider>
)

type Props = {
  readonly content: string
}

const ProposalMapOutOfAreaPane = ({ content }: Props): null => {
  const [show, setShow] = useState(false)
  const context = useLeafletContext()
  const duration = jsxInnerText(content).length * 100 + 500 // we add 500ms to allow transition to complete

  useTimeout(
    () => {
      if (duration && duration > 0) {
        setShow(false)
      }
    },
    duration,
    [show],
  )
  useEffect(() => {
    Emitter.on(MapEvents.ToastShowOnMap, () => {
      setShow(true)
    })
    return () => {
      Emitter.removeAllListeners(MapEvents.ToastShowOnMap)
    }
  }, [])
  useEffect(() => {
    if (!show) return
    const MapInfoComponent = L.Control.extend({
      onAdd: () => {
        const div = L.DomUtil.create('div', 'map-out-of-area')
        const root = ReactDOM.createRoot(div)
        root.render(Pane(content), div)
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
  }, [context.map, content, show])
  return null
}

export default ProposalMapOutOfAreaPane
