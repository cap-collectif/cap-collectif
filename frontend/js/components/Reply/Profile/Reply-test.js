// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { $refType, $fragmentRefs } from '~/mocks';
import { Reply } from './Reply';

const baseReply = {
  $refType,
  author: {
    $fragmentRefs,
  },
  createdAt: '2019-03-08 00:00:00',
  questionnaire: {
    title: 'Titre du questionnaire',
    step: {
      url: '/project/projet-avec-questionnaire/questionnaire/questionnaire-des-jo-2024',
    },
  },
  id: 'reply1',
};

const dataReply = {
  basic: {
    ...baseReply,
  },
  withoutStep: {
    ...baseReply,
    questionnaire: {
      ...baseReply.questionnaire,
      step: null,
    },
  },
};

describe('<Reply />', () => {
  it('should render correctly with step', () => {
    const wrapper = shallow(<Reply reply={dataReply.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly without step', () => {
    const wrapper = shallow(<Reply reply={dataReply.withoutStep} />);
    expect(wrapper).toMatchSnapshot();
  });
});
