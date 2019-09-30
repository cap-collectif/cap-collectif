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
            $totalCount = 0;
            $paginator = new ElasticsearchPaginator(function (
                ?string $cursor,
                ?int $offset,
                int $limit
            ) use ($user, &$totalCount) {
                $queryResponse = $this->voteSearch->getVotesByUser($user, $limit, $offset, $cursor);
                $totalCount = $queryResponse['totalCount'];

                return [
                    'count' => (int) $queryResponse['totalCount'],
                    'entities' => $queryResponse['results'],
                    'cursors' => $queryResponse['cursors']
                ];
            });
        } elseif ($validViewer && $viewer) {
            $totalCount = 0;
            $paginator = new ElasticsearchPaginator(function (
                ?string $cursor,
                ?int $offset,
                int $limit
            ) use ($viewer, $user, &$totalCount) {
                $queryResponse = $this->voteSearch->getVotesByAuthorViewerCanSee(
                    $user,
                    $viewer,
                    $limit,
                    $offset,
                    $cursor
                );
                $totalCount = (int) $queryResponse['totalCount'];

                return [
                    'count' => (int) $queryResponse['totalCount'],
                    'entities' => $queryResponse['results'],
                    'cursors' => $queryResponse['cursors']
                ];
            });
        } else {
            $totalCount = 0;
            $paginator = new ElasticsearchPaginator(function (
                ?string $cursor,
                ?int $offset,
                int $limit
            ) use ($user, &$totalCount) {
                $queryResponse = $this->voteSearch->getPublicVotesByAuthor(
                    $user,
                    $limit,
                    $offset,
                    $cursor
                );
                $totalCount = $queryResponse['totalCount'];

                return [
                    'count' => (int) $queryResponse['totalCount'],
                    'entities' => $queryResponse['results'],
                    'cursors' => $queryResponse['cursors']
                ];
            });
        }

        return $paginator->auto($args, $totalCount, ElasticsearchPaginator::ES_PAGINATION);
    }
}
