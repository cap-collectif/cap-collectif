<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Form\PostType;
use Capco\AppBundle\GraphQL\Mutation\CreatePostMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Resolver\SettableOwnerResolver;
use Capco\AppBundle\Security\PostVoter;
use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Form\Form;
use Symfony\Component\Form\FormFactoryInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;

class CreatePostMutationSpec extends ObjectBehavior
{
    private array $data = [
        'translations' => [
            'fr-FR' => [
                'title' => 'Titre',
                'body' => '<p>Mon article</p>',
                'locale' => 'fr-FR',
            ],
        ],
        'displayOnBlog' => true,
        'publishedAt' => '2020-06-05 12:15:30',
        'isPublished' => true,
        'commentable' => true,
        'Authors' => ['VXNlcjp1c2VyVGhlbw=='],
        'projects' => [],
        'proposals' => [],
        'themes' => [],
    ];

    public function let(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        AuthorizationChecker $authorizationChecker,
        SettableOwnerResolver $settableOwnerResolver
    ) {
        $this->beConstructedWith($em, $formFactory, $authorizationChecker, $settableOwnerResolver);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(CreatePostMutation::class);
    }

    public function it_should_create_post(
        Arg $input,
        EntityManagerInterface $em,
        User $viewer,
        FormFactoryInterface $formFactory,
        Form $form,
        SettableOwnerResolver $settableOwnerResolver
    ) {
        $viewer->isAdmin()->willReturn(true);
        $viewer->isOnlyProjectAdmin()->willReturn(false);

        $input->getArrayCopy()->willReturn($this->data);
        $input->offsetGet('authors')->willReturn(['VXNlcjp1c2VyVGhlbw==']);
        $input
            ->offsetGet('owner')
            ->shouldBeCalledOnce()
            ->willReturn(null);
        $settableOwnerResolver->__invoke(null, $viewer)->shouldBeCalled()->willReturn($viewer);

        $formFactory->create(PostType::class, Argument::type(Post::class))->willReturn($form);
        $form->submit($this->data, false)->shouldBeCalled();

        $form->isValid()->willReturn(true);

        $em->persist(Argument::type(Post::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $payload = $this->__invoke($input, $viewer);

        $post = $payload['post'];
        $post->getOwner()->shouldReturn($viewer);

        $post->shouldHaveType(Post::class);
        $payload['errorCode']->shouldBe(null);
    }

    public function it_should_return_invalid_form_error_code(
        Arg $input,
        EntityManagerInterface $em,
        User $viewer,
        FormFactoryInterface $formFactory,
        Form $form,
        SettableOwnerResolver $settableOwnerResolver
    ) {
        $viewer->isAdmin()->willReturn(true);
        $viewer->isOnlyProjectAdmin()->willReturn(false);

        $input->getArrayCopy()->willReturn($this->data);
        $input->offsetGet('authors')->willReturn(['VXNlcjp1c2VyVGhlbw==']);
        $input
            ->offsetGet('owner')
            ->shouldBeCalledOnce()
            ->willReturn(null);
        $settableOwnerResolver->__invoke(null, $viewer)->shouldBeCalled()->willReturn($viewer);

        $formFactory->create(PostType::class, Argument::type(Post::class))->willReturn($form);
        $form->submit($this->data, false)->shouldBeCalled();

        $form->isValid()->willReturn(false);

        $em->persist(Argument::type(Post::class))->shouldNotBeCalled();
        $em->flush()->shouldNotBeCalled();

        $payload = $this->__invoke($input, $viewer);

        $payload['post']->shouldBe(null);
        $payload['errorCode']->shouldBe(CreatePostMutation::INVALID_FORM);
    }

    public function it_should_only_set_authors_to_project_admin(
        Arg $input,
        EntityManagerInterface $em,
        User $viewer,
        FormFactoryInterface $formFactory,
        Form $form,
        SettableOwnerResolver $settableOwnerResolver
    ) {
        $viewer->isAdmin()->willReturn(false);
        $viewer->isOnlyProjectAdmin()->willReturn(true);

        $input->getArrayCopy()->willReturn($this->data);
        $input->offsetGet('authors')->willReturn(['VXNlcjp1c2VyVGhlbw==']);
        $input
            ->offsetGet('owner')
            ->shouldBeCalledOnce()
            ->willReturn(null);
        $settableOwnerResolver->__invoke(null, $viewer)->shouldBeCalled()->willReturn($viewer);

        $formFactory->create(PostType::class, Argument::type(Post::class))->willReturn($form);
        $form->submit($this->data, false)->shouldBeCalled();

        $form->isValid()->willReturn(true);

        $em->persist(Argument::type('Capco\\AppBundle\\Entity\\Post'))->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $payload = $this->__invoke($input, $viewer);

        $post = $payload['post'];
        $post->getOwner()->shouldReturn($viewer);
        $post
            ->getAuthors()
            ->contains($viewer)
            ->shouldReturn(true);

        $post->shouldHaveType(Post::class);
        $payload['errorCode']->shouldBe(null);
    }

    public function it_should_create_post_with_organization(
        Arg $input,
        EntityManagerInterface $em,
        User $viewer,
        FormFactoryInterface $formFactory,
        Form $form,
        GlobalIdResolver $globalIdResolver,
        Organization $organization,
        SettableOwnerResolver $settableOwnerResolver
    ) {
        $organizationId = 'organizationId';

        $viewer->isOnlyProjectAdmin()->shouldBeCalled()->willReturn(false);

        $input->getArrayCopy()->shouldBeCalled()->willReturn($this->data);
        $input->offsetGet('owner')->shouldBeCalled()->willReturn($organizationId);
        $settableOwnerResolver->__invoke($organizationId, $viewer)->shouldBeCalled()->willReturn($organization);

        $formFactory->create(PostType::class, Argument::type(Post::class))->willReturn($form);
        $form->submit($this->data, false)->shouldBeCalled();

        $form->isValid()->willReturn(true);

        $em->persist(Argument::type(Post::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $payload = $this->__invoke($input, $viewer);

        $post = $payload['post'];
        $post->getOwner()->shouldReturn($organization);

        $post->shouldHaveType(Post::class);
        $payload['errorCode']->shouldBe(null);
    }

    public function it_should_call_voter(AuthorizationChecker $authorizationChecker)
    {
        $authorizationChecker
            ->isGranted(PostVoter::CREATE, Argument::type(Post::class))
            ->shouldBeCalled();
        $this->isGranted();
    }
}
