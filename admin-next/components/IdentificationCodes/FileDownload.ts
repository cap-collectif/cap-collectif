import { getBaseUrlWithAdminNextSupport } from '~/config';

const getFileDownloadUrl = (listId: string): string => {
    return (
        getBaseUrlWithAdminNextSupport() +
        '/identificationCodesList/download/cap-collectif-codes-' +
        listId +
        '.csv'
    );
};

export default getFileDownloadUrl;
