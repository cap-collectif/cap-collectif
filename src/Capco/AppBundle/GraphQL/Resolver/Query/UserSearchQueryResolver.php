<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Search\UserSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class UserSearchQueryResolver implements QueryInterface
{
    public function __construct(
        private readonly UserSearch $userSearch,
        private readonly ParticipantRepository $participantRepository
    ) {
    }

    public function __invoke(Argument $args): array
    {
        $onlyUsers = true;

        // Search in Users via Elasticsearch
        $users = $this->userSearch->searchAllUsers(
            $args['displayName'],
            $args['notInIds'],
            $args['authorsOfEventOnly'],
            $onlyUsers,
            $args['isMediatorCompliant']
        );

        // Search in Participants via repository
        $participants = $this->searchParticipants($args);

        // Merge results
        return array_merge($users, $participants);
    }

    /**
     * @return array<Participant>
     */
    private function searchParticipants(Argument $args): array
    {
        $qb = $this->participantRepository->createQueryBuilder('p');

        // Filter by displayName (search in username, email, firstname, lastname)
        if ($args['displayName']) {
            $qb->andWhere(
                $qb->expr()->orX(
                    $qb->expr()->like('p.username', ':term'),
                    $qb->expr()->like('p.email', ':term'),
                    $qb->expr()->like('p.firstname', ':term'),
                    $qb->expr()->like('p.lastname', ':term')
                )
            )->setParameter('term', '%' . $args['displayName'] . '%');
        }

        // Filter by notInIds
        if ($args['notInIds'] && \count($args['notInIds']) > 0) {
            $qb->andWhere($qb->expr()->notIn('p.id', ':notInIds'))
                ->setParameter('notInIds', $args['notInIds'])
            ;
        }

        // Note: authorsOfEventOnly and isMediatorCompliant filters are user-specific
        // and don't apply to participants without a user account
        // If a participant has a user, they will be found through the user search

        return $qb->getQuery()->getResult();
    }
}
