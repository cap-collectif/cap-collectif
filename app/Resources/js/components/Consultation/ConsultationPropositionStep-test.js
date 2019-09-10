// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ConsultationPropositionStep } from './ConsultationPropositionStep';
import { $fragmentRefs, $refType } from '../../mocks';

describe('<ConsultationPropositionStep />', () => {
  const props = {
    showConsultationPlan: true,
    consultationPlanEnabled: true,
    consultationStep: {
      id: 'myStep',
      title: 'El titro',
      status: 'OPENED',
      timeRange: {
        startAt: new Date(2019, 6, 25).toDateString(),
        endAt: new Date(2019, 6, 25).toDateString(),
      },
      consultations: {
        edges: [
          {
            node: {
              $fragmentRefs,
            },
          },
        ],
      },
      timeless: false,
      $refType,
      $fragmentRefs,
    },
  };

  it('renders correctly with plan', () => {
    const wrapper = shallow(<ConsultationPropositionStep {...props} consultationPlanEnabled />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly without plan', () => {
    const wrapper = shallow(
      <ConsultationPropositionStep {...props} consultationPlanEnabled={false} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
