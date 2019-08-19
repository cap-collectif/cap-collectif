<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Repository\ProjectTypeRepository;

class ProjectTypesResolver implements ResolverInterface
{
    private $projectTypeRepository;
    private $logger;

    public function __construct(
        ProjectTypeRepository $projectTypeRepository,
        LoggerInterface $logger
    ) {
        $this->logger = $logger;
        $this->projectTypeRepository = $projectTypeRepository;
    }

    public function __invoke(Argument $args, ?User $user): array
    {
        try {
            return $this->projectTypeRepository->findAll();
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Could not find project type');
        }
    }
}
