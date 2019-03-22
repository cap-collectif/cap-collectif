<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Search\ProjectSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProjectsResolver implements ResolverInterface
{
    use ResolverTrait;

    private $logger;
    private $projectSearch;

    public function __construct(ProjectSearch $projectSearch, LoggerInterface $logger)
    {
        $this->logger = $logger;
        $this->projectSearch = $projectSearch;
    }

    public function __invoke(Argument $args, ?User $viewer = null): Connection
    {
        $this->protectArguments($args);
        $totalCount = 0;

        try {
            $paginator = new Paginator(function (int $offset, int $limit) use (
                $args,
                $viewer,
                &$totalCount
            ) {
                $term = $args->offsetExists('term') ? $args->offsetGet('term') : null;
                $order = $args->offsetExists('orderBy') ? $args->offsetGet('orderBy') : null;
                $onlyPublic = $args->offsetExists('onlyPublic')
                    ? $args->offsetGet('onlyPublic')
                    : null;

                $results = $this->projectSearch->searchProjects(
                    0,
                    1000,
                    $order,
                    $term,
                    $this->getFilters($args)
                );
                $allResults = [];
                // @var Project $project
                if (!$onlyPublic) {
                    foreach ($results['projects'] as $project) {
                        if ($project instanceof Project && $project->canDisplay($viewer)) {
                            $allResults[] = $project;
                        }
                    }
                } else {
                    foreach ($results['projects'] as $project) {
                        if ($project instanceof Project && $project->isPublic()) {
                            $allResults[] = $project;
                        }
                    }
                }
                $totalCount = \count($allResults);

                return \array_slice($allResults, $offset, $limit);
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
            $filters['author.id'] = GlobalId::fromGlobalId($args->offsetGet('author'))['id'];
        }
        if ($args->offsetExists('withEventOnly') && false !== $args['withEventOnly']) {
            $filters['withEventOnly'] = $args['withEventOnly'];
        }

        return $filters;
    }
}
