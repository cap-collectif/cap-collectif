// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalFusionForm } from './ProposalFusionForm';
import { $refType, intlMock } from '../../../mocks';

describe('<ProposalForm />', () => {
  const props = {
    intl: intlMock,
    onProjectChange: jest.fn(),
    query: {
      $refType,
      projects: {
        edges: [
          {
            node: {
              id: '1',
              title: 'Project 1',
              steps: [{ id: 's1', type: 'collect' }, { id: 's2', type: 'depot' }],
            },
          },
          {
            node: {
              id: '2',
              title: 'Project 2',
              steps: [],
            },
          },
        ],
      },
    },
    currentCollectStep: null,
  };
  const currentCollectStepProps = {
    ...props,
    currentCollectStep: {
      type: 'collect',
      id: 'cs1',
    },
  };

  it('should render correctly', () => {
    const wrapper = shallow(<ProposalFusionForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a form with only the project selection field ', () => {
    const wrapper = shallow(<ProposalFusionForm {...props} />);
    const field = wrapper.find('Field');
    expect(field).toHaveLength(1);
  });

  it('should render a form with the proposal selection field', () => {
    const wrapper = shallow(<ProposalFusionForm {...currentCollectStepProps} />);
    const field = wrapper.find('Field');
    expect(field).toHaveLength(2);
  });
});
