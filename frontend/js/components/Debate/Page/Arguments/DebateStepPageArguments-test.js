// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DebateStepPageArguments } from './DebateStepPageArguments';
import { $refType, $fragmentRefs } from '~/mocks';

const defaultProps = {
  step: {
    $refType,
    debate: { id: 'debat-cannabis', arguments: { totalCount: 7 }, $fragmentRefs },
    yesDebate: { id: 'debat-cannabis', $fragmentRefs },
    noDebate: { id: 'debat-cannabis', $fragmentRefs },
  },
  viewer: {
    $refType,
    $fragmentRefs,
  },
  isMobile: false,
};

const props = {
  basic: defaultProps,
  isMobile: {
    ...defaultProps,
    isMobile: true,
  },
  noViewer: {
    ...defaultProps,
    viewer: null,
  },
};

describe('<DebateStepPageArguments />', () => {
  it('renders correcty', () => {
    const wrapper = shallow(<DebateStepPageArguments {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correcty on mobile', () => {
    const wrapper = shallow(<DebateStepPageArguments {...props.isMobile} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correcty when no viewer', () => {
    const wrapper = shallow(<DebateStepPageArguments {...props.noViewer} />);
    expect(wrapper).toMatchSnapshot();
  });
});
