// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { UnpublishedArgumentList } from './UnpublishedArgumentList';
import { $refType, $fragmentRefs } from '../../mocks';

describe('<UnpublishedArgumentList />', () => {
  it('renders nothing when empty', () => {
    const argumentable = { $refType, viewerArgumentsUnpublished: null };
    const wrapper = shallow(<UnpublishedArgumentList type="FOR" argumentable={argumentable} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correcty', () => {
    const argumentable = {
      $refType,
      viewerArgumentsUnpublished: {
        totalCount: 1,
        edges: [{ node: { $fragmentRefs, id: 'argument1' } }],
      },
    };
    const wrapper = shallow(<UnpublishedArgumentList type="FOR" argumentable={argumentable} />);
    expect(wrapper).toMatchSnapshot();
  });
});
