<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\Repository\EventRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;

class StepEventsResolver implements QueryInterface
{
    public function __construct(private readonly ConnectionBuilder $builder, private readonly EventRepository $repository)
    {
    }

    public function __invoke(AbstractStep $step, Arg $input): Connection
    {
        $isFuture = $input->offsetGet('isFuture');
        $options = [];

        if (null !== $isFuture) {
            $options['isFuture'] = $isFuture;
        }

        $events = $this->repository->getByStep($step, $options);

        $events = array_filter($events, function (Event $event) {
            return $event->isEnabledOrApproved();
        });

        if ($isFuture) {
            usort($events, function ($a, $b) {
                return $a->getStartAt() <=> $b->getStartAt();
            });
        } else {
            usort($events, function ($a, $b) {
                return $b->getStartAt() <=> $a->getStartAt();
            });
        }

        $connection = $this->builder->connectionFromArray($events, $input);
        $connection->setTotalCount(\count($events));

        return $connection;
    }
}
