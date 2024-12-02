<?php

namespace Capco\AppBundle\Resolver;

use Doctrine\ORM\EntityManagerInterface;

class EntityChangeSetResolver
{
    public function __construct(private readonly EntityManagerInterface $em)
    {
    }

    public function getEntityChangeSet(object $entity): array
    {
        return $this->em->getUnitOfWork()->getEntityChangeSet($entity);
    }
}
