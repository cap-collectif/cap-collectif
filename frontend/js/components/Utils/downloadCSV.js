// @flow
import FileSaver from 'file-saver';
import type { IntlShape } from 'react-intl';
import { toast } from '~ds/Toast';

const downloadCSV = async (url: string, intl: IntlShape) => {
  const response = await fetch(url);
  if (response.ok) {
    const filename = response.headers.get('X-File-Name');
    const blob = await response.blob();
    FileSaver.saveAs(blob, filename);
  } else {
    const { errorTranslationKey } = await response.json();
    toast({
      variant: 'danger',
      content: intl.formatMessage({
        id: errorTranslationKey,
      }),
    });
  }
};
export default downloadCSV;
