<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Search\ProjectSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Project;
use Capco\UserBundle\Entity\User;

class ProjectsResolver implements ResolverInterface
{
    private $logger;
    private $projectSearch;

    public function __construct(ProjectSearch $projectSearch, LoggerInterface $logger)
    {
        $this->logger = $logger;
        $this->projectSearch = $projectSearch;
    }

    public function __invoke(Argument $args, ?User $user = null): Connection
    {
        $totalCount = 0;

        try {
            $paginator = new Paginator(function (int $offset, int $limit) use (
                $args,
                $user,
                &$totalCount
            ) {

                $term = $args->offsetExists('term') ? $args->offsetGet('term') : null;

                $limit = $args->offsetExists('count') ?$args->offsetGet('count') : 50;

                $order = $args->offsetExists('orderBy') ? $args->offsetGet('orderBy') : null;

                $results = $this->projectSearch->searchProjects(
                    $offset,
                    $limit,
                    $order,
                    $term,
                    $this->getFilters($args)
                );
                $result = [];
                /** @var Project $project */
                foreach ($results['projects'] as $project) {
                    if($project instanceof Project && $project->canDisplay($user)) {
                        $result[] = $project;
                    }
                }
                $totalCount = count($result);
                return $result;
            });
            $connection = $paginator->auto($args, $totalCount);
            $connection->totalCount = $totalCount;

            return $connection;
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Could not find projects');
        }
    }

    private function getFilters(Argument $args): array
    {
        $filters = [];
        if ($args->offsetExists('status') && '' !== $args['status']) {
            $filters['projectStatus'] = $args->offsetGet('status');
        }
        if ($args->offsetExists('theme') && '' !== $args['theme']) {
            $filters['themes.id'] = $args->offsetGet('theme');
        }
        if ($args->offsetExists('type') && '' !== $args['type']) {
            $filters['projectType.id'] = $args->offsetGet('type');
        }
        if ($args->offsetExists('author') && '' !== $args['author']) {
            $filters['author.id'] = $args->offsetGet('author');
        }

        return $filters;
    }
}
