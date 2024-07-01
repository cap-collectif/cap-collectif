import * as React from 'react'
import type { Node } from 'react'
import 'react'
import { FormattedMessage } from 'react-intl'
import { Button, Overlay } from 'react-bootstrap'
import classNames from 'classnames'
import type { PropsCommonCheckboxRadio } from '~ui/Form/Input/commonCheckboxRadio'
import type { LabelSide } from '~ui/Toggle/Toggle.style'
import {
  ToggleContainer,
  TogglerWrapper,
  LabelContainer,
  TooltipContent,
  TooltipFooter,
  CloseButton,
  PopoverContainer,
} from '~ui/Toggle/Toggle.style'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'
import colors from '~/utils/colors'

export type Tooltip = {
  content: JSX.Element | JSX.Element[] | string
  width?: string
}
type Props = PropsCommonCheckboxRadio & {
  id?: string
  name?: string
  helpText?: Node | string
  value?: string
  checked?: boolean | null | undefined
  labelSide?: LabelSide
  tooltip?: Tooltip | null | undefined
  bold?: boolean
} & any

const Toggle = ({
  label,
  className,
  id,
  name,
  value,
  onChange,
  onBlur,
  disabled = false,
  checked = false,
  labelSide = 'RIGHT',
  tooltip,
  helpText,
  bold,
  roledescription,
}: Props) => {
  const referenceToggle = React.useRef(null)
  const [isTooltipShow, setIsTooltipShow] = React.useState<boolean>(false)

  const handleChange = e => {
    const { checked: isChecked } = e.target

    if (!isChecked && tooltip) {
      return setIsTooltipShow(true)
    }

    if (onChange) onChange(e, isChecked)
  }

  const classes = classNames({
    checked,
    unchecked: !checked,
    labelContainer: true,
  })
  return (
    <ToggleContainer className={className}>
      <div>
        <LabelContainer
          className={classNames(classes)}
          disabled={disabled}
          htmlFor={id}
          labelSide={labelSide}
          bold={bold}
        >
          <TogglerWrapper disabled={disabled} checked={checked} ref={referenceToggle} id={`TOGGLE_${name || ''}`}>
            <span className="circle-toggler" />

            {tooltip && (
              <Overlay show={isTooltipShow} placement="top" target={referenceToggle.current}>
                <PopoverContainer id="tooltip-toggle" width={tooltip.width}>
                  <TooltipContent>
                    {tooltip.content}

                    <CloseButton type="button" onClick={() => setIsTooltipShow(false)}>
                      <Icon name={ICON_NAME.close} size={12} color={colors.darkGray} />
                    </CloseButton>
                  </TooltipContent>

                  <TooltipFooter>
                    <Button onClick={() => setIsTooltipShow(false)} className="btn-cancel">
                      <FormattedMessage id="global.cancel" />
                    </Button>
                    <Button
                      onClick={() => {
                        if (onChange) onChange(null, false)
                        setIsTooltipShow(false)
                      }}
                      className="btn-confirm"
                    >
                      <FormattedMessage id="action_disable" />
                    </Button>
                  </TooltipFooter>
                </PopoverContainer>
              </Overlay>
            )}
          </TogglerWrapper>

          {label && <span className="label-toggler">{label}</span>}
        </LabelContainer>

        <input
          type="checkbox"
          checked={checked}
          id={id}
          onChange={e => handleChange(e)}
          onBlur={onBlur}
          name={name}
          value={value}
          disabled={disabled}
          aria-roledescription={roledescription}
        />
      </div>
      {helpText && <span className="excerpt">{helpText}</span>}
    </ToggleContainer>
  )
}

export default Toggle
