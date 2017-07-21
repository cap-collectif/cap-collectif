/* eslint-env jest */
import React from 'react';
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
    const wrapper = shallow(
      <ReplyCreateFormWrapper
        form={formContribuable}
        userReplies={userReplies}
        user={null}
        {...IntlData}
      />,
    );
    const alert = wrapper.find('Alert');
    expect(alert).toHaveLength(1);
    expect(alert.prop('bsStyle')).toEqual('warning');
    expect(alert.childAt(0).html()).toEqual(
      '<strong>Vous devez être connecté pour participer</strong>',
    );
    const form = wrapper.find('ReplyCreateForm');
    expect(form).toHaveLength(1);
    expect(form.prop('form')).toEqual(formContribuable);
    expect(form.prop('disabled')).toEqual(true);
  });

  it("should render an alert an a disabled form when form is contribuable and doesn't allow multiple votes and user has already votes", () => {
    const wrapper = shallow(
      <ReplyCreateFormWrapper
        form={formContribuableWithoutMultipleVotes}
        userReplies={userReplies}
        user={{}}
        {...IntlData}
      />,
    );
    const alert = wrapper.find('Alert');
    expect(alert).toHaveLength(1);
    expect(alert.prop('bsStyle')).toEqual('warning');
    expect(alert.childAt(0).html()).toEqual(
      '<strong>Vous avez déjà participé.</strong>',
    );
    const form = wrapper.find('ReplyCreateForm');
    expect(form).toHaveLength(1);
    expect(form.prop('form')).toEqual(formContribuableWithoutMultipleVotes);
    expect(form.prop('disabled')).toEqual(true);
  });

  it('should no alert an a disabled form when form is not contribuable', () => {
    const wrapper = shallow(
      <ReplyCreateFormWrapper
        form={formNotContribuable}
        userReplies={userReplies}
        user={{}}
        {...IntlData}
      />,
    );
    const alert = wrapper.find('Alert');
    expect(alert).toHaveLength(0);
    const form = wrapper.find('ReplyCreateForm');
    expect(form.prop('form')).toEqual(formNotContribuable);
    expect(form.prop('disabled')).toEqual(true);
  });

  it('should render no alert an an enabled form', () => {
    const wrapper = shallow(
      <ReplyCreateFormWrapper
        form={formContribuable}
        userReplies={userReplies}
        user={{}}
        {...IntlData}
      />,
    );
    const alert = wrapper.find('Alert');
    expect(alert).toHaveLength(0);
    const form = wrapper.find('ReplyCreateForm');
    expect(form.prop('form')).toEqual(formContribuable);
    expect(form.prop('disabled')).toEqual(false);
  });
});
