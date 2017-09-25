/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { IdeaForm } from '../Form/IdeaForm';

const props = {
  themes: [],
  onValidationFailure: () => {},
  onSubmitSuccess: () => {},
  onSubmitFailure: () => {},
};

const idea = {
  id: 1,
  theme: {
    id: 1,
  },
};

describe('<IdeaForm />', () => {
  it('it should render a form with all the fields but themes and confirm', () => {
    const wrapper = shallow(<IdeaForm {...props} isSubmitting={false} showThemes={false} />);
    const form = wrapper.find('#idea-form');
    expect(form).toHaveLength(1);
    expect(form.find('#idea_confirm')).toHaveLength(0);
    expect(form.find('#idea_title')).toHaveLength(1);
    expect(form.find('#idea_theme')).toHaveLength(0);
    expect(form.find('#idea_body')).toHaveLength(1);
    expect(form.find('#idea_object')).toHaveLength(1);
    expect(form.find('#idea_url')).toHaveLength(1);
    expect(form.find('#idea_media')).toHaveLength(1);
  });

  it('it should render the confirm checkbox when idea is provided', () => {
    const wrapper = shallow(
      <IdeaForm {...props} idea={idea} isSubmitting={false} showThemes={false} />,
    );
    const form = wrapper.find('#idea-form');
    expect(form).toHaveLength(1);
    expect(form.find('#idea_confirm')).toHaveLength(1);
  });

  it('it should render theme field when feature is enabled', () => {
    const wrapper = shallow(<IdeaForm {...props} isSubmitting={false} showThemes />);
    const form = wrapper.find('#idea-form');
    expect(form).toHaveLength(1);
    expect(form.find('#idea_theme')).toHaveLength(1);
  });
});
