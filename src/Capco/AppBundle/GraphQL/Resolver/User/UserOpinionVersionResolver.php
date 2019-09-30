<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserOpinionVersionResolver implements ResolverInterface
{
    private $logger;
    private $opinionVersionRepository;

    public function __construct(
        OpinionVersionRepository $opinionVersionRepository,
        LoggerInterface $logger
    ) {
        $this->opinionVersionRepository = $opinionVersionRepository;
        $this->logger = $logger;
    }

    public function __invoke(?User $viewer, User $user, ?Argument $args = null): Connection
    {
        if (!$args) {
            $args = new Argument([
                'first' => 0
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
