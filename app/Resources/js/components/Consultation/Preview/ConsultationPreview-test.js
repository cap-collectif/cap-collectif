// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ConsultationPreview, ConsultationPreviewBody, ConsultationPreviewCover } from './ConsultationPreview';
import { $refType } from '../../../mocks'

const props = {
  consultation: {
    $refType,
    id: 'firstConsultation',
    title: 'Première consultation',
    url: 'https://capco.dev/project/strategie-technologique-de-letat-et-services-publics/consultation/etape-de-multi-consultation/consultation/premiere-consultation',
    illustration: null,
    contributions: {
      totalCount: 12,
    },
    contributors: {
      totalCount: 1,
    },
    votesCount: 0,
  },
};

describe('<ConsultationPreview />', () => {

  it('should render correctly with a given consultation', () => {

    const wrapper = shallow(<ConsultationPreview {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

});


describe('<ConsultationPreviewBody />', () => {

  it('should render correctly with a given consultation', () => {

    const wrapper = shallow(<ConsultationPreviewBody consultation={props.consultation} />);
    expect(wrapper).toMatchSnapshot();
  });

});

describe('<ConsultationPreviewCover />', () => {

  it('should render with a default illustration when consultation does not have an image', () => {
    const wrapper = shallow(<ConsultationPreviewCover consultation={props.consultation} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render with an illustration when consultation have an image', () => {
    const consultation = {
      ...props.consultation,
      illustration: {
        url: "https://capco.dev/media/default/0001/01/13ff68eab987849ccef72a15bc6a1d74905fb0f6.png",
      }
    };

    const wrapper = shallow(<ConsultationPreviewCover consultation={consultation} />);
    expect(wrapper).toMatchSnapshot();
  });

});
