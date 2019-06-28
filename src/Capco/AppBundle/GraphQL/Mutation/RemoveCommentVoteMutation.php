<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\AppBundle\Repository\CommentRepository;
use Capco\AppBundle\Repository\CommentVoteRepository;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class RemoveCommentVoteMutation implements MutationInterface
{
    private $em;
    private $commentVoteRepo;
    private $commentRepo;
    private $redisStorageHelper;

    public function __construct(
        EntityManagerInterface $em,
        CommentVoteRepository $commentVoteRepo,
        CommentRepository $commentRepo,
        RedisStorageHelper $redisStorageHelper
    ) {
        $this->em = $em;
        $this->commentVoteRepo = $commentVoteRepo;
        $this->commentRepo = $commentRepo;
        $this->redisStorageHelper = $redisStorageHelper;
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

        $this->em->remove($vote);
        $this->em->flush();

        $this->redisStorageHelper->recomputeUserCounters($viewer);

        return [
            'deletedVoteId' => $deletedVoteId,
            'contribution' => $comment,
            'viewer' => $viewer
        ];
    }
}
