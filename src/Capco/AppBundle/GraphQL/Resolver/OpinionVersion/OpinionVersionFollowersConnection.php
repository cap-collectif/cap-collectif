<?php

namespace Capco\AppBundle\GraphQL\Resolver\OpinionVersion;

use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\GraphQL\Traits\ProjectOpinionSubscriptionGuard;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class OpinionVersionFollowersConnection implements ResolverInterface
{
    use ProjectOpinionSubscriptionGuard;

    private $userRepository;
    private $logger;

    public function __construct(UserRepository $userRepository, LoggerInterface $logger)
    {
        $this->userRepository = $userRepository;
        $this->logger = $logger;
    }

    public function __invoke(OpinionVersion $opinion, Arg $args): ?ConnectionInterface
    {
        $paginator = new Paginator(function ($offset, $limit) use ($opinion, $args) {
            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];
            $orderBy = [$field => $direction];
            $criteria = ['opinionVersion' => $opinion];

            // prevent useless queries.
            if (!$this->versionCanBeFollowed($opinion)) {
                return null;
            }

            try {
                $followers = $this->userRepository
                    ->getByCriteriaOrdered($criteria, $orderBy, $limit, $offset)
                    ->getIterator()
                    ->getArrayCopy();
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException('Find following opinion version by user failed');
            }

            return $followers;
        });

        $totalCount = $this->userRepository->countFollowerForOpinionVersion($opinion);

        return $this->versionCanBeFollowed($opinion) ? $paginator->auto($args, $totalCount) : null;
    }
}
