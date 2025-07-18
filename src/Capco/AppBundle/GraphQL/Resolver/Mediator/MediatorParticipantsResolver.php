<?php

namespace Capco\AppBundle\GraphQL\Resolver\Mediator;

use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\Enum\ParticipantOrderField;
use Capco\AppBundle\GraphQL\ConnectionBuilderInterface;
use Capco\AppBundle\Repository\ParticipantRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class MediatorParticipantsResolver implements QueryInterface
{
    public function __construct(private readonly ConnectionBuilderInterface $connectionBuilder, private readonly ParticipantRepository $participantRepository)
    {
    }

    public function __invoke(Mediator $mediator, Argument $args): ConnectionInterface
    {
        $fullname = $args->offsetGet('fullname');
        $orderBy = $args->offsetGet('orderBy');

        $orderByField = $orderBy['field'] ? ParticipantOrderField::DATABASE_FIELD[$orderBy['field']] : ParticipantOrderField::DATABASE_FIELD[ParticipantOrderField::CREATED_AT];
        $orderByDirection = $orderBy['direction'] ?? 'DESC';

        $participants = $this->participantRepository->findByMediator($mediator, $fullname, $orderByField, $orderByDirection);
        $totalCount = $this->participantRepository->countByMediator($mediator, $fullname);

        $connection = $this->connectionBuilder->connectionFromArray($participants, $args);
        $connection->setTotalCount($totalCount);

        return $connection;
    }
}
