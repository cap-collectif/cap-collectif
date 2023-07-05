<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Factory\PostAuthorFactory;
use Capco\AppBundle\Form\PostType;
use Capco\AppBundle\GraphQL\Mutation\UpdatePostMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Security\PostVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\Form;
use Symfony\Component\Form\FormErrorIterator;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;

class UpdatePostMutationSpec extends ObjectBehavior
{
    private $data = [
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
    ];

    public function let(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        GlobalIdResolver $globalIdResolver,
        AuthorizationChecker $authorizationChecker,
        PostAuthorFactory $postAuthorFactory,
        LoggerInterface $logger
    ) {
        $this->beConstructedWith(
            $em,
            $formFactory,
            $globalIdResolver,
            $authorizationChecker,
            $postAuthorFactory,
            $logger
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(UpdatePostMutation::class);
    }

    public function it_should_update_post(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        User $viewer,
        Post $post,
        FormFactoryInterface $formFactory,
        Form $form,
        PostAuthorFactory $postAuthorFactory
    ) {
        $id = 'abc';
        $input->offsetGet('id')->willReturn($id);
        $globalIdResolver->resolve($id, $viewer)->willReturn($post);

        $input->getArrayCopy()->willReturn($this->data);
        $input->offsetGet('authors')->willReturn(['VXNlcjp1c2VyVGhlbw==']);

        $postAuthorFactory
            ->findOrCreatePostAuthors($post, ['VXNlcjp1c2VyVGhlbw=='], $viewer)
            ->shouldBeCalledOnce()
            ->willReturn(['postAuthorId'])
        ;

        $data = $this->data;
        $data['authors'] = ['postAuthorId'];

        $formFactory->create(PostType::class, $post)->willReturn($form);
        $form->submit($data, false)->shouldBeCalled();

        $form->isValid()->willReturn(true);

        $em->flush()->shouldBeCalled();

        $this->__invoke($input, $viewer)->shouldReturn([
            'post' => $post,
        ]);
    }

    public function it_should_return_invalid_form_error_code(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        User $viewer,
        Post $post,
        FormFactoryInterface $formFactory,
        Form $form,
        PostAuthorFactory $postAuthorFactory,
        LoggerInterface $logger,
        FormErrorIterator $formErrorIterator
    ) {
        $id = 'abc';
        $input->offsetGet('id')->willReturn($id);
        $globalIdResolver->resolve($id, $viewer)->willReturn($post);

        $input->getArrayCopy()->willReturn($this->data);
        $input->offsetGet('authors')->willReturn(['VXNlcjp1c2VyVGhlbw==']);

        $postAuthorFactory
            ->findOrCreatePostAuthors($post, ['VXNlcjp1c2VyVGhlbw=='], $viewer)
            ->shouldBeCalledOnce()
            ->willReturn(['postAuthorId'])
        ;

        $data = $this->data;
        $data['authors'] = ['postAuthorId'];

        $formFactory->create(PostType::class, $post)->willReturn($form);
        $form->submit($data, false)->shouldBeCalled();

        $form->isValid()->willReturn(false);
        $form->getErrors(true, false)->willReturn($formErrorIterator);
        $formErrorIterator->__toString()->willReturn('error');
        $logger->error(Argument::any())->shouldBeCalled();

        $em->flush()->shouldNotBeCalled();

        $this->__invoke($input, $viewer)->shouldReturn([
            'post' => null,
            'errorCode' => 'INVALID_FORM',
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
        $authorizationChecker->isGranted(PostVoter::EDIT, $post)->shouldBeCalled();

        $this->isGranted($postId, $viewer);
    }
}
