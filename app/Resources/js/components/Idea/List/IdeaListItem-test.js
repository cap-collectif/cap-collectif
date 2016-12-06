/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import IdeaListItem from './IdeaListItem';
import IdeaPreview from '../Preview/IdeaPreview';

const idea = {};

describe('<IdeaListItem />', () => {
  it('it should render a col containing an idea preview', () => {
    const wrapper = shallow(<IdeaListItem idea={idea} {...IntlData} />);
    expect(wrapper.find('Col')).to.have.length(1);
    const preview = wrapper.find(IdeaPreview);
    expect(preview).to.have.length(1);
    expect(preview.prop('idea')).to.equal(idea);
  });
});
