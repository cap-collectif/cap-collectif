/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { IdeaCreateButton } from './IdeaCreateButton';
import LoginOverlay from '../../Utils/LoginOverlay';
import IntlData from '../../../translations/FR';

describe('<IdeaCreateButton />', () => {
  it('should render a login overlay with a button', () => {
    const wrapper = shallow(<IdeaCreateButton handleClick={() => {}} {...IntlData} />);
    const overlay = wrapper.find(LoginOverlay);
    expect(overlay).to.have.length(1);
    const button = overlay.find('Button');
    expect(button).to.have.length(1);
    expect(button.prop('id')).to.equal('idea-create-button');
  });
});
