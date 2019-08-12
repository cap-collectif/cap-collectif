<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use ArrayObject;
use Capco\AppBundle\Search\CommentSearch;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
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
                $queryResponse = $this->commentSearch->getCommentsByUser($user, $limit, $offset);
                $totalCount = $queryResponse['totalCount'] ?? 0;

                return $queryResponse['results'] ?? [];
            });
        } elseif ($validViewer && $user) {
            $totalCount = 0;
            $paginator = new Paginator(function (int $offset, int $limit) use (
                $viewer,
                $user,
                &$totalCount
            ) {
                $queryResponse = $this->commentSearch->getCommentsByAuthorViewerCanSee(
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
                $queryResponse = $this->commentSearch->getPublicCommentsByAuthor(
                    $user,
                    $limit,
                    $offset
                );
                $totalCount = $queryResponse['totalCount'] ?? 0;

                return $queryResponse['results'] ?? [];
            });
        }

        $connection = $paginator->auto($args, $totalCount);
        $connection->totalCount = $totalCount;

        return $connection;
    }
}
