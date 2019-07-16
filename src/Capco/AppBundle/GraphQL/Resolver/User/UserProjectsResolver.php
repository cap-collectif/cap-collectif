<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Repository\ProjectRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserProjectsResolver implements ResolverInterface
{
    private $logger;
    private $projectRepository;

    public function __construct(ProjectRepository $projectRepository, LoggerInterface $logger)
    {
        $this->projectRepository = $projectRepository;
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
                $arguments = $this->projectRepository
                    ->getByUserPaginated($user)
                    ->getIterator()
                    ->getArrayCopy();
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new UserError('Error during fetching arguments of ' . $user->getLastname());
            }

            return $arguments;
        });

        $totalCount = $this->projectRepository->countPublished($user);

        return $paginator->auto($args, $totalCount);
    }
}
