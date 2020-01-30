// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { commitLocalUpdate } from 'react-relay';
import { Field, reduxForm, submit } from 'redux-form';
import type { Dispatch } from '~/types';
import FileInput, { type FormatFile } from '~/components/Form/FileInput/FileInput';
import FontFormContainer from './FontForm.style';
import Fetcher, { json } from '~/services/Fetcher';
import environment from '~/createRelayEnvironment';
import AlertForm from '~/components/Alert/AlertForm';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import type { FormError } from '~/components/Admin/Font/FontAdminContent/FontAdminContent';

const MESSAGE_INVALID_FONT_FORMAT = 'Invalid font format.';

const saveToServer = (
  files: Array<File>,
  setFontLoading: (file: File | null) => void,
  onError: (error: FormError) => void,
) => {
  files.forEach(file => {
    setFontLoading(file);
    const formData = new FormData();

    formData.append('file', file);

    Fetcher.postFormData('/upload/fonts', formData)
      .then(json)
      .then(
        res => {
          commitLocalUpdate(environment, store => {
            if (store.get(res.id)) {
              return;
            }
            const fonts = store.getRoot().getLinkedRecords('fonts') || [];

            const newFont = store.create(res.id, 'Font');
            newFont.setValue(res.id, 'id');
            newFont.setValue(res.isCustom, 'isCustom');
            newFont.setValue(res.name, 'name');
            newFont.setValue(res.useAsHeading, 'useAsHeading');
            newFont.setValue(res.useAsBody, 'useAsBody');

            if (fonts.filter(Boolean).find(f => f.getValue('name') === newFont.getValue('name'))) {
              return;
            }

            store.getRoot().setLinkedRecords([...fonts, newFont], 'fonts');
            if (window.FontFace !== undefined) {
              const font = new window.FontFace(res.name, `url(${res.url})`, {
                style: 'normal',
                weight: 700,
              });
              font.load().then(loaded => {
                window.document.fonts.add(loaded);
              });
            }
          });

          setFontLoading(null);
        },
        error => {
          setFontLoading(null);
          onError({
            filename: file.name,
            messageId:
              error.response.message === MESSAGE_INVALID_FONT_FORMAT
                ? 'download-error-file-format'
                : 'download-error',
          });
        },
      );
  }); // end foreach
};

type FormValues = {|
  font: FormatFile,
|};

type Props = {|
  ...ReduxFormFormProps,
  handleFontLoading: (file: File | null) => void,
  handleFormError: (error: FormError) => void,
|};

export const formName = 'form-font';

const onSubmit = (values: FormValues, dispatch, props: Props) => {
  const { font } = values;
  const { handleFontLoading, handleFormError } = props;

  if (font && font.length > 0) {
    saveToServer(font, handleFontLoading, handleFormError);
  }
};

export const FontForm = ({ handleSubmit, valid, invalid, pristine, submitting, error }: Props) => {
  return (
    <FontFormContainer id={formName} onSubmit={handleSubmit} enctype="multipart/form-data">
      <AlertForm
        valid={valid}
        invalid={invalid && !pristine}
        submitting={submitting}
        errorMessage={error}
      />
      <Field
        type="file"
        name="font"
        component={FileInput}
        className="input-file-upload"
        id="font_file"
        accept={['.zip, .ttf', '.woff', '.otf', '.eot']}
        label={
          <>
            <Icon name={ICON_NAME.plus} size={15} />
            <FormattedMessage id="global.add" />
          </>
        }
        multiple
      />

      <p>
        <FormattedMessage id="Add-custom-typeface-file-format" />
      </p>
    </FontFormContainer>
  );
};

const container = reduxForm({
  onSubmit,
  onChange: (values: FormValues, dispatch: Dispatch) => dispatch(submit(formName)),
  form: formName,
})(FontForm);

export default container;
