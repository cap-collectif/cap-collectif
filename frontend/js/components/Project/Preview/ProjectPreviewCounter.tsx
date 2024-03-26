import * as React from 'react'
import { FormattedMessage } from 'react-intl'

import styled from 'styled-components'
import colors from '~/styles/modules/colors'
import Tag from '../../Ui/Labels/Tag'
import { formatBigNumber } from '~/utils/bigNumberFormatter'
type Props = {
  readonly value: number
  readonly label: string
  readonly showZero?: boolean
  readonly icon?: string
  readonly archived: boolean
}
const StyledTag = styled(Tag)<{ archived?: boolean }>`
  color: ${props => (props.archived ? colors['neutral-gray']['500'] : 'inherit')};
`
export class ProjectPreviewCounter extends React.Component<Props> {
  static defaultProps = {
    showZero: false,
  }

  render() {
    const { value, label, showZero, icon, archived } = this.props

    if (value > 0 || showZero) {
      const formattedValue = formatBigNumber(value)
      return (
        <StyledTag icon={icon ? `cap ${icon}` : undefined} archived={archived}>
          {formattedValue}{' '}
          <FormattedMessage
            id={label}
            values={{
              num: `${value}`,
            }}
          />
        </StyledTag>
      )
    }

    return null
  }
}
export default ProjectPreviewCounter
