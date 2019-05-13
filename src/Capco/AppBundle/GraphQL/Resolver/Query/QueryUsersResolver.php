<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class QueryUsersResolver implements ResolverInterface
{
    use ResolverTrait;

    protected $userRepo;
    protected $dataLoader;

    public function __construct(UserRepository $userRepo)
    {
        $this->userRepo = $userRepo;
    }

    public function __invoke(Argument $args): Connection
    {
        $this->protectArguments($args);

        $includeSuperAdmin = isset($args['superAdmin']) && true === $args['superAdmin'];

        $paginator = new Paginator(function (int $offset, int $limit) use ($includeSuperAdmin) {
            return $this->userRepo
                ->getAllUsers($limit, $offset, $includeSuperAdmin)
                ->getIterator()
                ->getArrayCopy();
        });
        $totalCount = $this->userRepo->countAllUsers($includeSuperAdmin);

        return $paginator->auto($args, $totalCount);
    }
}
