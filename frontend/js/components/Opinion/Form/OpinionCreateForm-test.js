// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { OpinionCreateForm } from './OpinionCreateForm';
import { formMock, $refType, $fragmentRefs } from '../../../mocks';

describe('<OpinionCreateForm />', () => {
  const defaultConsultationStep = {
    $refType,
    $fragmentRefs,
    id: '1',
    project: {
      _id: 'project1',
    },
    requirements: {
      reason: null,
      totalCount: 0,
      viewerMeetsTheRequirements: true,
    },
  };
  const props = {
    ...formMock,
    consultation: {
      $refType,
      titleHelpText: null,
      descriptionHelpText: null,
    },
    consultationStep: defaultConsultationStep,
    section: {
      $refType,
      id: 'section1',
      appendixTypes: [
        {
          id: '1',
          title: 'appendice',
          helpText: 'help text appendice',
        },
      ],
    },
  };

  it('renders correctly', () => {
    const wrapper = shallow(<OpinionCreateForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with requirements', () => {
    const propsWithRequirements = {
      ...props,
      consultationStep: {
        ...defaultConsultationStep,
        requirements: {
          reason: 'Ceci est une très bonne raison',
          totalCount: 12,
          viewerMeetsTheRequirements: true,
        },
      },
    };
    const wrapper = shallow(<OpinionCreateForm {...propsWithRequirements} />);
    expect(wrapper).toMatchSnapshot();
  });
});
