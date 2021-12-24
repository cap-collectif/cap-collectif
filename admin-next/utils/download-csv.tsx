import { IntlShape } from 'react-intl';
import { toast } from '@cap-collectif/ui';
import saveAs from './filesaver';

const downloadCSV = async (url: string, intl: IntlShape) => {
    const response = await fetch(url);
    if (response.ok) {
        const contentDisposition = response.headers.get('content-disposition');
        let filename: string | null = '';
        if (contentDisposition) {
            // eslint-disable-next-line prefer-destructuring
            filename = contentDisposition.split('=')[1];
        } else {
            filename = response.headers.get('X-File-Name');
        }

        const blob = await response.blob();
        saveAs(blob, filename);
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
