<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\SourceRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class UserSourcesResolver implements ResolverInterface
{
    protected $sourceRepository;

    public function __construct(SourceRepository $sourceRepository)
    {
        $this->sourceRepository = $sourceRepository;
    }

    public function __invoke(User $user, Argument $args = null): Connection
    {
        if (!$args) {
            $args = new Argument(['first' => 5]);
        }

        $paginator = new Paginator(function (int $offset, int $limit) use ($user) {
            return $this->sourceRepository->findAllByAuthor($user, $offset, $limit);
        });

        $totalCount = $this->sourceRepository->countAllByAuthor($user);

        return $paginator->auto($args, $totalCount);
    }
}
