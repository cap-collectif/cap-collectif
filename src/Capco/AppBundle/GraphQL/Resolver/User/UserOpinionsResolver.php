<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\OpinionRepository;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserOpinionsResolver implements ResolverInterface
{
    private $logger;
    private $opinionRepository;

    public function __construct(OpinionRepository $opinionRepository, LoggerInterface $logger)
    {
        $this->opinionRepository = $opinionRepository;
        $this->logger = $logger;
    }

    public function __invoke(User $user, ?Argument $args = null): Connection
    {
        if (!$args) {
            $args = new Argument([
                'first' => 0
            ]);
        }

        $paginator = new Paginator(function (int $offset, int $limit) use ($user) {
            try {
                $arguments = $this->opinionRepository->getByUser($user);
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new UserError('Error during fetching arguments of ' . $user->getLastname());
            }

            return $arguments;
        });

        $totalCount = $this->getCountPublicPublished($user);

        return $paginator->auto($args, $totalCount);
    }

    public function getCountPublicPublished(User $user): int
    {
        return $this->opinionRepository->countByUser($user);
    }
}
