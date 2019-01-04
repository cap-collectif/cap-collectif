<?php
namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\Form;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Proposal;
use Symfony\Component\Form\FormFactory;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Entity\ProposalComment;
use Symfony\Component\HttpFoundation\Request;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Model\CommentableInterface;
use Capco\AppBundle\Repository\CommentRepository;
use Symfony\Component\HttpFoundation\RequestStack;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Mutation\DeleteCommentMutation;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

class DeleteCommentMutationSpec extends ObjectBehavior
{
    function let(
        EntityManagerInterface $em,
        CommentRepository $commentRepo,
        RedisStorageHelper $redisStorage,
        LoggerInterface $logger
    ) {
        $this->beConstructedWith($em, $commentRepo, $redisStorage, $logger);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType(DeleteCommentMutation::class);
    }

    function it_returns_userError_if_not_found($commentRepo, Arg $arguments, User $viewer)
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

    function it_returns_userError_if_not_author(
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

    function it_removes_a_comment(
        $em,
        $commentRepo,
        $redisStorage,
        Arg $arguments,
        User $viewer,
        ProposalComment $comment
    ) {
        $comment->getAuthor()->willReturn($viewer);
        $commentId = '123456';
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
