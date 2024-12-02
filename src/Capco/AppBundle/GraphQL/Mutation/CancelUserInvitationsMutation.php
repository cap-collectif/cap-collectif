<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\UserInviteRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class CancelUserInvitationsMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private readonly EntityManagerInterface $em, private readonly UserInviteRepository $repository)
    {
    }

    public function __invoke(Argument $args): array
    {
        $this->formatInput($args);
        $invitationsEmails = $args->offsetGet('invitationsEmails');
        $invitations = $this->repository->findByEmails($invitationsEmails);
        $invitationsIds = array_map(
            fn (UserInvite $invitation) => $invitation->getId(),
            $invitations
        );

        $entity = UserInvite::class;
        $this->em
            ->createQuery(
                <<<DQL
                    DELETE {$entity} ui WHERE ui.id IN (:ids)
                    DQL
            )
            ->execute([
                'ids' => $invitationsIds,
            ])
        ;

        $encodedInvitationsIds = array_map(
            fn (string $invitationId) => GlobalId::toGlobalId('UserInvite', $invitationId),
            $invitationsIds
        );

        return ['cancelledInvitationsIds' => $encodedInvitationsIds];
    }
}
