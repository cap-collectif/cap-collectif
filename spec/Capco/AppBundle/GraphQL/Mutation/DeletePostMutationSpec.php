<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\GraphQL\Mutation\DeletePostMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Security\PostVoter;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class DeletePostMutationSpec extends ObjectBehavior
{
    use GraphQLMock;

    public function let(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        AuthorizationCheckerInterface $authorizationChecker
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
        $this->getMockedGraphQLArgumentFormatted($arguments);

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
