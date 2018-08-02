<?php
namespace Capco\AppBundle\GraphQL\Resolver\Opinion;

use Capco\AppBundle\Entity\Opinion;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class OpinionFollowersResolver implements ResolverInterface
{
    private $userRepository;
    private $logger;

    public function __construct(UserRepository $userRepository, LoggerInterface $logger)
    {
        $this->userRepository = $userRepository;
        $this->logger = $logger;
    }

    public function __invoke(Opinion $opinion, Arg $args): Connection
    {
        $paginator = new Paginator(function (int $offset, int $limit) use ($opinion) {
            try {
                $users = $this->userRepository->findUsersFollowingAOpinion(
                    $opinion,
                    $offset,
                    $limit
                )
                    ->getIterator()
                    ->getArrayCopy();
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
                throw new \RuntimeException('Find following proposal by user failed');
            }

            return $users;
        });

        $totalCount = $this->userRepository->countFollowerForOpinion($opinion);

        return $paginator->auto($args, $totalCount);
    }
}
