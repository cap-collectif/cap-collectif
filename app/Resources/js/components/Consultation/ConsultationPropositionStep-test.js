// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ConsultationPropositionStep } from './ConsultationPropositionStep';
import { $fragmentRefs, $refType } from '../../mocks';

describe('<ConsultationPropositionStep />', () => {
  const props = {
    showConsultationPlan: true,
    isMultiConsultation: false,
    consultationPlanEnabled: true,
    consultationStep: {
      id: 'myStep',
      title: 'El titro',
      body: 'Je suis le beau body',
      status: 'OPENED',
      timeRange: {
        startAt: new Date(2019, 6, 25).toDateString(),
        endAt: new Date(2019, 6, 25).toDateString(),
      },
      consultation: {
        title: 'Je suis la belle consultation',
        description: null,
        contributions: {
          totalCount: 0
        },
        contributors: {
          totalCount: 0
        },
        votesCount: 0,
        $fragmentRefs,
      },
      timeless: false,
      $refType,
    },
  };

  const props2 = {
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
              id: 'consultation1',
              sections: [
                {
                  id: 'section1',
                  sections: null,
                },
              ],
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
      <ConsultationPropositionStep {...props2} consultationPlanEnabled={false} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
