<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class UserQueryResolver implements ResolverInterface
{
    protected $userRepo;
    protected $dataLoader;

    public function __construct(UserRepository $userRepo)
    {
        $this->userRepo = $userRepo;
    }

    public function __invoke(Argument $args)
    {
        if (isset($args['id'])) {
            $paginator = new Paginator(function () use ($args) {
                return $this->userRepo->find($args['id']);
            });
            $totalCount = 1;
        } elseif (isset($args['superAdmin']) && true === $args['superAdmin']) {
            $paginator = new Paginator(function (?int $offset, ?int $limit) {
                return $this->userRepo
                    ->getAllUsers($limit, $offset, true)
                    ->getIterator()
                    ->getArrayCopy();
            });
            $totalCount = $this->userRepo->countAllUsers(true);
        } else {
            $paginator = new Paginator(function (?int $offset, ?int $limit) {
                return $this->userRepo
                    ->getAllUsers($limit, $offset)
                    ->getIterator()
                    ->getArrayCopy();
            });
            $totalCount = $this->userRepo->countAllUsers();
        }

        return $paginator->auto($args, $totalCount);
    }
}
