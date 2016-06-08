/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import IdeaPageBody from './IdeaPageBody';
import IdeaPageTrashBlock from './IdeaPageTrashBlock';
import IdeaPageButtons from './IdeaPageButtons';

const props = {
  themes: [],
};

const classes = 'css-class';

const idea = {
  id: 1,
  body: '<p>blabla</p>',
};

const ideaWithMediaObjectAndUrl = {
  id: 1,
  body: '<p>blabla</p>',
  media: {
    url: 'image.png',
  },
  object: '<p>blabla</p>',
  url: 'http://www.google.fr',
};

describe('<IdeaPageBody />', () => {
  it('it should render a div with provided className', () => {
    const wrapper = shallow(<IdeaPageBody {...props} idea={idea} className={classes} {...IntlData} />);
    expect(wrapper.find('div.idea__body.css-class')).to.have.length(1);
  });

  it('it should show idea body, trash block and buttons', () => {
    const wrapper = shallow(<IdeaPageBody {...props} idea={idea} {...IntlData} />);
    expect(wrapper.find('#idea-body')).to.have.length(1);
    expect(wrapper.find('h2')).to.have.length(1);
    expect(wrapper.find('FormattedHTMLMessage')).to.have.length(1);
    expect(wrapper.find(IdeaPageTrashBlock)).to.have.length(1);
    expect(wrapper.find(IdeaPageButtons)).to.have.length(1);
    expect(wrapper.find('#idea-media')).to.have.length(0);
    expect(wrapper.find('#idea-object')).to.have.length(0);
    expect(wrapper.find('#idea-url')).to.have.length(0);
  });

  it('it should render idea media, object and url when provided', () => {
    const wrapper = shallow(<IdeaPageBody {...props} idea={ideaWithMediaObjectAndUrl} {...IntlData} />);
    expect(wrapper.find('#idea-media')).to.have.length(1);
    expect(wrapper.find('#idea-object')).to.have.length(1);
    expect(wrapper.find('#idea-url')).to.have.length(1);
  });
});
