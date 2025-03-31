import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { CapUIFontSize, CapUILineHeight, Text, Tooltip } from '@cap-collectif/ui'

type Props = {
  show: boolean
  type: string
}

const PinnedLabel = ({ show, type }: Props) => {
  const intl = useIntl()

  if (show) {
    return (
      <Tooltip
        placement="bottom"
        label={
          <Text textAlign="center" fontSize={CapUIFontSize.Caption} lineHeight={CapUILineHeight.S} marginBottom={0}>
            {intl.formatMessage({
              id: `global.pinned.tooltip.${type}`,
            })}
          </Text>
        }
        className="in"
        id="pinned-label"
        style={{
          wordBreak: 'break-word',
          marginBottom: 0,
        }}
      >
        <span className="opinion__label opinion__label--blue">
          <i className="cap cap-pin-1" /> <FormattedMessage id="global.pinned.label" />
        </span>
      </Tooltip>
    )
  }

  return null
}

export default PinnedLabel
