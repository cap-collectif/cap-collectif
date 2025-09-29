<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class UserOpinionVersionResolver implements QueryInterface
{
    public function __construct(
        private readonly OpinionVersionRepository $opinionVersionRepository,
        private readonly LoggerInterface $logger
    ) {
    }

    public function __invoke(?User $viewer, User $user, ?Argument $args = null): Connection
    {
        if (!$args) {
            $args = new Argument([
                'first' => 0,
            ]);
        }

        $paginator = new Paginator(function (int $offset, int $limit) use ($user, $viewer) {
            try {
                $arguments = $this->opinionVersionRepository->getByUser($user, $viewer);
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new UserError('Error during fetching arguments of ' . $user->getLastname());
            }

            return $arguments;
        });

        $totalCount = $this->opinionVersionRepository->countByUser($user, $viewer);

        return $paginator->auto($args, $totalCount);
    }
}
