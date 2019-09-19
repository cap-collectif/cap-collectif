<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\ArgumentRepository;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserArgumentsResolver implements ResolverInterface
{
    private $argumentRepository;
    private $logger;

    public function __construct(ArgumentRepository $argumentRepository, LoggerInterface $logger)
    {
        $this->argumentRepository = $argumentRepository;
        $this->logger = $logger;
    }

    public function __invoke(?User $viewer, User $user, ?Argument $args = null): Connection
    {
        if (!$args) {
            $args = new Argument(['first' => 0]);
        }
        $paginator = new Paginator(function (int $offset, int $limit) use ($user, $viewer) {
            try {
                $arguments = $this->argumentRepository->getByUser($user, $viewer);
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new UserError('Error during fetching arguments of ' . $user->getLastname());
            }

            return $arguments;
        });

        $totalCount = $this->argumentRepository->countByUser($user, $viewer);

        return $paginator->auto($args, $totalCount);
    }
}
