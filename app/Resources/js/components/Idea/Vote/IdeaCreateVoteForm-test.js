/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import IdeaCreateVoteForm from './IdeaCreateVoteForm';

const props = {
  idea: {},
  isSubmitting: false,
  onSubmitSuccess: () => {},
  onFailure: () => {},
  anonymous: false,
};

describe('<IdeaCreateVoteForm />', () => {
  it('should render the idea vote form', () => {
    const wrapper = shallow(<IdeaCreateVoteForm {...props} {...IntlData} />);
    const form = wrapper.find('IdeaVoteForm');
    expect(form).to.have.length(1);
    expect(form.prop('idea')).to.equal(props.idea);
    expect(form.prop('serverErrors')).to.equal(wrapper.state('serverErrors'));
  });
});
