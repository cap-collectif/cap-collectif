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
            $authorsIds = array_map(function ($item) {
                return $item['id'];
            }, $this->projectRepository->getAuthorsId($user, $orderBy));

            return $this->getHydratedResults($authorsIds);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Could not find authors');
        }
    }

    private function getHydratedResults(array $ids): array
    {
        // We can't use findById because we would lost the correct order given by ES
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750

        $users = $this->userRepository->hydrateFromIds($ids);
        // We have to restore the correct order of ids, because Doctrine has lost it, see:
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        usort($users, function ($a, $b) use ($ids) {
            return array_search($a->getId(), $ids, false) > array_search($b->getId(), $ids, false);
        });

        return $users;
    }
}
