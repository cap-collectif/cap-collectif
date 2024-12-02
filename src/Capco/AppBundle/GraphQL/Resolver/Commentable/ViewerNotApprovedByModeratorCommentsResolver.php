<?php

namespace Capco\AppBundle\GraphQL\Resolver\Commentable;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\PostComment;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Model\CommentableInterface;
use Capco\AppBundle\Repository\EventCommentRepository;
use Capco\AppBundle\Repository\PostCommentRepository;
use Capco\AppBundle\Repository\ProposalCommentRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ViewerNotApprovedByModeratorCommentsResolver implements QueryInterface
{
    public function __construct(private readonly ProposalCommentRepository $proposalCommentRepository, private readonly EventCommentRepository $eventCommentRepository, private readonly PostCommentRepository $postCommentRepository)
    {
    }

    public function __invoke(
        CommentableInterface $commentable,
        Argument $args,
        ?User $viewer
    ): ?ConnectionInterface {
        if (!$viewer) {
            return null;
        }

        $repository = $this->getCommentableRepository($commentable);
        $paginator = new Paginator(function (?int $offset, ?int $limit) use (
            $repository,
            $commentable,
            $viewer
        ) {
            if (0 === $offset && 0 === $limit) {
                return [];
            }

            return $repository->getViewerPendingModerationComments(
                $commentable,
                $viewer,
                $offset,
                $limit
            );
        });

        $totalCount = $repository->countViewerPendingModerationComments($commentable, $viewer);

        return $paginator->auto($args, $totalCount);
    }

    private function getCommentableRepository(CommentableInterface $commentable): ?EntityRepository
    {
        return match (true) {
            $commentable instanceof Proposal, $commentable instanceof ProposalComment => $this->proposalCommentRepository,
            $commentable instanceof Event, $commentable instanceof EventComment => $this->eventCommentRepository,
            $commentable instanceof Post, $commentable instanceof PostComment => $this->postCommentRepository,
            default => null,
        };
    }
}
