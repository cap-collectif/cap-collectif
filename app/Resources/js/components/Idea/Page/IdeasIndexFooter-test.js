/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import { IdeasIndexFooter } from './IdeasIndexFooter';

const props = {
  trashUrl: 'trash.html',
  countTrashed: 5,
};

const featuresIdeaTrashEnabled = {
  idea_trash: true,
};

const featuresIdeaTrashDisabled = {
  idea_trash: false,
};

describe('<IdeasIndexFooter />', () => {
  it('it should render nothing when idea trash feature is not enabled', () => {
    const wrapper = shallow(<IdeasIndexFooter features={featuresIdeaTrashDisabled} {...props} {...IntlData} />);
    expect(wrapper.children()).to.have.length(0);
  });

  it('it should render ideas index footer when trash url is provided and ideas trash feature is enabled', () => {
    const wrapper = shallow(<IdeasIndexFooter features={featuresIdeaTrashEnabled} {...props} {...IntlData} />);
    expect(wrapper.find('.appendices__container')).to.have.length(1);
    expect(wrapper.find('Row')).to.have.length(1);
    expect(wrapper.find('Col')).to.have.length(1);
    expect(wrapper.find('.appendices__item')).to.have.length(1);
    const message = wrapper.find('FormattedMessage');
    expect(message.find({ num: props.countTrashed })).to.have.length(1);
    expect(wrapper.find('#ideas-trash')).to.have.length(1);
  });
});
