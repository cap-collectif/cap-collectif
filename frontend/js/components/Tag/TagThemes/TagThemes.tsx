import * as React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import { FormattedMessage } from 'react-intl'
import Tag from '~/components/Ui/Labels/Tag'
import IconRounded from '@shared/ui/LegacyIcons/IconRounded'
import colors from '~/utils/colors'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import type { TagThemes_themes } from '~relay/TagThemes_themes.graphql'

const renderThemes = themes => {
  if (themes.length === 2) {
    return (
      <>
        <span>{themes[0].title} </span>
        <FormattedMessage id="et" />
        <span> {themes[1].title}</span>
      </>
    )
  }

  if (themes.length > 2) {
    return (
      <>
        <span>{themes[0].title} </span>
        <FormattedMessage id="et" />
        <span> {themes.length - 1} </span>
        <FormattedMessage id="global.themes" />
      </>
    )
  }

  return <span>{themes[0].title}</span>
}

type TagThemesProps = {
  readonly themes: TagThemes_themes
  readonly size: string
}
export const TagThemes = ({ themes, size }: TagThemesProps) => (
  <Tag size={size}>
    <IconRounded size={18} color={colors.darkGray}>
      <Icon name={ICON_NAME.folder} color="#fff" size={10} />
    </IconRounded>

    {renderThemes(themes)}
  </Tag>
)
export default createFragmentContainer(TagThemes, {
  themes: graphql`
    fragment TagThemes_themes on Theme @relay(plural: true) {
      title
    }
  `,
})
