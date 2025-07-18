<?php

namespace Capco\AppBundle\GraphQL\Resolver\Mediator;

use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\GraphQL\ConnectionBuilderInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class MediatorVotesResolver implements QueryInterface
{
    public function __construct(private readonly ConnectionBuilderInterface $connectionBuilder)
    {
    }

    public function __invoke(Mediator $mediator, Argument $args): ConnectionInterface
    {
        $votes = $mediator->getVotes();
        $connection = $this->connectionBuilder->connectionFromArray($votes->toArray(), $args);
        $connection->setTotalCount($votes->count());

        return $connection;
    }
}
