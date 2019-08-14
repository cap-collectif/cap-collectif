<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Repository\ProjectRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Repository\ProjectTypeRepository;

class ProjectTypesResolver implements ResolverInterface
{
    private $projectTypeRepository;
    private $projectRepository;
    private $logger;

    public function __construct(
        ProjectTypeRepository $projectTypeRepository,
        ProjectRepository $projectRepository,
        LoggerInterface $logger
    ) {
        $this->logger = $logger;
        $this->projectTypeRepository = $projectTypeRepository;
        $this->projectRepository = $projectRepository;
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
