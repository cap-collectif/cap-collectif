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
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ViewerNotApprovedByModeratorCommentsResolver implements ResolverInterface
{
    private ProposalCommentRepository $proposalCommentRepository;
    private EventCommentRepository $eventCommentRepository;
    private PostCommentRepository $postCommentRepository;

    public function __construct(
        ProposalCommentRepository $proposalCommentRepository,
        EventCommentRepository $eventCommentRepository,
        PostCommentRepository $postCommentRepository
    ) {
        $this->proposalCommentRepository = $proposalCommentRepository;
        $this->eventCommentRepository = $eventCommentRepository;
        $this->postCommentRepository = $postCommentRepository;
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
        switch (true) {
            case $commentable instanceof Proposal:
            case $commentable instanceof ProposalComment:
                return $this->proposalCommentRepository;
            case $commentable instanceof Event:
            case $commentable instanceof EventComment:
                return $this->eventCommentRepository;
            case $commentable instanceof Post:
            case $commentable instanceof PostComment:
                return $this->postCommentRepository;
            default:
                return null;
        }
    }
}
