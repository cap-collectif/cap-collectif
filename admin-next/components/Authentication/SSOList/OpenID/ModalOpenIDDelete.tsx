import { useState, FC } from 'react';
import {
    Button,
    ButtonQuickAction,
    CapUIIcon,
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

const ModalOpenIDDelete: FC<ModalOpenIDDeleteProps> = ({ ssoConfiguration: ssoConfigurationFragment }) => {
    const intl = useIntl();
    const ssoConfiguration = useFragment(FRAGMENT, ssoConfigurationFragment);
    const [confirmed, setConfirmed] = useState(false);

    return (
        <Modal
            disclosure={
                <ButtonQuickAction
                    variantColor="red"
                    icon={CapUIIcon.Trash}
                    label={intl.formatMessage({ id: 'action_delete' })}
                />
            }
            ariaLabel={intl.formatMessage({ id: 'are-you-sure-you-want-to-delete-the-authentication-method' })}
            size={CapUIModalSize.Lg}>
            {({ hide }) => (
                <>
                    <Modal.Header>
                        <Heading>
                            {intl.formatMessage({ id: 'are-you-sure-you-want-to-delete-the-authentication-method' })}
                        </Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <Text color="gray.900">
                            {intl.formatMessage({ id: "are-you-sure-activating-new-editor"})}
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
                            onClick={hide}>
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
                </>
            )}
        </Modal>
    );
};

export default ModalOpenIDDelete;
