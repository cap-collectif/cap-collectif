// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { AnswerBody } from './AnswerBody';
import { $refType, $fragmentRefs } from '../../mocks';

describe('<AnswerBody />', () => {
  it('renders correctly with an author', () => {
    const answerWithAuthor = {
      body: '<div>My awesome content</div>',
      $refType,
      createdAt: '2015-01-01 00:00:00',
      author: {
        $fragmentRefs,
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

  it('renders correctly with authors', () => {
    const answerWithAuthors = {
      body: '<div>My awesome content</div>',
      $refType,
      authors: [$fragmentRefs],
    };
    const wrapper = shallow(<AnswerBody answer={answerWithAuthors} />);
    expect(wrapper).toMatchSnapshot();
  });
});
