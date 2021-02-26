// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import moment from 'moment';
import { FormattedMessage, useIntl } from 'react-intl';
import type { ProjectAdminParticipant_participant } from '~relay/ProjectAdminParticipant_participant.graphql';
import {
  Container,
  UsernameContainer,
  NameContainer,
  ParticipantInfo,
} from './ProjectAdminParticipant.style';
import UserAvatar from '~/components/User/UserAvatar';
import InlineList from '~ui/List/InlineList';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';
import { translateContent } from '~/utils/ContentTranslator';
import { useProjectAdminParticipantsContext } from '~/components/Admin/Project/ProjectAdminParticipantTab/ProjectAdminParticipant.context';
import type { GlobalState } from '~/types';

type Props = {|
  participant: ProjectAdminParticipant_participant,
  rowId: string,
  selected: boolean,
  hasFeatureEmail: boolean,
|};

const ProjectAdminParticipant = ({ participant, selected, hasFeatureEmail }: Props) => {
  const intl = useIntl();
  const { dispatch } = useProjectAdminParticipantsContext();

  const {
    id,
    username,
    adminUrl,
    firstname,
    lastname,
    lastLogin,
    email,
    vip,
    votes,
    contributions,
    userType,
    isEmailConfirmed,
  } = participant;

  const hasCompleteName = !!firstname && !!lastname;
  const hasAccountDeleted = username === 'deleted-user';

  return (
    <Container rowId={id} selected={selected} isSelectable={hasFeatureEmail}>
      <ParticipantInfo>
        <UsernameContainer>
          <a href={adminUrl}>{translateContent(username)}</a>

          {vip && !hasAccountDeleted && (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="tooltip-vip">
                  {intl.formatMessage({ id: 'status.vip.account' })}
                </Tooltip>
              }>
              <Icon name={ICON_NAME.vip} size={14} />
            </OverlayTrigger>
          )}

          {isEmailConfirmed && !vip && !hasAccountDeleted && (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="tooltip-verified">
                  {intl.formatMessage({ id: 'status.verified.account' })}
                </Tooltip>
              }>
              <Icon name={ICON_NAME.verified} size={14} />
            </OverlayTrigger>
          )}
        </UsernameContainer>

        {(lastLogin || hasCompleteName) && (
          <NameContainer>
            {firstname && lastname && <span>{`${firstname} ${lastname}`}</span>}
            {hasCompleteName && lastLogin && <span className="separator">•</span>}
            {lastLogin && (
              <FormattedMessage
                id="active.on.date"
                values={{ date: moment(lastLogin).format('ll') }}
              />
            )}
          </NameContainer>
        )}

        <InlineList separator=" ">
          {!hasAccountDeleted && userType && (
            <li>
              <button
                type="button"
                onClick={() => dispatch({ type: 'CHANGE_TYPE_FILTER', payload: userType.id })}>
                <Icon name={ICON_NAME.singleManFilled} size={12} color={colors.darkGray} />
                <span>{userType.name}</span>
              </button>
            </li>
          )}

          {email && (
            <li>
              <Icon name={ICON_NAME.paperPlane} size={12} color={colors.darkGray} />
              <span>{email}</span>
            </li>
          )}

          <li>
            <Icon name={ICON_NAME.like} size={12} color={colors.darkGray} />
            <FormattedMessage id="global.votes" values={{ num: votes.totalCount }} />
          </li>

          <li>
            <Icon name={ICON_NAME.messageBubbleFilled} size={12} color={colors.darkGray} />
            <FormattedMessage
              id="synthesis.common.elements.nb"
              values={{ num: contributions.totalCount }}
            />
          </li>
        </InlineList>
      </ParticipantInfo>

      <UserAvatar user={participant} size={42} />
    </Container>
  );
};

const ProjectAdminParticipantRelay = createFragmentContainer(ProjectAdminParticipant, {
  participant: graphql`
    fragment ProjectAdminParticipant_participant on User
      @argumentDefinitions(contribuableId: { type: "ID" }) {
      id
      username
      firstname
      lastname
      adminUrl
      lastLogin
      email
      vip
      isEmailConfirmed
      userType {
        id
        name
      }
      votes(contribuableId: $contribuableId) {
        totalCount
      }
      contributions(contribuableId: $contribuableId, includeTrashed: true) {
        totalCount
      }
      ...UserAvatar_user
    }
  `,
});

const mapStateToProps = (state: GlobalState) => ({
  hasFeatureEmail: state.default.features.unstable__emailing || false,
});

const ProjectAdminParticipantConnected = connect<any, any, _, _, _, _>(mapStateToProps)(
  ProjectAdminParticipantRelay,
);

export default ProjectAdminParticipantConnected;
