// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { Opinion } from './Opinion';
import { $refType } from '../../mocks';

describe('<Opinion />', () => {
  const props = {
    opinion: {
      $refType,
      id: 'opinionId',
      argumentsCount: 0,
      author: {
        displayName: '',
        show_url: '',
        vip: false,
        media: {
          url: '',
        },
      },
      createdAt: '',
      pinned: true,
      section: {
        linkable: false,
        sourceable: true,
        versionable: true,
        voteWidgetType: 1,
        title: 'Section',
      },
      sourcesCount: 0,
      title: 'title',
      updatedAt: '',
      url: '',
      versionsCount: 0,
      votesCount: 0,
      votesCountMitige: 0,
      votesCountNok: 0,
      votesCountOk: 0,
    },
  };

  it('renders correcty', () => {
    const wrapper = shallow(<Opinion {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
