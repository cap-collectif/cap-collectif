<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\DataLoader\Commentable\CommentableCommentsDataLoader;
use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Comment;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Repository\CommentRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class DeleteCommentMutation implements MutationInterface
{
    private $em;
    private $commentRepo;
    private $redisStorage;
    private $logger;
    private $commentableCommentsDataLoader;

    public function __construct(
        EntityManagerInterface $em,
        CommentRepository $commentRepo,
        RedisStorageHelper $redisStorage,
        LoggerInterface $logger,
        CommentableCommentsDataLoader $commentableCommentsDataLoader
    ) {
        $this->em = $em;
        $this->commentRepo = $commentRepo;
        $this->redisStorage = $redisStorage;
        $this->logger = $logger;
        $this->commentableCommentsDataLoader = $commentableCommentsDataLoader;
    }

    public function __invoke(Arg $input, User $user): array
    {
        $commentId = $input->offsetGet('id');
        /** @var Comment $comment */
        $comment = $this->commentRepo->find($commentId);

        if (!$comment) {
            $this->logger->error('Unknown comment with id: ' . $commentId);

            return [
                'userErrors' => [
                    [
                        'message' => 'Comment not found.',
                    ],
                ],
            ];
        }

        if ($user !== $comment->getAuthor()) {
            return [
                'userErrors' => [
                    [
                        'message' => 'You are not author of the comment.',
                    ],
                ],
            ];
        }

        $this->em->remove($comment);
        $this->em->flush();
        if ($comment->getRelatedObject()) {
            $this->commentableCommentsDataLoader->invalidate($comment->getRelatedObject()->getId());
        }
        $this->redisStorage->recomputeUserCounters($user);

        return ['deletedCommentId' => $commentId, 'userErrors' => []];
    }
}
