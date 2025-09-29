<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\OpinionRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class UserOpinionsResolver implements QueryInterface
{
    public function __construct(
        private readonly OpinionRepository $opinionRepository,
        private readonly LoggerInterface $logger
    ) {
    }

    public function __invoke(User $user, ?User $viewer, ?Argument $args = null): Connection
    {
        if (!$args) {
            $args = new Argument([
                'first' => 0,
            ]);
        }

        $paginator = new Paginator(function (int $offset, int $limit) use ($user, $viewer) {
            try {
                $arguments = $this->opinionRepository->getByUser($user, $viewer);
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new UserError('Error during fetching arguments of ' . $user->getLastname());
            }

            return $arguments;
        });

        $totalCount = $this->getCountPublicPublished($user, false, $viewer);

        return $paginator->auto($args, $totalCount);
    }

    public function getCountPublicPublished(
        User $user,
        bool $includeTrashed = false,
        ?User $viewer = null
    ): int {
        return $this->opinionRepository->countByUser($user, $includeTrashed, $viewer);
    }
}
