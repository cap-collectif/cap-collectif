/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
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
    const wrapper = shallow(<IdeaVoteBox {...props} user={null} {...IntlData} />);
    expect(wrapper.find('UserPreview')).to.have.length(0);
    const form = wrapper.find('Connect(IdeaCreateVoteForm)');
    expect(form).to.have.length(1);
    expect(form.prop('idea')).to.equal(props.idea);
    expect(form.prop('isSubmitting')).to.equal(wrapper.state('isSubmitting'));
    expect(form.prop('onSubmitSuccess')).to.be.a('function');
    expect(form.prop('onFailure')).to.be.a('function');
    expect(form.prop('anonymous')).to.equal(true);
    const submit = wrapper.find(SubmitButton);
    expect(submit).to.have.length(1);
    expect(submit.prop('id')).to.equal('idea-vote-button');
    expect(submit.prop('isSubmitting')).to.equal(wrapper.state('isSubmitting'));
    expect(submit.prop('onSubmit')).to.be.a('function');
    expect(submit.prop('label')).to.equal('idea.vote.add');
    expect(submit.prop('bsStyle')).to.equal('success');
    expect(submit.prop('className')).to.equal('btn-block');
  });

  it('should render the create idea vote form with user avatar when user is logged in', () => {
    const wrapper = shallow(<IdeaVoteBox {...props} user={user} {...IntlData} />);
    expect(wrapper.find('UserPreview')).to.have.length(1);
    expect(wrapper.find('Connect(IdeaCreateVoteForm)')).to.have.length(1);
    expect(wrapper.find(SubmitButton)).to.have.length(1);
  });

  it('should render the delete idea vote form with user avatar when user is logged in and has voted', () => {
    const wrapper = shallow(<IdeaVoteBox {...propsWithVote} user={user} {...IntlData} />);
    expect(wrapper.find('UserPreview')).to.have.length(1);
    expect(wrapper.find('Connect(IdeaDeleteVoteForm)')).to.have.length(1);
    expect(wrapper.find(SubmitButton)).to.have.length(1);
  });
});
