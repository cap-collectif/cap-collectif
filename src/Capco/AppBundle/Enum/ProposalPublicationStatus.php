<?php

namespace Capco\AppBundle\Enum;

final class ProposalPublicationStatus
{
    public const PUBLISHED = 'PUBLISHED';
    public const TRASHED = 'TRASHED';
    public const TRASHED_NOT_VISIBLE = 'TRASHED_NOT_VISIBLE';
    public const DELETED = 'DELETED';
    public const DRAFT = 'DRAFT';
    public const UNPUBLISHED = 'UNPUBLISHED';
}
