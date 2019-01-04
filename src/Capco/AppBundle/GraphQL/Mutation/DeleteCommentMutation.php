<?php
namespace Capco\AppBundle\GraphQL\Mutation;

use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Comment;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
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

    public function __construct(
        EntityManagerInterface $em,
        CommentRepository $commentRepo,
        RedisStorageHelper $redisStorage,
        LoggerInterface $logger
    ) {
        $this->em = $em;
        $this->commentRepo = $commentRepo;
        $this->redisStorage = $redisStorage;
        $this->logger = $logger;
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
        $this->redisStorage->recomputeUserCounters($user);

        return ['deletedCommentId' => $commentId, 'userErrors' => []];
    }
}
