<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use ArrayObject;
use Capco\AppBundle\Repository\CommentRepository;
use Capco\AppBundle\Search\CommentSearch;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Symfony\Component\Security\Core\User\UserInterface;

class UserCommentsResolver implements ResolverInterface
{
    private $commentRepository;
    private $commentSearch;

    public function __construct(CommentRepository $commentRepository, CommentSearch $commentSearch)
    {
        $this->commentRepository = $commentRepository;
        $this->commentSearch = $commentSearch;
    }

    public function __invoke(
        $viewer,
        User $user,
        Argument $args,
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
                return $this->commentRepository->getByUser($user, $limit, $offset);
            });

            $totalCount = $this->commentRepository->countAllByAuthor($user);
        } elseif ($validViewer && $user) {
            $paginator = new Paginator(function (int $offset, int $limit) use ($viewer, $user) {
                return $this->commentSearch->getCommentsByAuthorViewerCanSee(
                    $user,
                    $viewer,
                    $limit,
                    $offset
                )['results'];
            });

            $totalCount = 73;
        } else {
            $paginator = new Paginator(function (int $offset, int $limit) use ($user) {
                return $this->commentSearch->getPublicCommentsByAuthor(
                    $user,
                    $limit,
                    $offset
                )['results'];
            });

            $totalCount = 50;
        }

        return $paginator->auto($args, $totalCount);
    }
}
