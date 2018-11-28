// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { AnswerBody } from './AnswerBody';
import { $refType } from '../../mocks';

describe('<AnswerBody />', () => {
  it('renders correctly with an author', () => {
    const answerWithAuthor = {
      body: '<div>My awesome content</div>',
      $refType,
      createdAt: '2015-01-01 00:00:00',
      author: {
        displayName: 'bg',
        media: {
          url: 'https://capco.dev/media',
        },
        url: 'https://capco.dev/url',
      },
    };
    const wrapper = shallow(<AnswerBody answer={answerWithAuthor} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly without author', () => {
    const answerWithoutAuthor = {
      body: '<div>My awesome content</div>',
      $refType,
      author: null,
    };
    const wrapper = shallow(<AnswerBody answer={answerWithoutAuthor} />);
    expect(wrapper).toMatchSnapshot();
  });
});
