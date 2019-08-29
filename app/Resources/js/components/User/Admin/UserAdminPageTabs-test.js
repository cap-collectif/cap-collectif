/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import { intlMock } from '../../../mocks';
import { UserAdminPageTabs } from './UserAdminPageTabs';

describe('<UserAdminPageTabs/>', () => {
  const props1 = {
    intl: intlMock,
  };

  const user = {
    url: 'https://fr.wikipedia.org/wiki/Dahu',
  };

  it('should render', () => {
    const wrapper = shallow(<UserAdminPageTabs {...props1} user={user} />);
    expect(wrapper).toMatchSnapshot();
  });
});
