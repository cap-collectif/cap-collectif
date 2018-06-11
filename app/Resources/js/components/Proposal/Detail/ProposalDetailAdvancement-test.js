// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalDetailAdvancement } from './ProposalDetailAdvancement';
import { $refType } from '../../../mocks';

describe('<ProposalDetailAdvancement />', () => {
  const proposal = {
    id: '3',
    status: null,
    $refType,
    selections: [
      {
        step: {
          id: '2',
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
        id: '1',
        type: 'collect',
        position: 1,
        endAt: 'endAt',
        startAt: 'startAt',
        title: 'Collecte 1',
      },
      {
        id: '3',
        type: 'selection',
        position: 3,
        endAt: 'endAt',
        startAt: 'startAt',
        title: 'Selection 2',
      },
      {
        id: '2',
        type: 'selection',
        position: 2,
        endAt: 'endAt',
        startAt: 'startAt',
        title: 'Selection 1',
      },
    ],
  };

  it('should render steps with according colors', () => {
    const wrapper = shallow(<ProposalDetailAdvancement proposal={proposal} project={project} />);
    expect(wrapper.find('ProposalDetailAdvancementStep')).toHaveLength(3);
    const step1 = wrapper.find('ProposalDetailAdvancementStep').at(0);
    expect(step1.prop('status')).toEqual(null);
    expect(step1.prop('roundColor')).toEqual('#5cb85c');
    expect(step1.prop('borderColor')).toEqual('#5cb85c');
    expect(step1.prop('step').title).toEqual('Collecte 1');
    const step2 = wrapper.find('ProposalDetailAdvancementStep').at(1);
    expect(step2.prop('roundColor')).toEqual('#5bc0de');
    expect(step2.prop('borderColor')).toEqual('#d9d9d9');
    expect(step2.prop('step').title).toEqual('Selection 1');
    const step3 = wrapper.find('ProposalDetailAdvancementStep').at(2);
    expect(step3.prop('borderColor')).toEqual(null);
    expect(step3.prop('roundColor')).toEqual('#d9d9d9');
    expect(step3.prop('step').title).toEqual('Selection 2');
  });
});
