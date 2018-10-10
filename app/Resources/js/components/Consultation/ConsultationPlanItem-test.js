// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ConsultationPlanItem } from './ConsultationPlanItem';
import { $refType } from '../../mocks';

describe('<ConsultationPlanItem />', () => {
  const props = {
    section: {
      $refType,
      slug: 'slug',
      id: 'title',
      title: 'title',
    },
    activeItems: [],
    level: 0,
    onCollapse: jest.fn(),
  };

  it('renders correcty', () => {
    const wrapper = shallow(<ConsultationPlanItem {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
