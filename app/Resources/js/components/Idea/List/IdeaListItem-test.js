/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import IdeaListItem from './IdeaListItem';
import IdeaPreview from '../Preview/IdeaPreview';

const idea = {};

describe('<IdeaListItem />', () => {
  it('it should render a col containing an idea preview', () => {
    const wrapper = shallow(<IdeaListItem idea={idea} {...IntlData} />);
    expect(wrapper.find('Col')).toHaveLength(1);
    const preview = wrapper.find(IdeaPreview);
    expect(preview).toHaveLength(1);
    expect(preview.prop('idea')).toEqual(idea);
  });
});
