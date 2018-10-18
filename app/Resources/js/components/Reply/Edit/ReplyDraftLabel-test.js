// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import ReplyDraftLabel from './ReplyDraftLabel';

describe('<ReplyDraftLabel />', () => {
  it('should render correctly with draft', () => {
    const wrapper = shallow(<ReplyDraftLabel draft />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with not draft', () => {
    const wrapper = shallow(<ReplyDraftLabel draft={false} />);
    expect(wrapper).toMatchSnapshot();
  });
});
