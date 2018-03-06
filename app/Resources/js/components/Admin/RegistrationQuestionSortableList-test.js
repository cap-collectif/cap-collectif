// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { RegistrationQuestionSortableList } from './RegistrationQuestionSortableList';

describe('<RegistrationSortableQuestionList />', () => {
  const props = {
    showChoices: false,
    items: [{}, {}]
  };

  it('renders correctly', () => {
    const wrapper = shallow(<RegistrationQuestionSortableList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
