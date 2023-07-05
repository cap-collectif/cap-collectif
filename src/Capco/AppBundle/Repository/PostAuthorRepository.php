<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\PostAuthor;
use Doctrine\ORM\EntityRepository;

class PostAuthorRepository extends EntityRepository
{
    public function findByAuthorAndPost(Author $author, Post $post): ?PostAuthor
    {
        return $this->createQueryBuilder('pa')
            ->where('pa.post = :post')
            ->andWhere('pa.author = :author OR pa.organization = :author')
            ->setParameters(['author' => $author, 'post' => $post])
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
}
