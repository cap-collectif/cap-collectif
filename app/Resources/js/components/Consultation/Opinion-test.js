// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { Opinion } from './Opinion';
import { $refType, $fragmentRefs } from '../../mocks';

describe('<Opinion />', () => {
  const props = {
    opinion: {
      $refType,
      $fragmentRefs,
      id: 'opinionId',
      author: { displayName: '', show_url: '', vip: false, media: { url: '' } },
      createdAt: '',
      pinned: true,
      section: {
        linkable: false,
        sourceable: true,
        versionable: true,
        voteWidgetType: 1,
        title: 'Section',
      },
      title: 'title',
      updatedAt: '',
      url: '',
      votesMitige: { totalCount: 0 },
      votesNok: { totalCount: 0 },
      votesOk: { totalCount: 0 },
    },
  };

  it('renders correcty', () => {
    const wrapper = shallow(<Opinion {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
