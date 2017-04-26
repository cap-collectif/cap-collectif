/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalAdminStepSelector } from './ProposalAdminStepSelector';

describe('<ProposalAdminStepSelector />', () => {
  const props = {
    dispatch: jest.fn(),
    step: { id: 'stepId', title: 'stepTitle', selected: true, statuses: [] },
    proposalId: 1,
    lastEditedStepId: null,
    lastNotifiedStepId: null,
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalAdminStepSelector {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly when edited', () => {
    const wrapper = shallow(
      <ProposalAdminStepSelector {...props} lastEditedStepId="stepId" />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly when edited and notified', () => {
    const wrapper = shallow(
      <ProposalAdminStepSelector
        {...props}
        lastEditedStepId="stepId"
        lastNotifiedStepId="stepId"
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
