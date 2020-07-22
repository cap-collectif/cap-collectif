// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalListToggleViewBtn } from './ProposalListToggleViewBtn';
import { $refType } from '~/mocks';

const baseProps = {
  showMapButton: true,
  displayMode: 'grid',
  setDisplayMode: jest.fn(),
  step: {
    $refType,
    __typename: 'CollectStep',
    form: {
      isGridViewEnabled: true,
      isListViewEnabled: true,
      isMapViewEnabled: true,
    },
  },
};

const props = {
  basic: baseProps,
  withSelectionStep: {
    ...baseProps,
    step: {
      $refType,
      __typename: 'SelectionStep',
      project: {
        firstCollectStep: {
          form: {
            isGridViewEnabled: true,
            isListViewEnabled: true,
            isMapViewEnabled: true,
          },
        },
      },
    },
  },
};

describe('<ProposalListToggleViewBtn />', () => {
  it('should render a toggle button with grid selected', () => {
    const wrapper = shallow(<ProposalListToggleViewBtn {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when SelectionStep', () => {
    const wrapper = shallow(<ProposalListToggleViewBtn {...props.withSelectionStep} />);
    expect(wrapper).toMatchSnapshot();
  });
});
