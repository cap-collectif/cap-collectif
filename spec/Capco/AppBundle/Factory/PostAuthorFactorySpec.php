<?php

namespace spec\Capco\AppBundle\Factory;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\PostAuthor;
use Capco\AppBundle\Factory\PostAuthorFactory;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class PostAuthorFactorySpec extends ObjectBehavior
{
    public function let(GlobalIdResolver $globalIdResolver, EntityManagerInterface $em)
    {
        $this->beConstructedWith($globalIdResolver, $em);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(PostAuthorFactory::class);
    }

    public function it_should_return_empty_array_if_no_authorsId_given(Post $post, User $viewer)
    {
        $this->findOrCreatePostAuthors($post, [], $viewer)->shouldReturn([]);
    }

    public function it_should_return_post_author_ids_when_called_with_existing_post(
        Post $post,
        User $viewer,
        GlobalIdResolver $globalIdResolver,
        User $author,
        PostAuthor $postAuthor
    ) {
        $globalIdResolver
            ->resolve('author1', $viewer)
            ->shouldBeCalledOnce()
            ->willReturn($author)
        ;
        $post->containAuthor($author)->willReturn(true);
        $post->getPostAuthor($author)->willReturn($postAuthor);
        $postAuthor->getAuthor()->willReturn($author);
        $postAuthor->getPost()->willReturn($post);
        $postAuthor->getId()->willReturn('postAuthorId');

        $this->findOrCreatePostAuthors($post, ['author1'], $viewer)->shouldReturn(['postAuthorId']);
    }

    public function it_should_return_post_author_ids_when_called_with_new_post(
        Post $post,
        User $viewer,
        GlobalIdResolver $globalIdResolver,
        User $author,
        EntityManagerInterface $em,
        PostAuthor $postAuthor
    ) {
        $globalIdResolver
            ->resolve('author1', $viewer)
            ->shouldBeCalledOnce()
            ->willReturn($author)
        ;
        $post->containAuthor($author)->willReturn(false);

        $postAuthor->getAuthor()->willReturn($author);
        $postAuthor->getPost()->willReturn($post);
        $post
            ->addAuthor(Argument::type(PostAuthor::class))
            ->shouldBeCalled()
            ->willReturn($post)
        ;

        $em->persist(Argument::type(PostAuthor::class))->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();

        $payload = $this->findOrCreatePostAuthors($post, ['author1'], $viewer);
        $payload->shouldHaveCount(1);
    }
}
