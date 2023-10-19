// @ts-nocheck
import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { Label as BsLabel } from 'react-bootstrap'
import { text, select, boolean, color, number } from '@storybook/addon-knobs'
import { Label } from '~/components/Ui/Labels/Label'

const bsStyleOptions = {
  Warning: 'warning',
  Danger: 'danger',
  Success: 'success',
  Info: 'info',
  Primary: 'primary',
  Default: 'default',
}
storiesOf('Core/Label', module)
  .add('Bootstrap Label', () => {
    const bsStyle = select('BsStyle', bsStyleOptions, 'default')
    const content = text('Content', 'Content of label')
    const badgePill = boolean('Badge pill', false)
    return (
      <BsLabel className={badgePill ? 'badge-pill' : null} bsStyle={bsStyle}>
        {content}
      </BsLabel>
    )
  })
  .add('Our Label', () => {
    const labelColor = color('color', '#28a745')
    const fontSize = number('fontSize', 12)
    return (
      <Label color={labelColor} fontSize={fontSize} uppercase>
        <i className="cap cap-add-1" /> Favorable
      </Label>
    )
  })
