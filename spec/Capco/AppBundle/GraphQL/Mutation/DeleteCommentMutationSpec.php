<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\GraphQL\DataLoader\Commentable\CommentableCommentsDataLoader;
use Capco\AppBundle\GraphQL\Mutation\DeleteCommentMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class DeleteCommentMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        RedisStorageHelper $redisStorage,
        LoggerInterface $logger,
        CommentableCommentsDataLoader $commentableCommentsDataLoader,
        AuthorizationCheckerInterface $authorizationChecker,
        GlobalIdResolver $globalIdResolver
    ) {
        $this->beConstructedWith(
            $em,
            $redisStorage,
            $logger,
            $commentableCommentsDataLoader,
            $authorizationChecker,
            $globalIdResolver
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DeleteCommentMutation::class);
    }

    public function it_returns_userError_if_not_found(
        GlobalIdResolver $globalIdResolver,
        Arg $arguments,
        User $viewer
    ) {
        $commentId = 'commentId';
        $arguments->offsetGet('id')->willReturn($commentId);
        $globalIdResolver->resolve($commentId, $viewer)->willReturn(null);

        $this->__invoke($arguments, $viewer)->shouldBe([
            'userErrors' => [
                [
                    'message' => 'Comment not found.',
                ],
            ],
        ]);
    }

    public function it_removes_a_comment(
        $em,
        $redisStorage,
        $commentableCommentsDataLoader,
        Arg $arguments,
        User $viewer,
        ProposalComment $comment,
        Proposal $proposal,
        GlobalIdResolver $globalIdResolver
    ) {
        $commentId = 'commentId';
        $arguments->offsetGet('id')->willReturn($commentId);
        $globalIdResolver->resolve($commentId, $viewer)->willReturn($comment);

        $proposal->getId()->willReturn('012234');
        $comment->getAuthor()->willReturn($viewer);
        $comment->getRelatedObject()->willReturn($proposal);
        $em->remove(Argument::any())->shouldBeCalled();
        $em->flush()->shouldBeCalled();
        $commentableCommentsDataLoader->invalidate('012234')->shouldBeCalled();
        $redisStorage->recomputeUserCounters($viewer)->shouldBeCalled();
        $this->__invoke($arguments, $viewer)->shouldBe([
            'deletedCommentId' => $commentId,
            'userErrors' => [],
        ]);
    }
}
