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
            $args = new Argument(['first' => 100]);
        }

        $aclDisabled =
            $context &&
            $context->offsetExists('disable_acl') &&
            true === $context->offsetGet('disable_acl');
        $validViewer = $viewer instanceof UserInterface;

        if ($aclDisabled) {
            $paginator = new Paginator(function (int $offset, int $limit) use ($user) {
                return $this->commentSearch->getCommentsByUser($user, $limit, $offset)['results'];
            });

            $totalCount = $this->commentSearch->countCommentsByUser($user);
        } elseif ($validViewer && $user) {
            $paginator = new Paginator(function (int $offset, int $limit) use ($viewer, $user) {
                return $this->commentSearch->getCommentsByAuthorViewerCanSee(
                    $user,
                    $viewer,
                    $limit,
                    $offset
                )['results'];
            });

            $totalCount = $this->commentSearch->countCommentsByAuthorViewerCanSee($user, $viewer);
        } else {
            $paginator = new Paginator(function (int $offset, int $limit) use ($user) {
                return $this->commentSearch->getPublicCommentsByAuthor(
                    $user,
                    $limit,
                    $offset
                )['results'];
            });

            $totalCount = $this->commentSearch->countPublicCommentsByAuthor($user);
        }

        return $paginator->auto($args, $totalCount);
    }
}
