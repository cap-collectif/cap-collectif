// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import Tag from '~/components/Ui/Labels/Tag';
import IconRounded from '~ui/Icons/IconRounded';
import colors from '~/utils/colors';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';

const renderThemes = themes => {
  if (themes.length === 2) {
    return (
      <>
        <span>{themes[0].title} </span>
        <FormattedMessage id="et" />
        <span> {themes[1].title}</span>
      </>
    );
  }

  if (themes.length > 2) {
    return (
      <>
        <span>{themes[0].title} </span>
        <FormattedMessage id="et" />
        <span> {themes.length - 1} </span>
        <FormattedMessage id="global.themes" />
      </>
    );
  }

  return <span>{themes[0].title}</span>;
};

type TagThemesProps = {
  themes: $ReadOnlyArray<{| +title: string |}>,
  size: string,
};

const TagThemes = ({ themes, size }: TagThemesProps) => (
  <Tag size={size}>
    <IconRounded size={18} color={colors.darkGray}>
      <Icon name={ICON_NAME.folder} color="#fff" size={10} />
    </IconRounded>

    {renderThemes(themes)}
  </Tag>
);

export default TagThemes;
