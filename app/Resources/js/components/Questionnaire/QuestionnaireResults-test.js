// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { QuestionnaireResults } from './QuestionnaireResults';
import { $refType } from '../../mocks';

describe('<QuestionnaireResults />', () => {
  const props = {
    questionnaire: {
      step: {
        timeRange: {
          startAt: '2018-01-26T03:00:00+01:00',
          endAt: '2018-02-04T00:00:00+01:00',
        },
      },
      questions: [
        {
          title: 'As tu vues ces belles Quenouilles ?',
          description: null,
          responses: {
            totalCount: 2,
            edges: [
              {
                node: {
                  value: 'Oui',
                },
              },
              {
                node: {
                  value: 'Non',
                },
              },
            ],
          },
        },
        {
          title: 'Tu préfères',
          description: null,
          responses: {
            totalCount: 2,
            edges: [
              {
                node: {
                  value: 'Avoir la barbe en steack haché',
                },
              },
              {
                node: {
                  value: 'Les surcils en frite',
                },
              },
            ],
          },
        },
      ],
      $refType,
    },
  };

  it('renders correctly', () => {
    const wrapper = shallow(<QuestionnaireResults {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
