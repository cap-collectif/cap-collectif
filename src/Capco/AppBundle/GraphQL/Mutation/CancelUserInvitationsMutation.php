<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\UserInvite;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class CancelUserInvitationsMutation implements MutationInterface
{
    private EntityManagerInterface $em;

    public function __construct(
        EntityManagerInterface $em
    )
    {
        $this->em = $em;
    }

    public function __invoke(Argument $args): array
    {
        $invitationsIds = $args->offsetGet('invitationsIds');
        $decodedInvitationsIds = array_map(fn(string $globalId) => GlobalId::fromGlobalId($globalId)['id'], $invitationsIds);

        $entity = UserInvite::class;
        $this->em
            ->createQuery(
                <<<DQL
DELETE ${entity} ui WHERE ui.id IN (:ids)
DQL
            )
            ->execute([
                'ids' => $decodedInvitationsIds,
            ]);

        return ['cancelledInvitationsIds' => $invitationsIds];
    }
}
