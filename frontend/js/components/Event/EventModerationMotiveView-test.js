// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { EventModerationMotiveView } from './EventModerationMotiveView';
import { $refType } from '~/mocks';

describe('<EventModerationMotiveView />', () => {
  const propsWithoutComment = {
    event: {
      review: { id: 'review11', status: 'REFUSED', refusedReason: 'SPAM', comment: '' },
      $refType,
    },
  };
  const propsWithComment = {
    event: {
      review: {
        id: 'review11',
        status: 'REFUSED',
        refusedReason: 'SPAM',
        comment: 'spamming is bad',
      },
      $refType,
    },
  };

  it('renders correctly, without comment', () => {
    const wrapper = shallow(<EventModerationMotiveView {...propsWithoutComment} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly, with comment', () => {
    const wrapper = shallow(<EventModerationMotiveView {...propsWithComment} />);
    expect(wrapper).toMatchSnapshot();
  });
});
