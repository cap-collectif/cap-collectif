/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import { ReplyCreateFormWrapper } from './ReplyCreateFormWrapper';

describe('<ReplyCreateFormWrapper />', () => {
  const formContribuable = {
    contribuable: true,
    multipleRepliesAllowed: true,
  };
  const formContribuableWithoutMultipleVotes = {
    contribuable: true,
    multipleRepliesAllowed: false,
  };
  const formNotContribuable = {
    contribuable: false,
  };
  const userReplies = [{}];

  it('should render an alert an a disabled form when form is contribuable and user is not logged in', () => {
    const wrapper = shallow(<ReplyCreateFormWrapper
      form={formContribuable}
      userReplies={userReplies}
      user={null}
      {...IntlData}
    />);
    const alert = wrapper.find('Alert');
    expect(alert).to.have.length(1);
    expect(alert.prop('bsStyle')).to.equal('warning');
    expect(alert.childAt(0).html()).to.equal('<strong>Vous devez être inscrit et connecté pour répondre à ce questionnaire.</strong>');
    const form = wrapper.find('ReplyCreateForm');
    expect(form).to.have.length(1);
    expect(form.prop('form')).to.equal(formContribuable);
    expect(form.prop('disabled')).to.equal(true);
  });

  it('should render an alert an a disabled form when form is contribuable and doesn\'t allow multiple votes and user has already votes', () => {
    const wrapper = shallow(<ReplyCreateFormWrapper
      form={formContribuableWithoutMultipleVotes}
      userReplies={userReplies}
      user={{}}
      {...IntlData}
    />);
    const alert = wrapper.find('Alert');
    expect(alert).to.have.length(1);
    expect(alert.prop('bsStyle')).to.equal('warning');
    expect(alert.childAt(0).html()).to.equal('<strong>Vous avez déjà répondu à ce questionnaire.</strong>');
    const form = wrapper.find('ReplyCreateForm');
    expect(form).to.have.length(1);
    expect(form.prop('form')).to.equal(formContribuableWithoutMultipleVotes);
    expect(form.prop('disabled')).to.equal(true);
  });

  it('should no alert an a disabled form when form is not contribuable', () => {
    const wrapper = shallow(<ReplyCreateFormWrapper
      form={formNotContribuable}
      userReplies={userReplies}
      user={{}}
      {...IntlData}
    />);
    const alert = wrapper.find('Alert');
    expect(alert).to.have.length(0);
    const form = wrapper.find('ReplyCreateForm');
    expect(form.prop('form')).to.equal(formNotContribuable);
    expect(form.prop('disabled')).to.equal(true);
  });

  it('should render no alert an an enabled form', () => {
    const wrapper = shallow(<ReplyCreateFormWrapper
      form={formContribuable}
      userReplies={userReplies}
      user={{}}
      {...IntlData}
    />);
    const alert = wrapper.find('Alert');
    expect(alert).to.have.length(0);
    const form = wrapper.find('ReplyCreateForm');
    expect(form.prop('form')).to.equal(formContribuable);
    expect(form.prop('disabled')).to.equal(false);
  });
});
