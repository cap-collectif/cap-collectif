<?php
namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class ProjectAllowedViewersResolver implements ResolverInterface
{
    private $logger;
    private $projectRepository;

    public function __construct(ProjectRepository $repository, LoggerInterface $logger)
    {
        $this->logger = $logger;
        $this->projectRepository = $repository;
    }

    public function __invoke(Project $project, Argument $args, User $viewer): Connection
    {
        try {
            $paginator = new Paginator(function (int $offset, int $limit) use (
                $project,
                $args,
                $viewer
            ) {
                [$field, $direction] = [
                    $args->offsetGet('orderBy')['field'],
                    $args->offsetGet('orderBy')['direction'],
                ];

                return $this->projectRepository->getViewersAllowed(
                    $project,
                    $viewer,
                    $offset,
                    $limit,
                    $field,
                    $direction
                )
                    ->getIterator()
                    ->getArrayCopy();
            });

            $totalCount = $this->projectRepository->countAllViewersAllowed($project);

            return $paginator->auto($args, $totalCount);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
            throw new \RuntimeException('Could not find proposals for selection step');
        }
    }
}
