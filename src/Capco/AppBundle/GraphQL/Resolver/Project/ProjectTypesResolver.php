<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\ProjectTypeRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Psr\Log\LoggerInterface;

class ProjectTypesResolver implements QueryInterface
{
    public function __construct(private readonly ProjectTypeRepository $projectTypeRepository, private readonly ProjectRepository $projectRepository, private readonly LoggerInterface $logger)
    {
    }

    public function __invoke(Argument $args, $viewer = null): array
    {
        $onlyUsedByProjects = $args->offsetGet('onlyUsedByProjects');

        try {
            if ($onlyUsedByProjects) {
                return $this->projectRepository->getDistinctProjectTypesUsedByProjects($viewer);
            }

            return $this->projectTypeRepository->findAll();
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Could not find project type');
        }
    }
}
