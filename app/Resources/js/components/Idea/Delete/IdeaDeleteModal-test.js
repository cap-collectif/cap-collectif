/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import IdeaDeleteModal from './IdeaDeleteModal';
import IntlData from '../../../translations/FR';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';

const props = {
  idea: {
    title: 'title',
  },
  show: true,
  onToggleModal: () => {},
};

describe('<IdeaDeleteModal />', () => {
  it('should render a modal', () => {
    const wrapper = shallow(<IdeaDeleteModal {...props} {...IntlData} />);
    expect(wrapper.find('Modal')).toHaveLength(1);
    const message = wrapper.find('FormattedMessage');
    expect(message.prop('title')).toEqual(props.idea.title);
    expect(wrapper.find(CloseButton));
    expect(wrapper.find(SubmitButton));
  });
});
