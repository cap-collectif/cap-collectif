<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Repository\ReplyRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserRepliesResolver implements ResolverInterface
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

        $paginator = new Paginator(function (int $offset, int $limit) use ($viewer, $user) {
            return $this->repliesRepository->getByAuthorViewerCanSee(
                $viewer,
                $user,
                $limit,
                $offset
            );
        });

        $totalCount = $this->repliesRepository->countRepliesByAuthorViewerCanSee($viewer, $user);

        return $paginator->auto($args, $totalCount);
    }
}
