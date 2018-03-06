// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ConsultationPropositionBox } from './ConsultationPropositionBox';

describe('<ConsultationPropositionBox />', () => {
  const props = {
    step: {
      id: 'stepId',
      title: 'stepTitle',
      startAt: '2014-08-14T00:00:00+0200',
      endAt: '2014-09-27T00:00:00+0200',
      timeless: false
    }
  };

  it('renders correcty', () => {
    const wrapper = shallow(<ConsultationPropositionBox {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
