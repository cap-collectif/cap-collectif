<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Search\VoteSearch;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Symfony\Component\Security\Core\User\UserInterface;

class UserVotesResolver implements ResolverInterface
{
    protected $voteSearch;

    public function __construct(VoteSearch $voteSearch)
    {
        $this->voteSearch = $voteSearch;
    }

    public function __invoke(
        $viewer,
        User $user,
        Argument $args = null,
        ?\ArrayObject $context = null
    ): Connection {
        if (!$args) {
            $args = new Argument(['first' => 0]);
        }

        $aclDisabled =
            $context &&
            $context->offsetExists('disable_acl') &&
            true === $context->offsetGet('disable_acl');
        $validViewer = $viewer instanceof UserInterface;

        if ($aclDisabled) {
            $totalCount = 0;
            $paginator = new Paginator(function (int $offset, int $limit) use (
                $user,
                &$totalCount
            ) {
                $queryResponse = $this->voteSearch->getVotesByUser($user, $limit, $offset);
                $totalCount = $queryResponse['totalCount'];

                return $queryResponse['results'];
            });
        } elseif ($validViewer && $viewer) {
            $totalCount = 0;
            $paginator = new Paginator(function (int $offset, int $limit) use (
                $viewer,
                $user,
                &$totalCount
            ) {
                $queryResponse = $this->voteSearch->getVotesByAuthorViewerCanSee(
                    $user,
                    $viewer,
                    $limit,
                    $offset
                );
                $totalCount = $queryResponse['totalCount'] ?? 0;

                return $queryResponse['results'] ?? [];
            });
        } else {
            $totalCount = 0;
            $paginator = new Paginator(function (int $offset, int $limit) use (
                $user,
                &$totalCount
            ) {
                $queryResponse = $this->voteSearch->getPublicVotesByAuthor($user, $limit, $offset);
                $totalCount = $queryResponse['totalCount'];

                return $queryResponse['results'] ?? [];
            });
        }

        $connection = $paginator->auto($args, $totalCount);
        $connection->totalCount = $totalCount;

        return $connection;
    }
}
