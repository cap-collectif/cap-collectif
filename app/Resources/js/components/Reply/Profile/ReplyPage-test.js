import React from 'react';
import { shallow } from 'enzyme/build';
import { $refType } from '../../../mocks';
import { Reply } from './Reply';

describe('<Reply />', () => {
  const reply = {
    $refType,
    author: {
      id: 'author1',
      displayName: 'author1',
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

  it('should render correctly', () => {
    const wrapper = shallow(<Reply reply={reply} />);
    expect(wrapper).toMatchSnapshot();
  });
});
