/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import IdeaCreate from './IdeaCreate';
import IdeaCreateButton from './IdeaCreateButton';
import IdeaCreateForm from './IdeaCreateForm';
import IntlData from '../../../translations/FR';

describe('<IdeaCreate />', () => {
  it('should render a div with correct classes, an idea create button and a modal with an idea form', () => {
    const wrapper = shallow(<IdeaCreate className="css-class" themes={[]} {...IntlData} />);
    expect(wrapper.find('div.css-class')).toHaveLength(1);
    expect(wrapper.find(IdeaCreateButton)).toHaveLength(1);
    const modal = wrapper.find('Modal');
    expect(modal).toHaveLength(1);
    expect(modal.find(IdeaCreateForm)).toHaveLength(1);
  });
});
