<?php

namespace Capco\AppBundle\Exception;

class UserInviteMessageQueuedException extends \Exception
{
    public const MESSAGE_DEFAULT_QUEUED = 'The current user invitation message is still queued by the provider.';
}
