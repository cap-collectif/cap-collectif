<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class UserRepliesResolver implements QueryInterface
{
    use ResolverTrait;

    protected $repliesRepository;

    public function __construct(ReplyRepository $repliesRepository)
    {
        $this->repliesRepository = $repliesRepository;
    }

    /*
     * This resolve replace legacy MySQL field.
     * We still need to add some dataloader and caching later.
     */
    public function __invoke($viewer, $user, ?Argument $args = null): Connection
    {
        if (!$args) {
            $args = new Argument(['first' => 0]);
        }
        $this->protectArguments($args);
        $viewer = $viewer instanceof User ? $viewer : null;

        $paginator = new Paginator(fn (int $offset, int $limit) => $this->repliesRepository->getByAuthorViewerCanSee(
            $viewer,
            $user,
            $limit,
            $offset
        ));

        $totalCount = $this->repliesRepository->countRepliesByAuthorViewerCanSee($viewer, $user);

        return $paginator->auto($args, $totalCount);
    }
}
