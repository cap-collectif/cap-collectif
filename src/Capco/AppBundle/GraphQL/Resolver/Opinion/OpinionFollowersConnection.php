<?php
namespace Capco\AppBundle\GraphQL\Resolver\Opinion;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\GraphQL\Traits\ProjectOpinionSubscriptionGuard;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class OpinionFollowersConnection implements ResolverInterface
{
    use ProjectOpinionSubscriptionGuard;

    private $userRepository;
    private $logger;

    public function __construct(UserRepository $userRepository, LoggerInterface $logger)
    {
        $this->userRepository = $userRepository;
        $this->logger = $logger;
    }

    public function __invoke(Opinion $opinion, Arg $args): ?Connection
    {
        $paginator = new Paginator(function ($offset, $limit) use ($opinion, $args) {
            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];
            $orderBy = [$field => $direction];
            $criteria = ['opinion' => $opinion];

            // prevent useless queries.
            if (!$this->canBeFollowed($opinion)) {
                return null;
            }

            try {
                $followers = $this->userRepository->getByCriteriaOrdered(
                    $criteria,
                    $orderBy,
                    $limit,
                    $offset
                )
                    ->getIterator()
                    ->getArrayCopy();
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
                throw new \RuntimeException('Find following opinion by user failed');
            }

            return $followers;
        });

        $totalCount = $this->userRepository->countFollowerForOpinion($opinion);

        return $this->canBeFollowed($opinion) ? $paginator->auto($args, $totalCount) : null;
    }
}
