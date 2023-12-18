<?php

namespace Capco\AppBundle\GraphQL\Resolver\Mediator;

use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class MediatorVotesResolver implements ResolverInterface
{
    private ConnectionBuilder $connectionBuilder;

    public function __construct(
        ConnectionBuilder $connectionBuilder
    ) {
        $this->connectionBuilder = $connectionBuilder;
    }

    public function __invoke(Mediator $mediator, Argument $args): ConnectionInterface
    {
        $votes = $mediator->getVotes();
        $connection = $this->connectionBuilder->connectionFromArray($votes->toArray(), $args);
        $connection->setTotalCount($votes->count());

        return $connection;
    }
}
