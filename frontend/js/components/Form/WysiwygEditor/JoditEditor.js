// @flow
import React, { useRef, useMemo } from 'react';
import JoditEditor from 'jodit-react';
import AppBox from '~/components/Ui/Primitives/AppBox';
import localConfig from '~/config';

type Props = {
  value?: any,
  onChange: string => void,
  id?: string,
  name: string,
  className: string,
  disabled?: boolean,
  initialContent?: ?string,
  currentLanguage: string,
  withCharacterCounter?: boolean,
  maxLength?: string,
  selectedLanguage?: string,
  noCode?: boolean,
};

const getConfig = (currentLanguage, noCode, editor) => {
  const buttons = [
    'bold',
    'italic',
    'underline',
    'strikethrough',
    'eraser',
    '|',
    'ul',
    'ol',
    '|',
    'left',
    'center',
    'right',
    'justify',
    '|',
    'fontsize',
    'brush',
    'paragraph',
    '|',
    'superscript',
    'subscript',
    '|',
    'image',
    'video',
    'file',
    'link',
    'table',
    '|',
    'undo',
    'redo',
    '|',
    'hr',
    noCode ? '' : 'source',
  ];
  return {
    readonly: false,
    minHeight: 300,
    style: {
      background: 'white',
    },
    language: currentLanguage?.substr(0, 2) || 'fr',
    uploader: {
      url: `${localConfig.getApiUrl()}/files`,
      format: 'json',
      credentials: 'same-origin',
      headers: {},
      prepareData: data => {
        data.append('file', data.getAll('files[0]')[0]);
        data.delete('file[0');
      },
      isSuccess: resp => {
        return !resp.errorCode;
      },
      getMsg: resp => {
        return resp.msg.join !== undefined ? resp.msg.join(' ') : resp.msg;
      },
      process: resp => {
        return {
          files: [resp.name],
          baseurl: resp.url,
          error: resp.error,
          msg: resp.msg,
        };
      },
      error: e => {
        console.error(e);
      },
      defaultHandlerError: resp => {
        console.error(resp);
      },
      defaultHandlerSuccess: data => {
        if (editor.current) {
          if (/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(data.baseurl))
            editor.current.component.selection.insertImage(data.baseurl);
          else {
            const elm = editor.current.component.createInside.element('a');
            elm.setAttribute('href', data.baseurl);
            // eslint-disable-next-line prefer-destructuring
            elm.textContent = data.files[0];
            editor.current.component.selection.insertNode(elm);
          }
        }
      },
    },
    buttons,
    buttonsMD: buttons,
    buttonsSM: buttons,
  };
};

const Jodit = ({ onChange, value, currentLanguage, id, selectedLanguage, noCode }: Props) => {
  // TODO : Flow types for Jodit ??
  const editor = useRef<any>(null);

  const config = useMemo(
    () => getConfig(currentLanguage, noCode, editor),
    [currentLanguage, noCode],
  );

  return useMemo(
    () => (
      <AppBox id={id} className="joditEditor">
        <JoditEditor
          ref={editor}
          value={value}
          config={config}
          // eslint-disable-next-line jsx-a11y/tabindex-no-positive
          tabIndex={1}
          onChange={onChange}
        />
      </AppBox>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedLanguage],
  );
};

export default Jodit;
