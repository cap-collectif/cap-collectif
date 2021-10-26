<?php

namespace Capco\AppBundle\GraphQL\Resolver\UserInvite;

use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Enum\UserInviteStatus;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserInviteStatusResolver implements ResolverInterface
{
    private UserRepository $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function __invoke(UserInvite $userInvite): string
    {
        if ($this->userRepository->findOneByEmail($userInvite->getEmail())) {
            return UserInviteStatus::ACCEPTED;
        }

        if ($userInvite->hasExpired()) {
            return UserInviteStatus::EXPIRED;
        }

        if (UserInvite::SEND_FAILURE === $userInvite->getInternalStatus()) {
            return UserInviteStatus::FAILED;
        }

        return UserInviteStatus::PENDING;
    }
}
