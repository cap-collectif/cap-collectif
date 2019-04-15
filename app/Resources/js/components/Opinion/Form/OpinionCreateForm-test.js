// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { OpinionCreateForm } from './OpinionCreateForm';
import { formMock, $refType, $fragmentRefs } from '../../../mocks';

describe('<OpinionCreateForm />', () => {
  const defaultConsultation = {
    $refType,
    $fragmentRefs,
    id: '1',
    project: {
      _id: 'project1',
    },
    titleHelpText: null,
    descriptionHelpText: null,
    requirements: {
      reason: null,
      totalCount: 0,
      viewerMeetsTheRequirements: true,
    },
  };
  const props = {
    ...formMock,
    consultation: defaultConsultation,
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
      consultation: {
        ...defaultConsultation,
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
