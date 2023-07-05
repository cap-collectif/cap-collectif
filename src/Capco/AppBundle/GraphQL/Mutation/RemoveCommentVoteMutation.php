<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Repository\CommentRepository;
use Capco\AppBundle\Repository\CommentVoteRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class RemoveCommentVoteMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private CommentVoteRepository $commentVoteRepo;
    private CommentRepository $commentRepo;
    private RedisStorageHelper $redisStorageHelper;
    private Indexer $indexer;

    public function __construct(
        EntityManagerInterface $em,
        CommentVoteRepository $commentVoteRepo,
        CommentRepository $commentRepo,
        RedisStorageHelper $redisStorageHelper,
        Indexer $indexer
    ) {
        $this->em = $em;
        $this->commentVoteRepo = $commentVoteRepo;
        $this->commentRepo = $commentRepo;
        $this->redisStorageHelper = $redisStorageHelper;
        $this->indexer = $indexer;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $id = $input->offsetGet('commentId');
        $comment = $this->commentRepo->find(GlobalId::fromGlobalId($id)['id']);

        $vote = $this->commentVoteRepo->findOneBy(['user' => $viewer, 'comment' => $comment]);

        if (!$vote) {
            throw new UserError('You have not voted for this comment.');
        }

        $typeName = 'CommentVote';
        $deletedVoteId = GlobalId::toGlobalId($typeName, $vote->getId());

        $this->indexer->remove(ClassUtils::getClass($vote), $vote->getId());
        $this->em->remove($vote);
        $this->em->flush();
        $this->indexer->finishBulk();

        $this->redisStorageHelper->recomputeUserCounters($viewer);

        return [
            'deletedVoteId' => $deletedVoteId,
            'contribution' => $comment,
            'viewer' => $viewer,
        ];
    }
}
