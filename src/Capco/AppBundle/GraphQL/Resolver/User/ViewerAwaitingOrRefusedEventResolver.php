<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\DBAL\Enum\EventReviewStatusType;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\EventRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class ViewerAwaitingOrRefusedEventResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(private EventRepository $eventRepository, private LoggerInterface $logger)
    {
    }

    public function __invoke($viewer, $user, ?Argument $args = null): Connection
    {
        if (!$args) {
            $args = new Argument(['first' => 0]);
        }
        $this->protectArguments($args);
        $viewer = $viewer instanceof User ? $viewer : null;

        $paginator = new Paginator(function (int $offset, int $limit) use ($viewer, $user) {
            try {
                $events = $this->eventRepository->getByUserAndReviewStatus(
                    $viewer,
                    $user,
                    [EventReviewStatusType::AWAITING, EventReviewStatusType::REFUSED],
                    $offset,
                    $limit
                );
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new UserError('Error during fetching arguments of ' . $viewer->getLastname());
            }

            return $events;
        });

        $totalCount = $this->eventRepository->countByUserAndReviewStatus($viewer, $user, [
            EventReviewStatusType::AWAITING,
            EventReviewStatusType::REFUSED,
        ]);

        return $paginator->auto($args, $totalCount);
    }
}
