/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import ProposalDetailAdvancementStep from './ProposalDetailAdvancementStep';

describe('<ProposalDetailAdvancementStep />', () => {
  const step = {
    title: 'sdqsdsqd',
    startAt: 'startAt',
    endAt: 'endAt',
  };
  const status = {
    color: 'success',
    name: 'Salut',
  };
  const roundColor = '#hexCode';

  it('can render a step without status', () => {
    const wrapper = shallow(
      <ProposalDetailAdvancementStep
        step={step}
        roundColor={roundColor}
      />,
    );
    const label = wrapper.find('Label');
    expect(label.length).toEqual(0);
  });

  it('can render a step with status', () => {
    const wrapper = shallow(
      <ProposalDetailAdvancementStep
        step={step}
        roundColor={roundColor}
        status={status}
      />,
    );
    const label = wrapper.find('Label');
    expect(label.prop('bsStyle')).toEqual('success');
  });
});
