<?php

namespace Capco\AppBundle\Factory;

use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\PostAuthor;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class PostAuthorFactory
{
    public function __construct(private readonly GlobalIdResolver $globalIdResolver, private readonly EntityManagerInterface $em)
    {
    }

    public function findOrCreatePostAuthors(Post $post, array $authorsId, User $viewer): array
    {
        if (empty($authorsId)) {
            return [];
        }
        $postsAuthors = [];
        foreach ($authorsId as $authorId) {
            $author = $this->globalIdResolver->resolve($authorId, $viewer);
            if (!$author instanceof Author) {
                continue;
            }
            $postAuthor = $this->getPostAuthor($author, $post);
            $postsAuthors[] = $postAuthor;
        }
        $this->em->flush();

        return array_map(function (PostAuthor $postAuthor) {
            return $postAuthor->getId();
        }, $postsAuthors);
    }

    private function getPostAuthor(Author $author, Post $post): ?PostAuthor
    {
        if ($post->containAuthor($author)) {
            return $post->getPostAuthor($author);
        }

        $postAuthor = PostAuthor::create($post, $author);
        $this->em->persist($postAuthor);

        return $postAuthor;
    }
}
