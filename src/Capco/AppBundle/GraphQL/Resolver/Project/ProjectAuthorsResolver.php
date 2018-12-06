<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\UserBundle\Repository\UserRepository;
use Capco\UserBundle\Entity\User;

class ProjectAuthorsResolver implements ResolverInterface
{
    private $userRepository;
    private $logger;
    private $projectRepository;

    public function __construct(
        UserRepository $userRepository,
        ProjectRepository $projectRepository,
        LoggerInterface $logger
    ) {
        $this->logger = $logger;
        $this->projectRepository = $projectRepository;
        $this->userRepository = $userRepository;
    }

    public function __invoke(Argument $args, ?User $user): array
    {
        $totalCount = 0;
        $orderBy = $args->offsetGet('orderBy');

        try {
            $authorsIds = $this->projectRepository->getAuthors($user, $orderBy);

            return $this->getHydratedResults($authorsIds);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Could not find authors');
        }
    }

    private function getHydratedResults(array $results): array
    {
        // We can't use findById because we would lost the correct order given by ES
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        return array_values(
            array_filter(
                array_map(function ($result) {
                    return $this->userRepository->findOneBy(['id' => $result['id']]);
                }, $results),
                function (?User $user) {
                    return null !== $user;
                }
            )
        );
    }
}
