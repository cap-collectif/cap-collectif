import * as React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import IconRounded from '@shared/ui/LegacyIcons/IconRounded'
import colors from '~/utils/colors'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import Tag from '~ui/Labels/Tag'
import type { TagStep_step } from '~relay/TagStep_step.graphql'
type Props = {
  readonly step: TagStep_step
  readonly size: string
}

const TagStep = ({ step, size }: Props) => (
  <Tag size={size}>
    <IconRounded size={18} color={colors.darkGray}>
      <Icon name={ICON_NAME.step} color="#fff" size={10} />
    </IconRounded>
    {step.title}
  </Tag>
)

export default createFragmentContainer(TagStep, {
  step: graphql`
    fragment TagStep_step on Step {
      title
    }
  `,
})
