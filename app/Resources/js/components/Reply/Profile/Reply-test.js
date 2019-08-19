// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { $refType, $fragmentRefs } from '../../../mocks';
import { Reply } from './Reply';

describe('<Reply />', () => {
  const replyWithStep = {
    $refType,
    author: {
      $fragmentRefs,
      username: 'author1',
      url: 'https://capco/dev/profile/author1',
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

  const replyWithoutStep = {
    $refType,
    author: {
      $fragmentRefs,
      username: 'author1',
      url: 'https://capco/dev/profile/author1',
    },
    createdAt: '2019-03-08 00:00:00',
    questionnaire: {
      title: 'Titre du questionnaire',
      step: null,
    },
    id: 'reply1',
  };

  it('should render correctly with profile not enabled but step', () => {
    const wrapper = shallow(<Reply reply={replyWithStep} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with profile enabled but without step', () => {
    const wrapper = shallow(<Reply reply={replyWithoutStep} isProfileEnabled />);
    expect(wrapper).toMatchSnapshot();
  });
});
