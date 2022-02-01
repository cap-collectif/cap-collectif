// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FormattedMessage, useIntl } from 'react-intl';
import { ListGroupItem } from 'react-bootstrap';
import { useDisclosure } from '@liinkiing/react-hooks';
import type { StyledComponent } from 'styled-components';
import type { ProjectHeaderThemeListLegacy_project$key } from '~relay/ProjectHeaderThemeListLegacy_project.graphql';
import ProjectHeader from '~ui/Project/ProjectHeaderLegacy';
import colors from '~/styles/modules/colors';
import Modal from '~ds/Modal/Modal';
import ListGroupFlush from '~ui/List/ListGroupFlush';
import Button from '~ds/Button/Button';

const FRAGMENT = graphql`
  fragment ProjectHeaderThemeListLegacy_project on Project {
    themes {
      title
      url
      id
    }
    archived
  }
`;
export type Props = {|
  +project: ProjectHeaderThemeListLegacy_project$key,
  +breakingNumber: number,
|};

export const ThemesButton: StyledComponent<
  { archived: boolean },
  {},
  typeof ProjectHeader.Info.Theme,
> = styled(ProjectHeader.Info.Theme)`
  cursor: pointer;
  vertical-align: baseline;
  color: ${props => (props.archived ? `${colors['neutral-gray']['500']} !important` : null)};
`;
const Theme = styled(ProjectHeader.Info.Theme)`
  &:hover > p {
    color: ${props => props.color};
  }
`;
const ProjectHeaderThemeListLegacy = ({ project, breakingNumber }: Props): React.Node => {
  const { isOpen, onOpen, onClose } = useDisclosure(false);
  const intl = useIntl();
  const data = useFragment(FRAGMENT, project);
  const hoverColor = useSelector(state => state.default.parameters['color.link.hover']);

  if (!!data.themes && data.themes?.length > 0) {
    if (data.themes?.length <= breakingNumber) {
      return (
        <>
          {data.themes?.map(theme => (
            <Theme color={hoverColor} key={theme.id} href={theme.url} content={theme.title} />
          ))}
        </>
      );
    }
    return (
      <>
        <ThemesButton
          content={
            <>
              {data.themes[0]?.title}{' '}
              <FormattedMessage
                id="and-count-other-themes"
                values={{
                  count: data.themes.length - 1,
                }}
              />
            </>
          }
          onClick={onOpen}
          className="p-0 data-districts__modal-link"
          archived={data.archived}
        />
        <Modal
          show={isOpen}
          onClose={onClose}
          ariaLabel={intl.formatMessage({ id: 'data_theme_list' })}>
          <Modal.Header>
            <FormattedMessage
              id="count-themes"
              values={{
                count: data.themes?.length,
              }}
            />
          </Modal.Header>
          <Modal.Body>
            <ListGroupFlush>
              {data.themes?.map(theme => (
                <ListGroupItem>
                  <a key={theme.id} href={theme.url}>
                    {theme.title}
                  </a>
                </ListGroupItem>
              ))}
            </ListGroupFlush>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" variantSize="medium" onClick={onClose}>
              <FormattedMessage id="global.close" />
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  return null;
};

export default ProjectHeaderThemeListLegacy;
