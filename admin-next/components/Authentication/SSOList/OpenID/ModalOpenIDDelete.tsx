import { useState, FC } from 'react';
import {
    Button,
    CapUIModalSize,
    Checkbox,
    Heading,
    Modal,
    Text,
} from '@cap-collectif/ui';
import { IntlShape, useIntl } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import type { ModalOpenIDDelete_ssoConfiguration$key } from '@relay/ModalOpenIDDelete_ssoConfiguration.graphql';
import { mutationErrorToast } from '@utils/mutation-error-toast';
import DeleteSSOConfigurationMutation from '@mutations/DeleteSSOConfigurationMutation';

type ModalOpenIDDeleteProps = {
    readonly ssoConfiguration: ModalOpenIDDelete_ssoConfiguration$key
    readonly isOpen: boolean
    readonly onClose: () => void
}

const FRAGMENT = graphql`
    fragment ModalOpenIDDelete_ssoConfiguration on Oauth2SSOConfiguration {
        id
    }
`;

const deleteSSO = (ssoId: string, intl: IntlShape) => {
    return DeleteSSOConfigurationMutation.commit({
        input: {
            id: ssoId,
        },
    })
        .catch(() => {
            mutationErrorToast(intl)
        });
}

const ModalOpenIDDelete: FC<ModalOpenIDDeleteProps> = ({ ssoConfiguration: ssoConfigurationFragment, onClose, isOpen }) => {
    const intl = useIntl();
    const ssoConfiguration = useFragment(FRAGMENT, ssoConfigurationFragment);
    const [confirmed, setConfirmed] = useState(false);

    return (
        <Modal
            show={isOpen}
            onClose={onClose}
            ariaLabel={intl.formatMessage({ id: 'are-you-sure-you-want-to-delete-the-authentication-method' })}
            size={CapUIModalSize.Lg}>
                <Modal.Header>
                    <Heading>
                        {intl.formatMessage({ id: 'are-you-sure-you-want-to-delete-the-authentication-method' })}
                    </Heading>
                </Modal.Header>
                <Modal.Body spacing={4}>
                    <Text color="gray.900">
                        {intl.formatMessage({ id: "you-will-delete-authentication-method"})}
                    </Text>
                    <Checkbox
                        checked={confirmed}
                        onChange={() => setConfirmed(!confirmed)}
                        id="confirmed-action"
                    >{intl.formatMessage({ id: 'admin.project.delete.confirm' })}</Checkbox>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        variantColor="primary"
                        variantSize="medium"
                        onClick={onClose}>
                        {intl.formatMessage({ id: 'cancel' })}
                    </Button>
                    <Button
                        variant="primary"
                        variantColor="danger"
                        variantSize="medium"
                        disabled={!confirmed}
                        onClick={() => deleteSSO(ssoConfiguration.id, intl)}>
                        {intl.formatMessage({ id: 'global.delete' })}
                    </Button>
                </Modal.Footer>
        </Modal>
    );
};

export default ModalOpenIDDelete;
