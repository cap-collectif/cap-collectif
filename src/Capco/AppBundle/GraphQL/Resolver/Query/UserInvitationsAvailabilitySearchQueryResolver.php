<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class UserInvitationsAvailabilitySearchQueryResolver implements QueryInterface
{
    public function __construct(private readonly ConnectionBuilder $builder, private readonly UserRepository $userRepository, private readonly UserInviteRepository $userInviteRepository)
    {
    }

    public function __invoke(Argument $args): ConnectionInterface
    {
        $emails = $args->offsetGet('emails');
        $existingUsers = $this->userRepository->findBy(['email' => $emails]);
        $nonAvailableUsersEmails = array_map(static fn (User $user) => $user->getEmail(), $existingUsers);
        $existingInvitations = $this->userInviteRepository->findBy(['email' => $emails]);
        $nonAvailableInvitationEmails = array_map(
            static fn (UserInvite $userInvite) => $userInvite->getEmail(),
            $existingInvitations
        );

        $payload = [];

        foreach ($emails as $email) {
            if (\in_array($email, $nonAvailableUsersEmails, true)) {
                $payload[] = [
                    'email' => $email,
                    'availableForUser' => false,
                    'availableForInvitation' => false,
                ];

                continue;
            }

            foreach ($existingInvitations as $existingInvitation) {
                $isExpired = $existingInvitation->hasExpired();
                if ($existingInvitation->getEmail() === $email) {
                    $payload[] = [
                        'email' => $email,
                        'availableForUser' => true,
                        'availableForInvitation' => $isExpired,
                    ];
                }
            }
        }

        $connection = $this->builder->connectionFromArray($payload);
        $connection->setTotalCount(\count($payload));

        return $connection;
    }
}
