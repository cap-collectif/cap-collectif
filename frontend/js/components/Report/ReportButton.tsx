import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import cn from 'classnames'
import { connect } from 'react-redux'

import styled from 'styled-components'
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon'
import colors from '~/utils/colors'
import LoginOverlay from '../Utils/LoginOverlay'
import type { State } from '~/types'
import '~/types'
import type { BsSize } from '~/types/ReactBootstrap.type'
import '~/types/ReactBootstrap.type'

type Props = {
  id: string
  reported: boolean
  className?: string
  onClick: () => void
  style?: Record<string, any>
  bsSize?: BsSize
  disabled?: boolean
  newDesign?: boolean
}

const getBootstrapClassName = (size: BsSize) => ({
  'btn-lg': size === 'large' || size === 'lg',
  'btn-md': size === 'medium',
  'btn-sm': size === 'small' || size === 'sm',
  'btn-xs': size === 'xsmall' || size === 'xs',
})

const NewReportButton = styled.button`
  border: none;
  background: none;
`
export const ReportButton = ({
  reported,
  className,
  onClick,
  bsSize = 'medium',
  id,
  style = {},
  disabled,
  newDesign,
}: Props) => {
  return (
    <LoginOverlay>
      {newDesign ? (
        <NewReportButton
          id={`report-${id}-button`}
          onClick={reported ? null : onClick}
          active={reported}
          disabled={reported || disabled}
        >
          <Icon name={ICON_NAME.flag} size={10} color={colors.darkGray} />
        </NewReportButton>
      ) : (
        <button
          type="button"
          id={`report-${id}-button`}
          style={style}
          onClick={onClick}
          disabled={reported || disabled}
          className={cn(`btn btn-default`, className, { ...getBootstrapClassName(bsSize), active: reported })}
        >
          <i className="cap cap-flag-1" />
          <FormattedMessage id={reported ? 'global.report.reported' : 'global.report.submit'} />
        </button>
      )}
    </LoginOverlay>
  )
}

const mapStateToProps = (state: State, props: Props) => ({
  reported: props.reported || state.report.elements.includes(props.id),
})

export default connect(mapStateToProps)(ReportButton)
