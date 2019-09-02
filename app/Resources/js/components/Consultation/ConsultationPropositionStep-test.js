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

  const multiConsultationProps = {
    ...props,
    isMultiConsultation: true,
    consultationStep: {
      ...props.consultationStep,
      project: {
        authors: [
          {
            url: 'https://capco.dev/profile/lebousername',
            username: 'lebousername',
            $fragmentRefs
          }
        ]
      }
    }
  }

  it('renders correctly with plan and when the step is not a multi consultation step', () => {
    const wrapper = shallow(<ConsultationPropositionStep {...props} consultationPlanEnabled />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly without plan and when the step is not a multi consultation step', () => {
    const wrapper = shallow(
      <ConsultationPropositionStep {...props2} consultationPlanEnabled={false} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with plan and when the step is a multi consultation step', () => {
    const wrapper = shallow(<ConsultationPropositionStep {...multiConsultationProps} consultationPlanEnabled/>);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly without plan and when the step is a multi consultation step', () => {
    const wrapper = shallow(
      <ConsultationPropositionStep {...multiConsultationProps} consultationPlanEnabled={false}/>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
