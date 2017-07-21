/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import IdeaPageBody from './IdeaPageBody';

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
    const wrapper = shallow(
      <IdeaPageBody {...props} idea={idea} className={classes} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('it should show idea body, trash block and buttons', () => {
    const wrapper = shallow(<IdeaPageBody {...props} idea={idea} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('it should render idea media, object and url when provided', () => {
    const wrapper = shallow(
      <IdeaPageBody {...props} idea={ideaWithMediaObjectAndUrl} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
