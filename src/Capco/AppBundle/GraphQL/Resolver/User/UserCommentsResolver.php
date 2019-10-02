<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

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

        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $aclDisabled,
            $user,
            $validViewer,
            $viewer
        ) {
            if ($aclDisabled) {
                return $this->commentSearch->getCommentsByUser($user, $limit, $cursor);
            }
            if ($validViewer && $user) {
                return $this->commentSearch->getCommentsByAuthorViewerCanSee(
                    $user,
                    $viewer,
                    $limit,
                    $cursor
                );
            }

            return $this->commentSearch->getPublicCommentsByAuthor($user, $limit, $cursor);
        });

        return $paginator->auto($args);
    }
}
