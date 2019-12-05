// @flow
import * as React from 'react';
import Tag from '~/components/Ui/Labels/Tag';

type TagThemesProps = {
  themes: $ReadOnlyArray<{| +title: string |}>,
  size: string,
};

const contructLabelTagThemes = themes => {
  const lengthThemes = themes.length;

  const baseLabel = themes[0].title;

  if (lengthThemes === 2) return `${baseLabel} et ${themes[1].title}`;
  if (lengthThemes > 2) return `${baseLabel} et ${lengthThemes - 1} thèmes`;

  return baseLabel;
};

const TagThemes = ({ themes, size }: TagThemesProps) => (
  <Tag icon="cap cap-folder-2" size={size}>
    {contructLabelTagThemes(themes)}
  </Tag>
);

export default TagThemes;
