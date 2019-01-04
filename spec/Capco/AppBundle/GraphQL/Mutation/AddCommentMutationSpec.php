<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\DataLoader\Commentable\CommentableCommentsDataLoader;
use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\Form;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Proposal;
use Symfony\Component\Form\FormFactory;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Capco\AppBundle\Model\CommentableInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Mutation\AddCommentMutation;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

class AddCommentMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        GlobalIdResolver $globalIdResolver,
        LoggerInterface $logger,
        EventDispatcherInterface $dispatcher,
        CommentableCommentsDataLoader $commentableCommentsDataLoader
    ) {
        $this->beConstructedWith(
            $em,
            $formFactory,
            $globalIdResolver,
            $logger,
            $dispatcher,
            $commentableCommentsDataLoader
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(AddCommentMutation::class);
    }

    public function it_returns_userError_if_not_found(
        GlobalIdResolver $globalIdResolver,
        Arg $arguments,
        User $viewer,
        RequestStack $requestStack
    ) {
        $arguments->offsetGet('commentableId')->willReturn('123456');
        $globalIdResolver->resolve('123456', $viewer)->willReturn(null);

        $this->__invoke($arguments, $viewer, $requestStack)->shouldBe([
            'userErrors' => [
                [
                    'message' => 'Commentable not found.',
                ],
            ],
        ]);
    }

    public function it_returns_userError_if_not_commentable(
        GlobalIdResolver $globalIdResolver,
        Arg $arguments,
        User $viewer,
        CommentableInterface $commentable,
        RequestStack $requestStack
    ) {
        $commentable->isCommentable()->willReturn(false);
        $arguments->offsetGet('commentableId')->willReturn('123456');
        $globalIdResolver->resolve('123456', $viewer)->willReturn($commentable);

        $this->__invoke($arguments, $viewer, $requestStack)->shouldBe([
            'userErrors' => [
                [
                    'message' => 'Can\'t add a comment to a not commentable.',
                ],
            ],
        ]);
    }

    public function it_returns_userError_if_new_comments_are_not_accepted(
        GlobalIdResolver $globalIdResolver,
        Arg $arguments,
        User $viewer,
        CommentableInterface $commentable,
        RequestStack $requestStack
    ) {
        $commentable->acceptNewComments()->willReturn(false);
        $commentable->isCommentable()->willReturn(true);
        $arguments->offsetGet('commentableId')->willReturn('123456');
        $globalIdResolver->resolve('123456', $viewer)->willReturn($commentable);

        $this->__invoke($arguments, $viewer, $requestStack)->shouldBe([
            'userErrors' => [
                [
                    'message' => "Comment's are not longer accepted",
                ],
            ],
        ]);
    }

    public function it_persists_new_comment(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        GlobalIdResolver $globalIdResolver,
        EventDispatcherInterface $dispatcher,
        Arg $arguments,
        User $viewer,
        Proposal $commentable,
        RequestStack $requestStack,
        Request $request,
        Form $form
    ) {
        $formData = ['body' => 'My body'];
        $form->submit($formData, false)->willReturn(null);
        $form->isValid()->willReturn(true);
        $formFactory
            ->create('Capco\\AppBundle\\Form\\CommentType', Argument::any())
            ->willReturn($form);
        $arguments->getRawArguments()->willReturn($formData);
        $commentable
            ->addComment(Argument::type('Capco\\AppBundle\\Entity\\ProposalComment'))
            ->willReturn($commentable);

        $request->getClientIp()->willReturn('1.1.1.1');
        $requestStack->getCurrentRequest()->willReturn($request);
        $viewer->isVip()->willReturn(false);
        $commentable->acceptNewComments()->willReturn(true);
        $commentable->isCommentable()->willReturn(true);
        $arguments->offsetGet('commentableId')->willReturn('123456');
        $globalIdResolver->resolve('123456', $viewer)->willReturn($commentable);

        $em->persist(Argument::type('Capco\\AppBundle\\Entity\\ProposalComment'))->shouldBeCalled();
        $em->flush()->shouldBeCalled();
        $dispatcher
            ->dispatch(
                'capco.comment_changed',
                Argument::type('Capco\\AppBundle\\Event\\CommentChangedEvent')
            )
            ->shouldBeCalled();

        $payload = $this->__invoke($arguments, $viewer, $requestStack);
        $payload->shouldHaveCount(2);
        // TODO: We should use snapshot testing, because we don't test commentEdge
        $payload->shouldBe([
            'commentEdge' => $payload->getWrappedObject()['commentEdge'],
            'userErrors' => [],
        ]);
    }
}
