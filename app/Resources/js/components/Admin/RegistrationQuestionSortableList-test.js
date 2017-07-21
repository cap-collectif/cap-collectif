// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { RegistrationQuestionSortableList } from './RegistrationQuestionSortableList';
import IntlData from '../../translations/FR';

describe('<RegistrationSortableQuestionList />', () => {
  const props = {
    ...IntlData,
    showChoices: false,
    items: [{}, {}],
  };

  it('renders correctly', () => {
    const wrapper = shallow(<RegistrationQuestionSortableList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
