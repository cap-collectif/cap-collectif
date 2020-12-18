// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DebateStepPageMainActions } from './DebateStepPageMainActions';
import { $refType, $fragmentRefs } from '~/mocks';

describe('<DebateStepPageMainActions/>', () => {
  const step = {
    $refType,
    id: 'step1',
    timeRange: { endAt: '2021-18-02:00:00' },
    debate: { $fragmentRefs },
  };

  it('renders correcty', () => {
    const wrapper = shallow(
      <DebateStepPageMainActions
        isAuthenticated
        step={step}
        title="Pour ou contre le LSD dans nos cantines"
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
