// @flow
import React from 'react';
import { FormattedMessage, type IntlShape, injectIntl } from 'react-intl';
import { SubmissionError } from 'redux-form';
import { type FontAdminContent_fonts } from '~relay/FontAdminContent_fonts.graphql';
import Icon from '~/components/Ui/Icons/Icon';
import ButtonPopover, { PLACEMENT } from '~/components/Ui/Button/ButtonPopover';
import FontUseFormContainer, { FontNameContainer } from './FontUseForm.style';
import FontPopover from '../FontPopover/FontPopover';
import Loader from '~/components/Ui/FeedbacksIndicators/Loader';
import ChangeFontMutation from '~/mutations/ChangeFontMutation';
import DeleteFontMutation from '~/mutations/DeleteFontMutation';
import config from '~/config';

type Props = {|
  intl: IntlShape,
  fontLoading: File | null,
  fonts: FontAdminContent_fonts,
|};

const form = {
  name: 'form-font-usage',
  radioName: {
    heading: 'heading',
    body: 'body',
  },
};

const TYPE_USAGE: {
  heading: 'heading',
  body: 'body',
} = {
  heading: 'heading',
  body: 'body',
};

const onChange = (
  type: $Values<typeof TYPE_USAGE>,
  id: string,
  fonts: FontAdminContent_fonts,
  intl,
) => {
  const currentFont: Object = fonts.find(f =>
    type === TYPE_USAGE.heading ? f.useAsBody : f.useAsHeading,
  );

  const input = {
    heading: type === TYPE_USAGE.heading ? id : currentFont.id,
    body: type === TYPE_USAGE.body ? id : currentFont.id,
  };

  return ChangeFontMutation.commit({
    input,
  })
    .then(response => {
      if (!response.changeFont) {
        throw new Error('Mutation "ChangeFontMutation" failed.');
      }
    })
    .catch(() => {
      throw new SubmissionError({
        _error: intl.formatMessage({ id: 'global.error.server.form' }),
      });
    });
};

const onDeleteFont = (id: string, fonts, intl) => {
  let nextBodyFont = null;
  let nextHeadingFont = null;
  const currentBodyFont = fonts.find(f => f.useAsBody);
  const currentHeadingFont = fonts.find(f => f.useAsHeading);

  const defaultFont = fonts.find(f => f.name === 'Helvetica Neue');

  const deletedFont = fonts.find(f => f.id === id);

  // able to apply optimistic response
  if (deletedFont && currentBodyFont && currentHeadingFont && defaultFont) {
    const isCheckedBody = deletedFont.useAsBody;
    const isCheckedHeading = deletedFont.useAsHeading;

    nextBodyFont = !isCheckedBody ? currentBodyFont.id : defaultFont.id;
    nextHeadingFont = !isCheckedHeading ? currentHeadingFont.id : defaultFont.id;
  }

  return DeleteFontMutation.commit(
    {
      input: {
        id,
      },
    },
    nextBodyFont,
    nextHeadingFont,
  )
    .then(response => {
      if (!response.deleteFont) {
        throw new Error('Mutation "DeleteFontMutation" failed.');
      }
    })
    .catch(() => {
      throw new SubmissionError({
        _error: intl.formatMessage({ id: 'global.error.server.form' }),
      });
    });
};

const orderAlphabeticallyCustomFonts = (fonts: FontAdminContent_fonts) => {
  const fontsCLone = [...fonts];

  const fontsWithoutCustom = fontsCLone.filter(f => !f.isCustom);
  const fontsCustomSort = fontsCLone
    .filter(f => f.isCustom)
    .sort((a, b) => (a.name < b.name ? -1 : 1));

  return [...fontsWithoutCustom, ...fontsCustomSort];
};

export const FontUseForm = ({ fonts, fontLoading, intl }: Props) => {
  const orderedFonts = orderAlphabeticallyCustomFonts(fonts);

  return (
    <FontUseFormContainer>
      <table>
        <thead>
          <tr>
            <th>
              <FormattedMessage id="group.title" />
            </th>
            <th className="small__column">
              <FormattedMessage id="admin.fields.group.title" />
            </th>
            <th className="small__column">
              <FormattedMessage id="text.body" />
            </th>
          </tr>
        </thead>
        <tbody>
          {orderedFonts.map((f, i: number) => (
            <tr key={i}>
              <FontNameContainer fontName={f.name}>
                <span>{f.name}</span>

                {f.isCustom && (
                  <ButtonPopover
                    id={f.id}
                    placement={config.isMobile ? PLACEMENT.TOP : PLACEMENT.RIGHT}
                    trigger={
                      <button type="button" className="btn-remove">
                        <Icon name="trash" size={16} viewBox="0 0 16 16" />
                        <FormattedMessage id="global.delete" />
                      </button>
                    }>
                    <FontPopover
                      onConfirm={() => {
                        onDeleteFont(f.id, fonts, intl);
                      }}
                    />
                  </ButtonPopover>
                )}
              </FontNameContainer>

              <td className="radio__cell">
                <label htmlFor={`${f.id}-${form.radioName.heading}`}>
                  <Icon
                    name={f.useAsHeading ? 'radioButton--checked' : 'radioButton'}
                    strokeWidth={f.useAsHeading ? 0 : 1}
                    size={20}
                    viewBox="0 0 16 16"
                  />
                </label>
                <input
                  type="radio"
                  id={`${f.id}-${form.radioName.heading}`}
                  name={form.radioName.heading}
                  checked={f.useAsHeading}
                  onChange={() => onChange(TYPE_USAGE.heading, f.id, fonts, intl)}
                />
              </td>

              <td className="radio__cell">
                <label htmlFor={`${f.id}-${form.radioName.body}`}>
                  <Icon
                    name={f.useAsBody ? 'radioButton--checked' : 'radioButton'}
                    strokeWidth={f.useAsBody ? 0 : 1}
                    size={20}
                    viewBox="0 0 16 16"
                  />
                </label>
                <input
                  type="radio"
                  id={`${f.id}-${form.radioName.body}`}
                  name={form.radioName.body}
                  checked={f.useAsBody}
                  onChange={() => onChange(TYPE_USAGE.body, f.id, fonts, intl)}
                />
              </td>
            </tr>
          ))}

          {fontLoading && (
            <tr>
              <FontNameContainer>
                <Loader size={30} />
                {fontLoading.name}
              </FontNameContainer>
              <td />
              <td />
            </tr>
          )}
        </tbody>
      </table>
    </FontUseFormContainer>
  );
};

const container = injectIntl(FontUseForm);

export default container;
