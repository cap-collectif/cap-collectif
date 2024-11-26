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

    private readonly ProjectRepository $projectRepository;
    private readonly LoggerInterface $logger;

    public function __construct(LoggerInterface $logger, ProjectRepository $projectRepository)
    {
        $this->logger = $logger;
        $this->projectRepository = $projectRepository;
    }

    public function __invoke(Argument $args, $viewer): array
    {
        $this->preventNullableViewer($viewer);

        return $this->projectRepository->getAssignedProjects($viewer);
    }
}
