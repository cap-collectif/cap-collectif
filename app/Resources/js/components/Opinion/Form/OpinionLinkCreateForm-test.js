// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { OpinionLinkCreateForm } from './OpinionLinkCreateForm';
import IntlData from '../../../translations/FR';

describe('<OpinionLinkCreateForm />', () => {
  const availableTypes = [
    { id: '1337', appendixTypes: [{ id: '1', title: 'appendix-1' }] },
  ];
  const props = {
    availableTypes,
    currentType: availableTypes[0],
    handleSubmit: jest.fn(),
    opinion: {},
    ...IntlData,
  };

  it('renders correctly', () => {
    const wrapper = shallow(<OpinionLinkCreateForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
