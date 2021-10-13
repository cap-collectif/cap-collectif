<?php

namespace Capco\AppBundle\GraphQL\Resolver\UserInvite;

use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Enum\UserInviteStatus;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserInviteStatusResolver implements ResolverInterface
{
    public function __invoke(UserInvite $userInvite): string
    {
        if ($userInvite->hasExpired()) {
            return UserInviteStatus::EXPIRED;
        }

        if (UserInvite::SEND_FAILURE === $userInvite->getInternalStatus()) {
            return UserInviteStatus::FAILED;
        }

        return UserInviteStatus::PENDING;
    }
}
