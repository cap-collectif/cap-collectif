// @flow
import * as React from 'react';
import { useDisclosure } from '@liinkiing/react-hooks';
import { createFragmentContainer, graphql } from 'react-relay';
import { Field } from 'redux-form';
import { useIntl } from 'react-intl';
import { Container } from '../common.style';
import { PreviewContainer } from './style';
import component from '~/components/Form/Field';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import PreviewMail from './PreviewMail/PreviewMail';
import ModalMailTest from '~/components/Admin/Emailing/MailParameter/Content/ModalMailTest/ModalMailTest';
import type { Content_emailingCampaign } from '~relay/Content_emailingCampaign.graphql';

type Props = {|
  disabled: boolean,
  showError: boolean,
  emailingCampaign: Content_emailingCampaign,
|};

export const ContentPage = ({ disabled, showError, emailingCampaign }: Props) => {
  const intl = useIntl();
  const { isOpen, onOpen, onClose } = useDisclosure(false);
  const previewMailRef = React.useRef<?HTMLDivElement>(null);

  return (
    <Container disabled={disabled}>
      <h3>{intl.formatMessage({ id: 'global.contenu' })}</h3>

      <PreviewContainer>
        <p>{intl.formatMessage({ id: 'global.preview' })}</p>

        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            previewMailRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }>
          <Icon name={ICON_NAME.browser} size={15} color="#000" />
          <span>{intl.formatMessage({ id: 'on-browser' })}</span>
        </button>

        <button type="button" onClick={onOpen} disabled={disabled}>
          <Icon name={ICON_NAME.letter} size={15} color="#000" />
          <span>{intl.formatMessage({ id: 'by-mail' })}</span>
        </button>
      </PreviewContainer>

      <Field
        type="text"
        id="mailSubject"
        name="mailSubject"
        component={component}
        label={intl.formatMessage({ id: 'mail-subject' })}
        disabled={disabled}
        disableValidation={!showError}
      />

      <Field
        type="editor"
        id="mailContent"
        name="mailContent"
        component={component}
        label={intl.formatMessage({ id: 'mail-content' })}
        disabled={disabled}
        disableValidation={!showError}
      />

      <PreviewMail reference={previewMailRef} emailingCampaign={emailingCampaign} />

      {isOpen && (
        <ModalMailTest show={isOpen} onClose={onClose} emailingCampaign={emailingCampaign} />
      )}
    </Container>
  );
};

export default createFragmentContainer(ContentPage, {
  emailingCampaign: graphql`
    fragment Content_emailingCampaign on EmailingCampaign {
      ...PreviewMail_emailingCampaign
      ...ModalMailTest_emailingCampaign
    }
  `,
});
