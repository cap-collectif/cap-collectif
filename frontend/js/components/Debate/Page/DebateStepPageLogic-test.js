// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DebateStepPageLogic } from './DebateStepPageLogic';
import { $refType, $fragmentRefs } from '~/mocks';

describe('<DebateStepPageLogic />', () => {
  const query = {
    $refType,
    step: { $fragmentRefs },
    viewer: { id: 'user1' },
  };

  it('renders correcty', () => {
    const wrapper = shallow(
      <DebateStepPageLogic
        isAuthenticated
        query={query}
        title="Pour ou contre le LSD dans nos cantines"
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
