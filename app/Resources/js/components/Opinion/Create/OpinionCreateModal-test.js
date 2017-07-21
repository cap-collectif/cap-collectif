// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { OpinionCreateModal } from './OpinionCreateModal';
import IntlData from '../../../translations/FR';

describe('<OpinionCreateModal />', () => {
  const props = {
    ...IntlData,
    show: true,
    projectId: 'projectId',
    stepId: '1',
    step: {},
    opinionType: {
      id: 'opinionTypeId',
      title: 'opinionTypeTitle',
      appendixTypes: [],
    },
    submitting: true,
    dispatch: jest.fn(),
  };

  it('renders correctly', () => {
    const wrapper = shallow(<OpinionCreateModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
