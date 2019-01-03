<?php
namespace Capco\AppBundle\GraphQL\Resolver\Commentable;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Event;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\PostComment;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Model\CommentableInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\PostCommentRepository;
use Capco\AppBundle\Repository\EventCommentRepository;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\Repository\ProposalCommentRepository;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Doctrine\ORM\EntityRepository;

class CommentableCommentsResolver implements ResolverInterface
{
    private $proposalCommentRepository;
    private $eventCommentRepository;
    private $postCommentRepository;

    public function __construct(
        ProposalCommentRepository $proposalCommentRepository,
        EventCommentRepository $eventCommentRepository,
        PostCommentRepository $postCommentRepository
    ) {
        $this->proposalCommentRepository = $proposalCommentRepository;
        $this->eventCommentRepository = $eventCommentRepository;
        $this->postCommentRepository = $postCommentRepository;
    }

    private function getCommentableRepository(CommentableInterface $commentable): EntityRepository
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

    public function __invoke(
        CommentableInterface $commentable,
        Argument $args,
        $viewer
    ): Connection {
        /** @var ProposalCommentRepository $repository */
        $repository = $this->getCommentableRepository($commentable);
        $viewer = $viewer instanceof User ? $viewer : null;

        $paginator = new Paginator(function (?int $offset, ?int $limit) use (
            $repository,
            $commentable,
            $viewer,
            $args
        ) {
            [$field, $direction] = [
                $args->offsetGet('orderBy')['field'],
                $args->offsetGet('orderBy')['direction'],
            ];

            return $repository
                ->getByCommentable($commentable, $offset, $limit, $field, $direction, $viewer)
                ->getIterator()
                ->getArrayCopy();
        });

        $totalCount = $repository->countCommentsByCommentable($commentable, $viewer);

        $totalCountWithAnswers = $repository->countCommentsAndAnswersByCommentable(
            $commentable,
            $viewer
        );

        $connection = $paginator->auto($args, $totalCount);

        $connection->{'totalCountWithAnswers'} = $totalCountWithAnswers;
        return $connection;
    }
}
