// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import TagsList from '../../../components/Ui/List/TagsList';
import Tag from '../../../components/Ui/Labels/Tag';

storiesOf('Core|List/TagsList', module).add('default', () => (
  <TagsList>
    <Tag size="22px" className="ellipsis" icon="cap cap-tag-1-1 icon--blue">
      Justice
    </Tag>
    <Tag size="22px" className="ellipsis" icon="cap cap-heart-1 icon--red">
      2 coups de coeur
    </Tag>
    <Tag size="22px" className="ellipsis" icon="cap cap-marker-1-1 icon--blue">
      Maurepas Patton
    </Tag>
    <Tag size="22px" className="ellipsis" icon="cap cap-coins-2-1 icon--blue">
      100 €
    </Tag>
  </TagsList>
));
