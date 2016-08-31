/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { ProposalDetailAdvancement } from './ProposalDetailAdvancement';
import IntlData from '../../../translations/FR';

describe('<ProposalDetailAdvancement />', () => {
  const proposal = {
    selections: [
      {
        step: {
          id: 2,
          position: 2,
        },
        status: {
          name: 'En cours',
          color: 'info',
        },
      },
    ],
    progressSteps: [],
  };
  const project = {
    steps: [
      {
        id: 1,
        type: 'collect',
        position: 1,
        endAt: 'endAt',
        startAt: 'startAt',
        title: 'Collecte 1',
      },
      {
        id: 3,
        type: 'selection',
        position: 3,
        endAt: 'endAt',
        startAt: 'startAt',
        title: 'Selection 2',
      },
      {
        id: 2,
        type: 'selection',
        position: 2,
        endAt: 'endAt',
        startAt: 'startAt',
        title: 'Selection 1',
      },
    ],
  };

  it('should render steps with according colors', () => {
    const wrapper = shallow(<ProposalDetailAdvancement proposal={proposal} project={project} {...IntlData} />);
    expect(wrapper.find('ProposalDetailAdvancementStep')).to.have.length(3);
    const step1 = wrapper.find('ProposalDetailAdvancementStep').at(0);
    expect(step1.prop('status')).to.be.null;
    expect(step1.prop('roundColor')).to.equal('#5cb85c');
    expect(step1.prop('borderColor')).to.equal('#5cb85c');
    expect(step1.prop('step').title).to.equal('Collecte 1');
    const step2 = wrapper.find('ProposalDetailAdvancementStep').at(1);
    expect(step2.prop('roundColor')).to.equal('#5bc0de');
    expect(step2.prop('borderColor')).to.equal('#d9d9d9');
    expect(step2.prop('step').title).to.equal('Selection 1');
    const step3 = wrapper.find('ProposalDetailAdvancementStep').at(2);
    expect(step3.prop('borderColor')).to.be.null;
    expect(step3.prop('roundColor')).to.equal('#d9d9d9');
    expect(step3.prop('step').title).to.equal('Selection 2');
  });
});
