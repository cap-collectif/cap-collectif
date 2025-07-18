<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Factory\PostAuthorFactory;
use Capco\AppBundle\Form\PostType;
use Capco\AppBundle\GraphQL\Mutation\CreatePostMutation;
use Capco\AppBundle\Resolver\SettableOwnerResolver;
use Capco\AppBundle\Security\PostVoter;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\Form;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class CreatePostMutationSpec extends ObjectBehavior
{
    use GraphQLMock;

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
        'authors' => ['VXNlcjp1c2VyVGhlbw=='],
        'projects' => [],
        'proposals' => [],
        'themes' => [],
        'owner' => null,
    ];

    public function let(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        AuthorizationCheckerInterface $authorizationChecker,
        SettableOwnerResolver $settableOwnerResolver,
        PostAuthorFactory $postAuthorFactory,
        Indexer $indexer,
        LoggerInterface $logger
    ) {
        $this->beConstructedWith(
            $em,
            $formFactory,
            $authorizationChecker,
            $settableOwnerResolver,
            $postAuthorFactory,
            $indexer,
            $logger
        );
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
        SettableOwnerResolver $settableOwnerResolver,
        PostAuthorFactory $postAuthorFactory
    ) {
        $rawInput['input'] = $this->data;

        $this->getMockedGraphQLArgumentFormatted($input, $rawInput, $this->data);

        $viewer->isAdmin()->willReturn(true);
        $viewer->isOnlyProjectAdmin()->willReturn(false);

        $input->getArrayCopy()->willReturn($this->data);
        $input->offsetGet('authors')->willReturn(['VXNlcjp1c2VyVGhlbw==']);
        $settableOwnerResolver
            ->__invoke(null, $viewer)
            ->shouldBeCalled()
            ->willReturn($viewer)
        ;

        $postAuthorFactory
            ->findOrCreatePostAuthors(
                Argument::type(Post::class),
                ['VXNlcjp1c2VyVGhlbw=='],
                $viewer
            )
            ->shouldBeCalledOnce()
            ->willReturn(['postAuthorId'])
        ;

        $data = $this->data;
        $data['authors'] = ['postAuthorId'];

        $formFactory->create(PostType::class, Argument::type(Post::class))->willReturn($form);
        $form->submit($data, false)->shouldBeCalled();

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
        SettableOwnerResolver $settableOwnerResolver,
        PostAuthorFactory $postAuthorFactory
    ) {
        $rawInput['input'] = $this->data;

        $this->getMockedGraphQLArgumentFormatted($input, $rawInput, $this->data);

        $viewer->isAdmin()->willReturn(true);
        $viewer->isOnlyProjectAdmin()->willReturn(false);

        $input->getArrayCopy()->willReturn($this->data);
        $input->offsetGet('authors')->willReturn(['VXNlcjp1c2VyVGhlbw==']);
        $settableOwnerResolver
            ->__invoke(null, $viewer)
            ->shouldBeCalled()
            ->willReturn($viewer)
        ;

        $postAuthorFactory
            ->findOrCreatePostAuthors(
                Argument::type(Post::class),
                ['VXNlcjp1c2VyVGhlbw=='],
                $viewer
            )
            ->shouldBeCalledOnce()
            ->willReturn(['postAuthorId'])
        ;

        $data = $this->data;
        $data['authors'] = ['postAuthorId'];

        $formFactory->create(PostType::class, Argument::type(Post::class))->willReturn($form);
        $form->submit($data, false)->shouldBeCalled();

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
        SettableOwnerResolver $settableOwnerResolver,
        PostAuthorFactory $postAuthorFactory
    ) {
        $rawInput['input'] = $this->data;

        $this->getMockedGraphQLArgumentFormatted($input, $rawInput, $this->data);

        $viewer->isAdmin()->willReturn(false);
        $viewer->isOnlyProjectAdmin()->willReturn(true);

        $input->getArrayCopy()->willReturn($this->data);
        $input->offsetGet('authors')->willReturn(['VXNlcjp1c2VyVGhlbw==']);
        $settableOwnerResolver
            ->__invoke(null, $viewer)
            ->shouldBeCalled()
            ->willReturn($viewer)
        ;

        $postAuthorFactory
            ->findOrCreatePostAuthors(
                Argument::type(Post::class),
                ['VXNlcjp1c2VyVGhlbw=='],
                $viewer
            )
            ->shouldBeCalledOnce()
            ->willReturn(['postAuthorId'])
        ;

        $data = $this->data;
        $data['authors'] = ['postAuthorId'];

        $formFactory->create(PostType::class, Argument::type(Post::class))->willReturn($form);
        $form->submit($data, false)->shouldBeCalled();

        $form->isValid()->willReturn(true);

        $em->persist(Argument::type(Post::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $payload = $this->__invoke($input, $viewer);

        $post = $payload['post'];
        $post->getOwner()->shouldReturn($viewer);

        $post->shouldHaveType(Post::class);
        $payload['errorCode']->shouldBe(null);
    }

    public function it_should_create_post_with_organization(
        Arg $input,
        EntityManagerInterface $em,
        User $viewer,
        FormFactoryInterface $formFactory,
        Form $form,
        Organization $organization,
        SettableOwnerResolver $settableOwnerResolver
    ) {
        $organizationId = 'organizationId';

        $data = $this->data;

        $rawInput['input'] = $data;

        $this->getMockedGraphQLArgumentFormatted($input, $rawInput, $data);

        unset($data['authors']);
        $data['owner'] = $organizationId;
        $input
            ->getArrayCopy()
            ->shouldBeCalled()
            ->willReturn($data)
        ;
        $settableOwnerResolver
            ->__invoke($data['owner'], $viewer)
            ->shouldBeCalled()
            ->willReturn($organization)
        ;
        unset($data['owner']);
        $formFactory->create(PostType::class, Argument::type(Post::class))->willReturn($form);
        $form->submit($data, false)->shouldBeCalled();

        $form->isValid()->willReturn(true);

        $em->persist(Argument::type(Post::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $payload = $this->__invoke($input, $viewer);

        $post = $payload['post'];
        $post->getOwner()->shouldReturn($organization);

        $post->shouldHaveType(Post::class);
        $payload['errorCode']->shouldBe(null);
    }

    public function it_should_call_voter(AuthorizationCheckerInterface $authorizationChecker)
    {
        $authorizationChecker
            ->isGranted(PostVoter::CREATE, Argument::type(Post::class))
            ->shouldBeCalled()
            ->willReturn(true)
        ;
        $this->isGranted();
    }
}
