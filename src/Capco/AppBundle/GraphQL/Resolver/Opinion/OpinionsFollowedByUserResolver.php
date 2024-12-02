<?php

namespace Capco\AppBundle\GraphQL\Resolver\Opinion;

use Capco\AppBundle\Repository\OpinionRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class OpinionsFollowedByUserResolver implements QueryInterface
{
    public function __construct(private readonly OpinionRepository $opinionRepository, private readonly LoggerInterface $logger)
    {
    }

    public function __invoke(User $user, Arg $args): Connection
    {
        $paginator = new Paginator(function (int $offset, int $limit) use ($user) {
            try {
                $opinions = $this->opinionRepository
                    ->findFollowingOpinionByUser($user, $offset, $limit)
                    ->getIterator()
                    ->getArrayCopy()
                ;
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException('Find following opinion by user failed');
            }

            return $opinions;
        });

        $totalCount = $this->opinionRepository->countFollowingOpinionByUser($user);

        return $paginator->auto($args, $totalCount);
    }
}
