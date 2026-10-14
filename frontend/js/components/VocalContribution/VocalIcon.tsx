import * as React from 'react'
import { VOCAL_ICONS, VocalIconName } from './VocalContribution.icons'

type Props = { name: VocalIconName; size?: number }

const VocalIcon = ({ name, size }: Props) => (
  <svg
    className="gcv-ic"
    viewBox="0 0 256 256"
    aria-hidden="true"
    focusable="false"
    style={size ? ({ '--s': `${size}px` } as React.CSSProperties) : undefined}
  >
    <path d={VOCAL_ICONS[name]} />
  </svg>
)

export default VocalIcon
