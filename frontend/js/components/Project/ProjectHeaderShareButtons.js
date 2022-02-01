// @flow
import * as React from 'react';
import { useDisclosure } from '@liinkiing/react-hooks';
import { useIntl } from 'react-intl';
import { Button, Heading, Modal, CapUIModalSize } from '@cap-collectif/ui';
import ProjectHeader from '~ui/Project/ProjectHeader';
import share from '~/utils/share';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';
import ResetCss from '~/utils/ResetCss';

export type Props = {|
  +url: string,
  +title: string,
|};

const ProjectHeaderShareButtons = ({ url, title }: Props): React.Node => {
  const hasShareButtons = useFeatureFlag('share_buttons');
  const intl = useIntl();
  const { isOpen, onOpen, onClose } = useDisclosure(false);

  const renderModal = () => {
    return (
      <Modal baseId="project-header-share-buttons-modal" show={isOpen} onClose={onClose} ariaLabel={intl.formatMessage({ id: 'share.link' })} size={CapUIModalSize.Lg}>
        <ResetCss>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'share.link' })}</Heading>
          </Modal.Header>
        </ResetCss>
        <Modal.Body>
          <p className="excerpt">{title}</p>
          <textarea title={intl.formatMessage({ id: 'share.link' })} readOnly rows="3">
            {url}
          </textarea>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" variantSize="medium" onClick={onClose}>
            {intl.formatMessage({ id: 'global.close' })}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };
  if (!hasShareButtons) {
    return null;
  }
  return (
    <ProjectHeader.Socials>
      <ProjectHeader.Social
        href="#"
        onClick={(event: Event) => {
          event.preventDefault();
          share(title, url, 'facebook');
        }}
        name="FACEBOOK"
      />
      <ProjectHeader.Social
        href="#"
        onClick={(event: Event) => {
          event.preventDefault();
          share(title, url, 'twitter');
        }}
        name="TWITTER"
      />
      <ProjectHeader.Social
        href="#"
        onClick={(event: Event) => {
          event.preventDefault();
          onOpen();
        }}
        name="LINK"
      />
      {renderModal()}
    </ProjectHeader.Socials>
  );
};

export default ProjectHeaderShareButtons;
