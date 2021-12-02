<?php

namespace Capco\AppBundle\GraphQL\Resolver\UserInvite;

use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Entity\UserInviteEmailMessage;
use Capco\AppBundle\Enum\UserInviteStatus;
use Capco\AppBundle\Repository\UserInviteEmailMessageRepository;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserInviteStatusResolver implements ResolverInterface
{
    private UserRepository $userRepository;
    private UserInviteEmailMessageRepository $emailMessageRepository;

    public function __construct(
        UserRepository $userRepository,
        UserInviteEmailMessageRepository $emailMessageRepository
    ) {
        $this->userRepository = $userRepository;
        $this->emailMessageRepository = $emailMessageRepository;
    }

    public function __invoke(UserInvite $userInvite): string
    {
        if ($this->userRepository->findOneByEmail($userInvite->getEmail())) {
            return UserInviteStatus::ACCEPTED;
        }

        if ($userInvite->hasExpired()) {
            return UserInviteStatus::EXPIRED;
        }

        /** @var UserInviteEmailMessage $lastEmailMessage */
        if (
            ($lastEmailMessage = $this->emailMessageRepository->findOneBy(
                ['invitation' => $userInvite],
                ['createdAt' => 'DESC']
            )) &&
            UserInviteEmailMessage::SEND_FAILURE === $lastEmailMessage->getInternalStatus()
        ) {
            return UserInviteStatus::FAILED;
        }

        return UserInviteStatus::PENDING;
    }
}
