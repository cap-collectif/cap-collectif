<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\CommentRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class UserCommentsResolver implements ResolverInterface
{
    private $commentRepository;

    public function __construct(CommentRepository $commentRepository)
    {
        $this->commentRepository = $commentRepository;
    }

    public function __invoke($viewer, User $user, Argument $args)
    {
        if (!$args) {
            $args = new Argument(['first' => 100]);
        }

        $paginator = new Paginator(function (?int $offset, ?int $limit) use ($user) {
            return $this->commentRepository->getByUser($user, $limit, $offset);
        });

        $totalCount = $this->commentRepository->countAllByAuthor($user);

        return $paginator->auto($args, $totalCount);
    }
}
