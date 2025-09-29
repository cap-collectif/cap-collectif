<?php

namespace Capco\AppBundle\GraphQL\Resolver\Opinion;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\GraphQL\Traits\ProjectOpinionSubscriptionGuard;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class OpinionFollowersResolver implements QueryInterface
{
    use ProjectOpinionSubscriptionGuard;

    public function __construct(
        private UserRepository $userRepository,
        private LoggerInterface $logger
    ) {
    }

    public function __invoke(Opinion $opinion, Arg $args): Connection
    {
        $paginator = new Paginator(function (int $offset, int $limit) use ($opinion) {
            if (!$this->canBeFollowed($opinion)) {
                return [];
            }

            try {
                $users = $this->userRepository
                    ->findUsersFollowingAnOpinion($opinion, $offset, $limit)
                    ->getIterator()
                    ->getArrayCopy()
                ;
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException('Find following proposal by user failed');
            }

            return $users;
        });

        $totalCount = $this->canBeFollowed($opinion)
            ? $this->userRepository->countFollowerForOpinion($opinion)
            : 0;

        return $paginator->auto($args, $totalCount);
    }
}
