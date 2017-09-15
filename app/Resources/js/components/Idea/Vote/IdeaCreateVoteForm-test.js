/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { IdeaCreateVoteForm } from './IdeaCreateVoteForm';

const props = {
  dispatch: () => {},
  idea: {},
  isSubmitting: false,
  onSubmitSuccess: () => {},
  onFailure: () => {},
  anonymous: false,
};

describe('<IdeaCreateVoteForm />', () => {
  it('should render the idea vote form', () => {
    const wrapper = shallow(<IdeaCreateVoteForm {...props} />);
    const form = wrapper.find('IdeaVoteForm');
    expect(form).toHaveLength(1);
    expect(form.prop('idea')).toEqual(props.idea);
    expect(form.prop('serverErrors')).toEqual(wrapper.state('serverErrors'));
  });
});
