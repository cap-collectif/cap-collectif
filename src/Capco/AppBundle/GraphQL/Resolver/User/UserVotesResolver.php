<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Search\VoteSearch;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
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
    ): ConnectionInterface {
        if (!$args) {
            $args = new Argument(['first' => 0]);
        }

        $aclDisabled =
            $context &&
            $context->offsetExists('disable_acl') &&
            true === $context->offsetGet('disable_acl');
        $validViewer = $viewer instanceof UserInterface;

        if ($aclDisabled) {
            $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
                $user
            ) {
                $queryResponse = $this->voteSearch->getVotesByUser($user, $limit, $cursor);

                return [
                    'count' => (int) $queryResponse['totalCount'],
                    'entities' => $queryResponse['results'],
                    'cursors' => $queryResponse['cursors']
                ];
            });
        } elseif ($validViewer && $viewer) {
            $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
                $viewer,
                $user
            ) {
                $queryResponse = $this->voteSearch->getVotesByAuthorViewerCanSee(
                    $user,
                    $viewer,
                    $limit,
                    $cursor
                );

                return [
                    'count' => (int) $queryResponse['totalCount'],
                    'entities' => $queryResponse['results'],
                    'cursors' => $queryResponse['cursors']
                ];
            });
        } else {
            $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
                $user
            ) {
                $queryResponse = $this->voteSearch->getPublicVotesByAuthor($user, $limit, $cursor);

                return [
                    'count' => (int) $queryResponse['totalCount'],
                    'entities' => $queryResponse['results'],
                    'cursors' => $queryResponse['cursors']
                ];
            });
        }

        return $paginator->auto($args);
    }
}
