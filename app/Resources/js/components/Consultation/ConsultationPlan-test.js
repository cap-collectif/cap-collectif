// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ConsultationPlan } from './ConsultationPlan';
import { $refType, $fragmentRefs } from '../../mocks';

describe('<ConsultationPlan />', () => {
  const props = {
    step: {
      id: 'project1',
      title: 'Elaboration de la Loi',
      startAt: '2018-09-01T17:08:44+0200',
      endAt: '2018-09-29T13:23:45+0200',
      timeless: false,
      status: 'OPENED',
      $refType,
      $fragmentRefs,
    },
  };

  it('renders correcty', () => {
    const wrapper = shallow(<ConsultationPlan {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
