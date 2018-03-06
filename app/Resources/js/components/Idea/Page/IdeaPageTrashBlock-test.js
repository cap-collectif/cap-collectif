/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import IdeaPageTrashBlock from './IdeaPageTrashBlock';

const ideaNotTrashed = {
  id: 1,
  trashedAt: '2017-07-10T18:53:58+0200',
  trashed: false
};

const ideaTrashed = {
  id: 1,
  trashedAt: '2017-07-10T18:53:58+0200',
  trashed: true
};

describe('<IdeaPageTrashBlock />', () => {
  it('it should render nothing when idea is not trashed', () => {
    const wrapper = shallow(<IdeaPageTrashBlock idea={ideaNotTrashed} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('it should render idea trash block when idea is trashed', () => {
    const wrapper = shallow(<IdeaPageTrashBlock idea={ideaTrashed} />);
    expect(wrapper).toMatchSnapshot();
  });
});
