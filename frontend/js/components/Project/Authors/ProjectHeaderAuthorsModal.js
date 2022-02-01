// @flow
import * as React from 'react';
import styled from 'styled-components';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import { ListGroupItem } from 'react-bootstrap';
import { Modal, Button, Heading, CapUIModalSize } from '@cap-collectif/ui'
import ListGroupFlush from '../../Ui/List/ListGroupFlush';
import UserAvatar from '../../User/UserAvatar';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';
import type { ProjectHeaderAuthorsModal_project$key } from '~relay/ProjectHeaderAuthorsModal_project.graphql';
import ResetCss from '~/utils/ResetCss';


type Props = {|
  +show: boolean,
  +onClose: () => void,
  +project: ProjectHeaderAuthorsModal_project$key,
|};

const ProjectAuthorItem = styled(ListGroupItem).attrs({
  className: 'projectAuthorItem',
})`
  border-right: none;
  border-left: none;
`;

const ProjectAuthorList = styled(ListGroupFlush)`
  .projectAuthorItem:first-of-type {
    border-top: none;
  }

  .projectAuthorItem:last-of-type {
    border-bottom: none;
  }
`;

const FRAGMENT = graphql`
  fragment ProjectHeaderAuthorsModal_project on Project {
    authors {
      ...UserAvatar_user
      id
      url
      username
      userType {
        name
      }
    }
  }
`;

const ProjectHeaderAuthorsModal = ({ show, onClose, project }: Props): React.Node => {
  const profilesToggle = useFeatureFlag('profiles');
  const intl = useIntl();
  const data = useFragment(FRAGMENT, project);
  return (
    <Modal
      id="show-authors-modal"
      baseId="show-authors-modal"
      show={show}
      onClose={onClose}
      ariaLabel={intl.formatMessage({ id: 'project.authors' })}
      size={CapUIModalSize.Lg}
    >
      <ResetCss>
        <Modal.Header>
          <Heading>
            {intl.formatMessage(
              { id: 'number-of-authors' },
              { num: data.authors ? data.authors.length : 0 },
            )}
          </Heading>
        </Modal.Header>
      </ResetCss>
      <Modal.Body>
        <ProjectAuthorList className="mb-0">
          {data.authors.map(user => (
            <ProjectAuthorItem key={user.id}>
              <div className="d-flex">
                <UserAvatar user={user} />
                <div className="d-flex fd-column">
                  {profilesToggle ? (
                    <a href={user.url}>{user.username}</a>
                  ) : (
                    <span className="font-weight-bold">{user.username}</span>
                  )}
                  <span className="excerpt">{user.userType ? user.userType.name : ''}</span>
                </div>
              </div>
            </ProjectAuthorItem>
          ))}
        </ProjectAuthorList>
      </Modal.Body>
      <Modal.Footer spacing={2}>
        <Button variant="primary" variantSize="medium" onClick={onClose}>
          {intl.formatMessage({ id: 'global.close' })}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
export default ProjectHeaderAuthorsModal;
