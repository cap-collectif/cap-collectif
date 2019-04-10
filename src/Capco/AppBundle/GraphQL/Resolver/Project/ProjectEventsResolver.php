<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Repository\EventRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;

class ProjectEventsResolver implements ResolverInterface
{
    private $logger;
    private $eventRepository;

    public function __construct(EventRepository $eventRepository, LoggerInterface $logger)
    {
        $this->logger = $logger;
        $this->eventRepository = $eventRepository;
    }

    public function __invoke(Project $project, Argument $args): Connection
    {
        try {
            $paginator = new Paginator(function (?int $offset, ?int $limit) use ($project) {
                if (0 === $offset && 0 === $limit) {
                    return [];
                }

                return $this->eventRepository
                    ->getByProject($project, $offset, $limit)
                    ->getIterator()
                    ->getArrayCopy();
            });

            $totalCount = $this->eventRepository->countByProject($project->getId());

            return $paginator->auto($args, $totalCount);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Could not find comments');
        }
    }
}
