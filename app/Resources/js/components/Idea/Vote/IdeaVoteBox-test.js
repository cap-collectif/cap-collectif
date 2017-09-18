/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { IdeaVoteBox } from './IdeaVoteBox';
import SubmitButton from '../../Form/SubmitButton';

const props = {
  idea: {},
};

const propsWithVote = {
  idea: {
    userHasVote: true,
  },
};

const user = {};

describe('<IdeaVoteBox />', () => {
  it('should render the create idea vote form with no user avatar when user is not logged in', () => {
    const wrapper = shallow(<IdeaVoteBox {...props} user={null} />);
    expect(wrapper.find('UserPreview')).toHaveLength(0);
    const form = wrapper.find('Connect(IdeaCreateVoteForm)');
    expect(form).toHaveLength(1);
    expect(form.prop('idea')).toEqual(props.idea);
    expect(form.prop('isSubmitting')).toEqual(wrapper.state('isSubmitting'));
    expect(form.prop('onSubmitSuccess')).toBeDefined();
    expect(form.prop('onFailure')).toBeDefined();
    expect(form.prop('anonymous')).toEqual(true);
    const submit = wrapper.find(SubmitButton);
    expect(submit).toHaveLength(1);
    expect(submit.prop('id')).toEqual('idea-vote-button');
    expect(submit.prop('isSubmitting')).toEqual(wrapper.state('isSubmitting'));
    expect(submit.prop('onSubmit')).toBeDefined();
    expect(submit.prop('label')).toEqual('idea.vote.add');
    expect(submit.prop('bsStyle')).toEqual('success');
    expect(submit.prop('className')).toEqual('btn-block');
  });

  it('should render the create idea vote form with user avatar when user is logged in', () => {
    const wrapper = shallow(<IdeaVoteBox {...props} user={user} />);
    expect(wrapper.find('UserPreview')).toHaveLength(1);
    expect(wrapper.find('Connect(IdeaCreateVoteForm)')).toHaveLength(1);
    expect(wrapper.find(SubmitButton)).toHaveLength(1);
  });

  it('should render the delete idea vote form with user avatar when user is logged in and has voted', () => {
    const wrapper = shallow(<IdeaVoteBox {...propsWithVote} user={user} />);
    expect(wrapper.find('UserPreview')).toHaveLength(1);
    expect(wrapper.find('Connect(IdeaDeleteVoteForm)')).toHaveLength(1);
    expect(wrapper.find(SubmitButton)).toHaveLength(1);
  });
});
