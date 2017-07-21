/* eslint-env jest */
import React from 'react';
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
    expect(wrapper.children()).toHaveLength(0);
  });

  it('it should render idea trash block when idea is trashed', () => {
    const wrapper = shallow(<IdeaPageTrashBlock idea={ideaTrashed} {...IntlData} />);
    expect(wrapper.find('#idea__trash-block')).toHaveLength(1);
    expect(wrapper.find('h2')).toHaveLength(1);
    expect(wrapper.find('FormattedMessage')).toHaveLength(1);
  });
});
