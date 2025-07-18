<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\ConnectionBuilderInterface;
use Capco\AppBundle\Repository\EventRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;

class StepEventsResolver implements QueryInterface
{
    public function __construct(private readonly ConnectionBuilderInterface $builder, private readonly EventRepository $repository)
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

        $events = array_filter($events, fn (Event $event) => $event->isEnabledOrApproved());

        if ($isFuture) {
            usort($events, fn ($a, $b) => $a->getStartAt() <=> $b->getStartAt());
        } else {
            usort($events, fn ($a, $b) => $b->getStartAt() <=> $a->getStartAt());
        }

        $connection = $this->builder->connectionFromArray($events, $input);
        $connection->setTotalCount(\count($events));

        return $connection;
    }
}
