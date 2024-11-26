<?php

namespace Capco\AppBundle\Resolver;

use Doctrine\ORM\EntityManagerInterface;

class EntityChangeSetResolver
{
    private readonly EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function getEntityChangeSet(object $entity): array
    {
        return $this->em->getUnitOfWork()->getEntityChangeSet($entity);
    }
}
