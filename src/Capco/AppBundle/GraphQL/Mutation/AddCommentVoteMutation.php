<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\CommentVote;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Doctrine\DBAL\Exception\DriverException;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\CommentRepository;
use Capco\AppBundle\Repository\CommentVoteRepository;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class AddCommentVoteMutation implements MutationInterface
{
    private $em;
    private $commentRepo;
    private $commentVoteRepo;
    private $redisStorageHelper;

    public function __construct(
        EntityManagerInterface $em,
        CommentRepository $commentRepo,
        CommentVoteRepository $commentVoteRepo,
        RedisStorageHelper $redisStorageHelper
    ) {
        $this->em = $em;
        $this->commentRepo = $commentRepo;
        $this->commentVoteRepo = $commentVoteRepo;
        $this->redisStorageHelper = $redisStorageHelper;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $contributionId = $input->offsetGet('commentId');
        $comment = $this->commentRepo->find(GlobalId::fromGlobalId($contributionId)['id']);

        if (!$comment) {
            throw new UserError('Unknown comment with id: ' . $contributionId);
        }

        if (!$comment->canVote()) {
            throw new UserError('can not vote for : ' . $contributionId);
        }

        $previousVote = $this->commentVoteRepo->findOneBy([
            'user' => $viewer,
            'comment' => $comment
        ]);

        if ($previousVote) {
            throw new UserError('Already voted.');
        }

        $vote = (new CommentVote())->setComment($comment)->setUser($viewer);

        try {
            $this->em->persist($vote);
            $this->em->flush();
        } catch (DriverException $e) {
            // Updating comments votes count failed
            throw new UserError($e->getMessage());
        }
        $this->redisStorageHelper->recomputeUserCounters($viewer);

        $edge = new Edge(ConnectionBuilder::offsetToCursor(0), $vote);

        return [
            'voteEdge' => $edge,
            'viewer' => $viewer
        ];
    }
}
