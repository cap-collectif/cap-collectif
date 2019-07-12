<?php

namespace Capco\AppBundle\Enum;

final class CommentPublicationStatus
{
    public const UNPUBLISHED = 'UNPUBLISHED';
    public const PUBLISHED = 'PUBLISHED';
    public const TRASHED = 'TRASHED';
    public const TRASHED_NOT_VISIBLE = 'TRASHED_NOT_VISIBLE';
}
