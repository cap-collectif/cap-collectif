<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\GraphQL\DataLoader\User\UserAuthorsOfEventDataLoader;
use Capco\AppBundle\Search\EventSearch;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class UserQueryResolver implements ResolverInterface
{
    protected $userRepo;
    protected $eventSearch;
    protected $dataLoader;

    public function __construct(
        UserRepository $userRepo,
        EventSearch $eventSearch,
        UserAuthorsOfEventDataLoader $dataLoader
    ) {
        $this->dataLoader = $dataLoader;
        $this->userRepo = $userRepo;
        $this->eventSearch = $eventSearch;
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
        } elseif (isset($args['authorsOfEventOnly']) && true === $args['authorsOfEventOnly']) {
            return $this->dataLoader->load(['args' => $args]);
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
