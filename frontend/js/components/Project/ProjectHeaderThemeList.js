// @flow
import * as React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FormattedMessage, useIntl } from 'react-intl';
import { ListGroupItem } from 'react-bootstrap';
import { useDisclosure } from '@liinkiing/react-hooks';
import type { StyledComponent } from 'styled-components';
import { Button, Modal } from '@cap-collectif/ui';
import ProjectHeader from '~ui/Project/ProjectHeader';
import colors from '~/styles/modules/colors';
import ListGroupFlush from '~ui/List/ListGroupFlush';

type Themes = $ReadOnlyArray<{|
  +title: string,
  +url: string,
  +id: string,
|}>;

export type Props = {|
  +isArchived?: boolean,
  +breakingNumber: number,
  +themes: Themes,
  +eventView?: boolean,
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
const ProjectHeaderThemeList = ({
  themes,
  breakingNumber,
  isArchived,
  eventView,
}: Props): React.Node => {
  const { isOpen, onOpen, onClose } = useDisclosure(false);
  const intl = useIntl();
  const hoverColor = useSelector(state => state.default.parameters['color.link.hover']);

  if (!!themes && themes?.length > 0) {
    if (themes?.length <= breakingNumber) {
      return (
        <>
          {themes?.map(theme => (
            <Theme
              color={hoverColor}
              key={theme.id}
              href={theme.url}
              content={theme.title}
              eventView={eventView}
            />
          ))}
        </>
      );
    }
    return (
      <>
        <ThemesButton
          content={
            <>
              {themes[0]?.title}{' '}
              <FormattedMessage
                id="and-count-other-themes"
                values={{
                  count: themes.length - 1,
                }}
              />
            </>
          }
          onClick={onOpen}
          className="p-0 data-districts__modal-link"
          archived={!!isArchived}
        />
        <Modal
          show={isOpen}
          onClose={onClose}
          ariaLabel={intl.formatMessage({ id: 'theme_list' })}
          baseId="theme-modal">
          <Modal.Header>
            <FormattedMessage
              id="count-themes"
              values={{
                count: themes?.length,
              }}
            />
          </Modal.Header>
          <Modal.Body>
            <ListGroupFlush>
              {themes?.map(theme => (
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

export default ProjectHeaderThemeList;
