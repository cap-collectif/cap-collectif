/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import IdeaEditModal from './IdeaEditModal';
import IntlData from '../../../translations/FR';

const props = {
  idea: {},
  themes: [],
  show: true,
  onToggleModal: () => {},
};

describe('<IdeaEditModal />', () => {
  it('should render a modal with an idea form', () => {
    const wrapper = shallow(<IdeaEditModal {...props} {...IntlData} />);
    const modal = wrapper.find('Modal');
    expect(modal).toHaveLength(1);
    const form = modal.find('Connect(IdeaEditForm)');
    expect(form).toHaveLength(1);
    expect(form.prop('isSubmitting')).toEqual(wrapper.state('isSubmitting'));
    expect(form.prop('onSubmitSuccess')).toBeDefined();
    expect(form.prop('onValidationFailure')).toBeDefined();
    expect(form.prop('onSubmitFailure')).toBeDefined();
    expect(form.prop('idea')).toEqual(props.idea);
  });
});
