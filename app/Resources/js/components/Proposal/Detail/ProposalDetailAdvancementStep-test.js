/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
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
      />
    );
    const label = wrapper.find('Label');
    expect(label.length).to.equal(0);
  });

  it('can render a step with status', () => {
    const wrapper = shallow(
      <ProposalDetailAdvancementStep
        step={step}
        roundColor={roundColor}
        status={status}
      />
    );
    const label = wrapper.find('Label');
    expect(label.prop('bsStyle')).to.equal('success');
  });
});
