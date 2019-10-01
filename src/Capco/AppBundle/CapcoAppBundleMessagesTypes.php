<?php

namespace Capco\AppBundle;

final class CapcoAppBundleMessagesTypes
{
    public const USER_ARCHIVE_REQUEST = 'user_archive.request';

    public const COMMENT_CREATE = 'comment.create';
    public const COMMENT_DELETE = 'comment.delete';
    public const COMMENT_UPDATE = 'comment.update';

    public const PROPOSAL_CREATE = 'proposal.create';
    public const PROPOSAL_DELETE = 'proposal.delete';
    public const PROPOSAL_UPDATE = 'proposal.update';
    public const PROPOSAL_UPDATE_STATUS = 'proposal.update.status';

    public const ARGUMENT_CREATE = 'argument.create';
    public const ARGUMENT_TRASH = 'argument.trash';
    public const ARGUMENT_DELETE = 'argument.delete';
    public const ARGUMENT_UPDATE = 'argument.update';

    public const OPINION_CREATE = 'opinion.create';
    public const OPINION_TRASH = 'opinion.trash';
    public const OPINION_DELETE = 'opinion.delete';
    public const OPINION_UPDATE = 'opinion.update';

    public const ELASTICSEARCH_INDEXATION = 'elasticsearch.indexation';
}
