// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { FontStyle } from './FontStyle';
import InlineList from "../components/Ui/List/InlineList";
import TagsList from "../components/Ui/List/TagsList";

storiesOf('Style', module)
  .add('Fonts', () => {
    return (
      <div className="container storybook-container">
        <FontStyle />
      </div>
    );
  })
  .add('List', () => {
    return (
      <div className="container storybook-container">
        <h3>Dot list</h3>
        <InlineList>
          <li>5 projets</li>
          <li>10 articles</li>
          <li>2 évènements</li>
          <li>4 idées</li>
        </InlineList>
        <hr/>
        <h3>Tags list</h3>
        <TagsList>
          <div className="tags-list__tag">
            <i className="cap cap-marker-1-1 icon--blue" />
            5 projets
          </div>
          <div className="tags-list__tag">
            <i className="cap cap-tag-1-1 icon--blue" />
            10 articles
          </div>
          <div className="tags-list__tag">
            <i className="cap cap-tag-1-1 icon--blue" />
            2 évènements
          </div>
          <div className="tags-list__tag">
            <i className="cap cap-marker-1-1 icon--blue" />
            4 idées
          </div>
        </TagsList>
        <hr/>
      </div>
    );
  });

