/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import IdeaPageTrashBlock from './IdeaPageTrashBlock';


const ideaNotTrashed = {
  id: 1,
  trashed: false,
};

const ideaTrashed = {
  id: 1,
  trashed: true,
};

describe('<IdeaPageTrashBlock />', () => {
  it('it should render nothing when idea is not trashed', () => {
    const wrapper = shallow(<IdeaPageTrashBlock idea={ideaNotTrashed} {...IntlData} />);
    expect(wrapper.children()).to.have.length(0);
  });

  it('it should render idea trash block when idea is trashed', () => {
    const wrapper = shallow(<IdeaPageTrashBlock idea={ideaTrashed} {...IntlData} />);
    expect(wrapper.find('#idea__trash-block')).to.have.length(1);
    expect(wrapper.find('h2')).to.have.length(1);
    expect(wrapper.find('FormattedMessage')).to.have.length(1);
  });
});
