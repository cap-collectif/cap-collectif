// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { QuestionnaireAdminResultsRanking } from './QuestionnaireAdminResultsRanking';
import { $refType } from '../../mocks';

describe('<QuestionnaireAdminResultsRanking />', () => {
  const props = {
    $refType,
    choices: [
      { title: 'choix1', ranking: [] },
      { title: 'choix2', ranking: [] },
      { title: 'choix3', ranking: [] },
      { title: 'choix4', ranking: [] },
    ],
  };

  it('renders correctly', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsRanking multipleChoiceQuestion={props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
