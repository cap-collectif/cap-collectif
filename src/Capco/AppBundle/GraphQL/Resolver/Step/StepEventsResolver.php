<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;

class StepEventsResolver implements QueryInterface
{
    private ConnectionBuilder $builder;

    public function __construct(ConnectionBuilder $builder)
    {
        $this->builder = $builder;
    }

    public function __invoke(AbstractStep $step, Arg $input): Connection
    {
        $events = $step
            ->getEvents()
            ->filter(function ($event) {
                return $event->isEnabledOrApproved();
            })
            ->toArray()
        ;

        usort($events, function ($a, $b) {
            return $a->getStartAt() <=> $b->getStartAt();
        });

        $connection = $this->builder->connectionFromArray($events, $input);
        $connection->setTotalCount(\count($events));

        return $connection;
    }
}
