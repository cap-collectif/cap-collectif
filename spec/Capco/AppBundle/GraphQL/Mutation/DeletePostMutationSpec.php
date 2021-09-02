<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\GraphQL\Mutation\DeletePostMutation;
use Capco\AppBundle\Security\PostVoter;
use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;

class DeletePostMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        AuthorizationChecker $authorizationChecker
    ) {
        $this->beConstructedWith($em, $globalIdResolver, $authorizationChecker);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DeletePostMutation::class);
    }

    public function it_should_delete_post(
        Arg $arguments,
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        User $viewer,
        Post $post
    ) {
        $id = 'abc';
        $arguments->offsetGet('id')->willReturn($id);
        $globalIdResolver->resolve($id, $viewer)->willReturn($post);

        $em->remove(Argument::type('Capco\\AppBundle\\Entity\\Post'))->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $this->__invoke($arguments, $viewer)->shouldReturn([
            'deletedPostId' => $id,
        ]);
    }

    public function it_should_not_grant_access_if_no_post_found(
        User $viewer,
        GlobalIdResolver $globalIdResolver
    ) {
        $postId = 'abc';
        $globalIdResolver->resolve($postId, $viewer)->willReturn(null);

        $this->isGranted($postId, $viewer)->shouldReturn(false);
    }

    public function it_should_call_voter_if_post_exist(
        User $viewer,
        GlobalIdResolver $globalIdResolver,
        Post $post,
        AuthorizationChecker $authorizationChecker
    ) {
        $postId = 'abc';
        $globalIdResolver->resolve($postId, $viewer)->willReturn($post);
        $authorizationChecker->isGranted(PostVoter::DELETE, $post)->shouldBeCalled();

        $this->isGranted($postId, $viewer);
    }
}
