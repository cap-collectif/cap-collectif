// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import Tag from '~/components/Ui/Labels/Tag';

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
  <Tag icon="cap cap-folder-2" size={size}>
    {renderThemes(themes)}
  </Tag>
);

export default TagThemes;
