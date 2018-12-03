<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Search\ProjectSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Project;

class ProjectsResolver implements ResolverInterface
{
    private $logger;
    private $projectSearch;

    public function __construct(ProjectSearch $projectSearch, LoggerInterface $logger)
    {
        $this->logger = $logger;
        $this->projectSearch = $projectSearch;
    }

    public function __invoke(Argument $args): Connection
    {
        $totalCount = 0;
        $term = null;
        $order = null;

        if ($args->offsetExists('term')) {
            $term = $args->offsetGet('term');
        }

        if ($args->offsetExists('order')) {
            $order = $args->offsetGet('order');
        }

        try {
            $paginator = new Paginator(function (int $offset, int $limit) use (
                $args,
                $term,
                &$totalCount,
                $order
            ) {
                $results = $this->projectSearch->searchProjects(
                    $offset,
                    $limit,
                    $order,
                    $term,
                    $this->getFilters($args)
                );
                $totalCount = $results['count'];

                return $results['projects'];
            });
            $connection = $paginator->auto($args, $totalCount);
            $connection->totalCount = $totalCount;

            return $connection;
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Could not find projects');
        }
    }

    public function resolveProjectLinks(Project $project): array
    {
        return isset($project->_links) ? $project->_links : [];
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
