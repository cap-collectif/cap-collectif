<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\ArgumentRepository;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Symfony\Component\Security\Core\User\UserInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserArgumentsResolver implements ResolverInterface
{
    private $argumentRepository;

    public function __construct(ArgumentRepository $argumentRepository)
    {
        $this->argumentRepository = $argumentRepository;
    }

    public function __invoke(
        ?User $viewer,
        User $user,
        ?Argument $args = null
    ): Connection {

        $paginator = new Paginator(function (int $offset, int $limit) use ($user, $viewer) {
            try {
                $arguments = $this->argumentRepository->getByUser($user);
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new UserError('Error during fetching arguments of ' . $user->getLastname());
            }

            return $arguments;
        });

        $totalCount = 0;

        $args = new Argument(['first' => 0]);

        $connection = $paginator->auto([], $totalCount);

        return $connection;
    }
}
