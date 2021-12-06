// @flow
import * as React from 'react';
import { useDisclosure } from '@liinkiing/react-hooks';
import { useIntl } from 'react-intl';
import { Modal } from 'react-bootstrap';
import { ModalContainer } from '~/components/Admin/Emailing/MailParameter/common.style';
import Text from '~ui/Primitives/Text';
import Flex from '~ui/Primitives/Layout/Flex';
import Button from '~ds/Button/Button';
import Tag from '~ds/Tag/Tag';
import { ICON_NAME } from '~ds/Icon/Icon';
import SpotIcon, { SPOT_ICON_NAME } from '~ds/SpotIcon/SpotIcon';
import Heading from '~ui/Primitives/Heading';
import AppBox from '~ui/Primitives/AppBox';
import { FontWeight } from '~ui/Primitives/constants';

const needModalOnboarding = (): boolean => !localStorage.getItem('emailing_discover');

type Props = {|
  +isOnlyProjectAdmin: boolean,
|};

const ModalOnboarding = ({ isOnlyProjectAdmin }: Props) => {
  const intl = useIntl();
  const isDefaultOpen = needModalOnboarding();
  const { isOpen, onClose } = useDisclosure(isDefaultOpen);

  if (isDefaultOpen) localStorage.setItem('emailing_discover', 'true');

  const announcementTranslationKey = isOnlyProjectAdmin
    ? 'announcement.emailing.new.tool.project.admin'
    : 'announcement.emailing.new.tool';

  return (
    <ModalContainer
      animation={false}
      show={isOpen}
      onHide={onClose}
      bsSize="small"
      aria-labelledby="modal-title">
      <Flex direction="column" p={8}>
        <Flex direction="row" justify="space-between">
          <Tag variant="yellow">{intl.formatMessage({ id: 'global.beta.feature' })}</Tag>

          <Button
            onClick={onClose}
            rightIcon={ICON_NAME.CROSS}
            aria-label={intl.formatMessage({ id: 'global.close' })}
          />
        </Flex>

        <AppBox as={Modal.Body} p={0} my={4}>
          <Flex direction="column">
            <SpotIcon name={SPOT_ICON_NAME.EMAIL_SEND} size="lg" mb={4} alignSelf="center" />

            <Heading as="h4" mb={4} fontWeight={FontWeight.Semibold} color="gray.900">
              {intl.formatMessage({ id: 'welcome.new.emailing.tool' })}
            </Heading>
            <Text color="gray.700" mb={4}>
              {intl.formatMessage({ id: announcementTranslationKey })}
            </Text>
            <Text color="gray.700">
              {intl.formatMessage({ id: 'consult-help-center-new-feature' })}
            </Text>
          </Flex>
        </AppBox>

        <Button
          variant="primary"
          variantColor="primary"
          variantSize="medium"
          alignSelf="center"
          onClick={() => {
            window.location.href = intl.formatMessage({
              id: 'admin.help.link.emailing',
            });
          }}>
          {intl.formatMessage({ id: 'learn.more.plus' })}
        </Button>
      </Flex>
    </ModalContainer>
  );
};

export default ModalOnboarding;
