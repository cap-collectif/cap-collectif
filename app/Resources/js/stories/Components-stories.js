// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { ProgressBar } from 'react-bootstrap';
import Pagination from '../components/Utils/Pagination';
import { Progress } from '../components/Ui/Progress';
import InlineList from '../components/Ui/List/InlineList';
import TagsList from '../components/Ui/List/TagsList';

const openProject = {
  step: {
    bsStyle: 'success',
    now: 50,
    label: 'en cours',
    className: null,
  },
};

const continuousProject = {
  step: {
    bsStyle: 'success',
    now: 100,
    label: 'Participation en continue',
    className: null,
  },
};

const endedProject = {
  step: {
    now: 100,
    label: 'Terminé',
    className: 'progress-bar_grey',
  },
};

const toComeProject = {
  step: {
    now: 100,
    label: 'à venir',
    className: 'progress-bar_empty'
  },
};

storiesOf('Components', module)
  .add('Progress', withInfo({
    source: false,
    propTablesExclude: [Progress],
    text :`
      <h2>How to use</h2>
    
      ~~~jsx
      // Inline list
      <Pagination
        nbPages={6}
        current={3}
        onChange={() => {}}
      />
      ~~~
    
    `})(() => {
    return (
      <div className="ml-30 mr-30 storybook-container">
        <h1>
          Progress bar {' '}
          <a href="https://github.com/cap-collectif/platform/blob/master/app/Resources/js/stories/Components-stories.js">
            <i className="small cap cap-setting-gear-1"/>
          </a>
        </h1>
        <hr/>
        <h3>À venir</h3>
        <Progress className="mb-30">
          <ProgressBar
            now={toComeProject.step.now}
            className={toComeProject.step.className}
            label={toComeProject.step.label}
          />
        </Progress>
        <h3>En cours</h3>
        <Progress className="mb-30">
          <ProgressBar
            now={openProject.step.now}
            bsStyle={openProject.step.bsStyle}
            className={openProject.step.className}
            label={openProject.step.label}
          />
        </Progress>
        <h3>Participation en continue</h3>
        <Progress className="mb-30">
          <ProgressBar
            now={continuousProject.step.now}
            bsStyle={continuousProject.step.bsStyle}
            className={continuousProject.step.className}
            label={continuousProject.step.label}
          />
        </Progress>
        <h3>Terminé</h3>
        <Progress className="mb-30">
          <ProgressBar
            now={endedProject.step.now}
            className={endedProject.step.className}
            label={endedProject.step.label}
          />
        </Progress>
      </div>
    );
  }))
  .add('List',  withInfo({
    propTablesExclude: [InlineList, TagsList],
    text :`
      <h2>How to use</h2>
    
      ~~~jsx
      // Inline list
      <InlineList>
        <li>Element 1</li>
        <li>Element 2</li>
      </InlineList>
      
      // Tags list
      <TagsList>
        <div className="tags-list__tag">
          <i />
          List content
        </div>
        <div className="tags-list__tag">
          <i />
          List content
        </div>
      </TagsList>
      ~~~
    
    `})(() => {
    return (
      <div className="ml-30 mr-30 storybook-container">
        <h1>
          List {' '}
          <a href="https://github.com/cap-collectif/platform/blob/master/app/Resources/js/stories/Style-stories.js">
            <i className="small cap cap-setting-gear-1"/>
          </a>
        </h1>
        <hr/>
        <h3>Inline list</h3>
        <InlineList className="mb-30">
          <li>5 projets</li>
          <li>10 articles</li>
          <li>2 évènements</li>
          <li>4 idées</li>
        </InlineList>
        <h3>Tags list</h3>
        <TagsList className="mb-30">
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
      </div>
    );
  }))
  .add('Pagination', withInfo({
    source: false,
    text :`
      <h2>How to use</h2>
    
      ~~~jsx
      // Inline list
      <Pagination
        nbPages={6}
        current={3}
        onChange={() => {}}
      />
      ~~~
    
    `})(() => {
    return (
      <div className="ml-30 mr-30 storybook-container">
        <h1>
          Pagination {' '}
          <a href="https://github.com/cap-collectif/platform/blob/master/app/Resources/js/stories/Components-stories.js">
            <i className="small cap cap-setting-gear-1"/>
          </a>
        </h1>
        <hr/>
        <div className="row">
          <Pagination
            nbPages={6}
            current={3}
            onChange={() => {}}
          />
        </div>
      </div>
    );
  }));
