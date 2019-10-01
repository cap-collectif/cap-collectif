<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use ArrayObject;
use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Search\CommentSearch;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class UserCommentsResolver implements ResolverInterface
{
    private $commentSearch;

    public function __construct(CommentSearch $commentSearch)
    {
        $this->commentSearch = $commentSearch;
    }

    public function __invoke(
        $viewer,
        User $user,
        Argument $args = null,
        ?ArrayObject $context = null
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
                $queryResponse = $this->commentSearch->getCommentsByUser($user, $limit, $cursor);

                return [
                    'count' => (int) $queryResponse['totalCount'],
                    'entities' => $queryResponse['results'],
                    'cursors' => $queryResponse['cursors']
                ];
            });
        } elseif ($validViewer && $user) {
            $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
                $viewer,
                $user
            ) {
                $queryResponse = $this->commentSearch->getCommentsByAuthorViewerCanSee(
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
                $queryResponse = $this->commentSearch->getPublicCommentsByAuthor(
                    $user,
                    $limit,
                    $cursor
                );

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
