// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { Opinion } from './Opinion';
import { $refType, $fragmentRefs } from '../../mocks';

describe('<Opinion />', () => {
  const props = {
    showUpdatedDate: false,
    opinion: {
      $refType,
      $fragmentRefs,
      author: { displayName: '', show_url: '', vip: false, media: { url: '' } },
      votes: { totalCount: 0 },
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
