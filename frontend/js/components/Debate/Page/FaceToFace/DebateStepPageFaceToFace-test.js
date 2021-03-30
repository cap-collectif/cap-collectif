// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DebateStepPageFaceToFace } from './DebateStepPageFaceToFace';
import { $refType, $fragmentRefs } from '~/mocks';

const baseProps = {
  isMobile: false,
  step: {
    $refType,
    debate: {
      opinions: {
        edges: [
          { node: { type: 'FOR', body: 'Oui', $fragmentRefs } },
          { node: { type: 'AGAINST', body: 'Non', $fragmentRefs } },
        ],
      },
    },
  },
};

describe('<DebateStepPageFaceToFace />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<DebateStepPageFaceToFace {...baseProps} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should renders correctly on mobile', () => {
    const wrapper = shallow(<DebateStepPageFaceToFace {...baseProps} isMobile />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should renders correctly when not loaded', () => {
    const wrapper = shallow(<DebateStepPageFaceToFace step={null} isMobile={false} />);
    expect(wrapper).toMatchSnapshot();
  });
});
