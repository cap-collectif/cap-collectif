// @flow
import React from 'react';
import {
  getButtonContentForType,
  getButtonLinkForType,
  type LoginSocialButtonType,
} from '~ui/Button/LoginSocialButton';
import SocialIcon from '~ui/Icons/SocialIcon';
import { baseUrl } from '~/config';
import Link from '~ds/Link/Link';
import {
  FranceConnectButton,
  LinkButton,
  PrimarySSOButton,
  SecondarySSOButton,
  TertiarySSOButton,
} from '~/components/User/Invitation/SSOButton.style';

type Props = {|
  +primaryColor: string,
  +btnTextColor: string,
  +type: LoginSocialButtonType,
  +index?: number,
  +switchUserMode?: boolean,
  +text?: string,
|};

const SSOButton = ({ primaryColor, btnTextColor, type, index, switchUserMode, text }: Props) => {
  const redirectUri = switchUserMode ? `${baseUrl}/sso/switch-user` : baseUrl;

  const link = getButtonLinkForType(type, redirectUri, true);
  const linkText = text ?? getButtonContentForType(type);

  if (type === 'facebook') {
    return (
      <LinkButton type="facebook">
        <SocialIcon className="loginIcon" name={type} />
        <a href={link} title={type} target="_blank" rel="noreferrer">
          <span>{linkText}</span>
        </a>
      </LinkButton>
    );
  }

  if (type === 'franceConnect') {
    return (
      <FranceConnectButton>
        <Link href={link} target="_blank" width="100%">
          <SocialIcon className="loginIcon" name={type} />
        </Link>
      </FranceConnectButton>
    );
  }

  if (index === 0) {
    return (
      <PrimarySSOButton
        backgroundColor={primaryColor}
        textColor={btnTextColor}
        href={link}
        target="_blank">
        {linkText}
      </PrimarySSOButton>
    );
  }

  if (index === 1) {
    return (
      <SecondarySSOButton
        borderColor={primaryColor}
        textColor={primaryColor}
        href={link}
        target="_blank">
        {linkText}
      </SecondarySSOButton>
    );
  }

  return (
    <TertiarySSOButton textColor={primaryColor} href={link} target="_blank">
      {linkText}
    </TertiarySSOButton>
  );
};

export default SSOButton;
