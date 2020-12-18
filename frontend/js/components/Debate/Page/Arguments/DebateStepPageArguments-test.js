// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DebateStepPageArguments } from './DebateStepPageArguments';
import { $refType, $fragmentRefs } from '~/mocks';

describe('<DebateStepPageArguments />', () => {
  const step = {
    $refType,
    debate: { id: 'debat-cannabis', arguments: { totalCount: 7 }, $fragmentRefs },
    yesDebate: { id: 'debat-cannabis', $fragmentRefs },
    noDebate: { id: 'debat-cannabis', $fragmentRefs },
  };

  it('renders correcty', () => {
    const wrapper = shallow(<DebateStepPageArguments step={step} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correcty on mobile', () => {
    const wrapper = shallow(<DebateStepPageArguments isMobile step={step} />);
    expect(wrapper).toMatchSnapshot();
  });
});
