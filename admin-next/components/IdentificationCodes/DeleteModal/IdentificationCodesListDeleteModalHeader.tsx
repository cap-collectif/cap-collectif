import { FC } from 'react';
import { useIntl } from 'react-intl';
import { Heading, Modal } from '@cap-collectif/ui';

const IdentificationCodesListDeleteModalHeader: FC = () => {
    const intl = useIntl();

    return (
        <Modal.Header>
            <Heading>
                {intl.formatMessage({ id: 'title-delete-mailing-list-confirmation' }, { num: 1 })}
            </Heading>
        </Modal.Header>
    );
};

export default IdentificationCodesListDeleteModalHeader;
