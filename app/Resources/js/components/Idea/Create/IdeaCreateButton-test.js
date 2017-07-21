/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { IdeaCreateButton } from './IdeaCreateButton';
import LoginOverlay from '../../Utils/LoginOverlay';
import IntlData from '../../../translations/FR';

describe('<IdeaCreateButton />', () => {
  it('should render a login overlay with a button', () => {
    const wrapper = shallow(<IdeaCreateButton handleClick={() => {}} {...IntlData} />);
    const overlay = wrapper.find(LoginOverlay);
    expect(overlay).toHaveLength(1);
    const button = overlay.find('Button');
    expect(button).toHaveLength(1);
    expect(button.prop('id')).toEqual('idea-create-button');
  });
});
