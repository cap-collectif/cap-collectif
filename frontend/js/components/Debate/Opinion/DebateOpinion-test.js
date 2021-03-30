// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DebateOpinion } from './DebateOpinion';
import { $refType, $fragmentRefs } from '~/mocks';

const baseProps = {
  isMobile: false,
  readMore: false,
  opinion: {
    $fragmentRefs,
    $refType,
    title: 'Opinion',
    body: `Oui, ma gâtée, RS4 gris nardo, bien sûr qu'ils m'ont raté (gros, bien sûr)
    Soleil dans la bulle, sur le Prado, Shifter pro' (Shifter pro')
    Contre-sens (ah), ma chérie, tu es à contre-sens
    Puta, où tu étais quand j'mettais des sept euros d'essence (hein)`,
    author: {
      $fragmentRefs,
      username: 'Agui le penseur',
      biography: 'Jsuis né dans les favela au brésil',
    },
    type: 'FOR',
  },
};

describe('<DebateOpinion />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<DebateOpinion {...baseProps} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should renders correctly on mobile', () => {
    const wrapper = shallow(<DebateOpinion {...baseProps} isMobile />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should renders correctly with readMore', () => {
    const wrapper = shallow(<DebateOpinion {...baseProps} readMore />);
    expect(wrapper).toMatchSnapshot();
  });
});
