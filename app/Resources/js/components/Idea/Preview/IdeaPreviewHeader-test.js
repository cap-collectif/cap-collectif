/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import IdeaPreviewHeader from './IdeaPreviewHeader';
import UserAvatar from '../../User/UserAvatar';
import UserLink from '../../User/UserLink';

const idea = {
  id: 1,
  author: {},
};

describe('<IdeaPreviewHeader />', () => {
  it('should render idea preview header', () => {
    const wrapper = shallow(<IdeaPreviewHeader idea={idea} {...IntlData} />);
    expect(wrapper.find('.idea__preview__header')).to.have.length(1);
    expect(wrapper.find('.idea__date')).to.have.length(1);
    expect(wrapper.find(UserLink)).to.have.length(1);
    expect(wrapper.find(UserAvatar)).to.have.length(1);
  });
});
