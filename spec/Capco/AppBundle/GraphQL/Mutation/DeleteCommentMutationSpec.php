<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\GraphQL\DataLoader\Commentable\CommentableCommentsDataLoader;
use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Repository\CommentRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Mutation\DeleteCommentMutation;

class DeleteCommentMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        CommentRepository $commentRepo,
        RedisStorageHelper $redisStorage,
        LoggerInterface $logger,
        CommentableCommentsDataLoader $commentableCommentsDataLoader
    ) {
        $this->beConstructedWith(
            $em,
            $commentRepo,
            $redisStorage,
            $logger,
            $commentableCommentsDataLoader
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DeleteCommentMutation::class);
    }

    public function it_returns_userError_if_not_found($commentRepo, Arg $arguments, User $viewer)
    {
        $arguments->offsetGet('id')->willReturn('123456');
        $commentRepo->find('123456')->willReturn(null);

        $this->__invoke($arguments, $viewer)->shouldBe([
            'userErrors' => [
                [
                    'message' => 'Comment not found.',
                ],
            ],
        ]);
    }

    public function it_returns_userError_if_not_author(
        $commentRepo,
        Arg $arguments,
        User $viewer,
        User $author,
        ProposalComment $comment
    ) {
        $comment->getAuthor()->willReturn($author);
        $commentId = '123456';
        $commentRepo->find('123456')->willReturn($comment);
        $arguments->offsetGet('id')->willReturn($commentId);

        $this->__invoke($arguments, $viewer)->shouldBe([
            'userErrors' => [
                [
                    'message' => 'You are not author of the comment.',
                ],
            ],
        ]);
    }

    public function it_removes_a_comment(
        $em,
        $commentRepo,
        $redisStorage,
        Arg $arguments,
        User $viewer,
        ProposalComment $comment
    ) {
        $commentable = new EventComment();
        $commentable->getId()->willReturn('098765');
        $commentId = '123456';

        $comment->getAuthor()->willReturn($viewer);
        $comment->getRelatedObject()->willReturn($commentable);
        $comment
            ->getRelatedObject()
            ->getId()
            ->willReturn($commentable->getId());
        $commentRepo->find('123456')->willReturn($comment);
        $arguments->offsetGet('id')->willReturn($commentId);
        $em->remove(Argument::any())->shouldBeCalled();
        $em->flush()->shouldBeCalled();
        $redisStorage->recomputeUserCounters($viewer)->shouldBeCalled();
        $this->__invoke($arguments, $viewer)->shouldBe([
            'deletedCommentId' => $commentId,
            'userErrors' => [],
        ]);
    }
}
