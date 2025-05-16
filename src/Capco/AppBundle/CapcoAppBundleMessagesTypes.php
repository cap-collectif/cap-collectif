<?php

namespace Capco\AppBundle;

final class CapcoAppBundleMessagesTypes
{
    public const DEBATE_ARTICLE_CRAWLER = 'debate_article.crawler';

    public const USER_INVITE_INVITATION = 'user_invite.invitation';
    public const USER_INVITE_INVITATION_BY_ORGANIZATION = 'user_invite.invitation_by_organization';
    public const USER_INVITE_CHECK = 'user_invite.check';
    public const USER_EMAIL_REMINDER = 'user.email.reminder';

    public const USER_STEP_REMINDER = 'user.step.reminder';
    public const USER_ARCHIVE_REQUEST = 'user_archive.request';

    public const COMMENT_CREATE = 'comment.create';
    public const COMMENT_DELETE = 'comment.delete';
    public const COMMENT_UPDATE = 'comment.update';
    public const COMMENT_CONFIRM_ANONYMOUS_EMAIL = 'comment.confirm_anonymous_email';

    public const PROPOSAL_CREATE = 'proposal.create';
    public const PROPOSAL_DELETE = 'proposal.delete';
    public const PROPOSAL_UPDATE = 'proposal.update';
    public const PROPOSAL_UPDATE_STATUS = 'proposal.update.status';
    public const PROPOSAL_ASSIGNATION = 'proposal.assignation';
    public const PROPOSAL_REVOKE = 'proposal.revoke';
    public const PROPOSAL_ANALYSE = 'proposal.analyse';
    public const PROPOSAL_REVISION = 'proposal.revision';
    public const PROPOSAL_REVISION_REVISE = 'proposal.revision.revise';

    public const ARGUMENT_CREATE = 'argument.create';
    public const ARGUMENT_TRASH = 'argument.trash';
    public const ARGUMENT_DELETE = 'argument.delete';
    public const ARGUMENT_UPDATE = 'argument.update';

    public const OPINION_CREATE = 'opinion.create';
    public const OPINION_TRASH = 'opinion.trash';
    public const OPINION_DELETE = 'opinion.delete';
    public const OPINION_UPDATE = 'opinion.update';

    public const REPORT = 'report';

    public const EMAILING_CAMPAIGN = 'emailing.campaign';

    public const ELASTICSEARCH_INDEXATION = 'elasticsearch.indexation';

    public const CUSTOM_DOMAIN_CREATE = 'custom.domain.create';
    public const SENDINBLUE = 'sendinblue';

    public const PROJECT_DISTRICT_NOTIFICATION = 'project_district.notification';

    public const ORGANIZATION_MEMBER_INVITATION = 'organization_member.invitation';

    public const MEDIATOR_NOTIFICATION_PUB_PARTICIPANT = 'mediator_participate_email';

    public const PROPOSAL_COLLECT_EMAIL_PUBLISHED = 'proposal_collect_email_published';
}
