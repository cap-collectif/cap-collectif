<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ProjectRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Psr\Log\LoggerInterface;

class QueryViewerAssignedProjectsToAnalyseQueryResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(private readonly LoggerInterface $logger, private readonly ProjectRepository $projectRepository)
    {
    }

    public function __invoke(Argument $args, $viewer): array
    {
        $this->preventNullableViewer($viewer);

        return $this->projectRepository->getAssignedProjects($viewer);
    }
}
