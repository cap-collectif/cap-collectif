<?php

namespace Capco\AppBundle\Form\DataTransformer;

use Doctrine\ORM\EntityManager;
use Symfony\Component\Form\DataTransformerInterface;
use Symfony\Component\Form\Exception\TransformationFailedException;

class EntityToIdTransformer implements DataTransformerInterface
{
    private $em;
    private $entityClass;
    private $entityRepository;

    public function __construct(EntityManager $em)
    {
        $this->em = $em;
    }

    public function transform($entity)
    {
        if (null === $entity || !$entity instanceof $this->entityClass) {
            return;
        }

        return $entity->getId();
    }

    public function reverseTransform($id)
    {
        if (!$id) {
            return;
        }

        $entity = $this->em->getRepository($this->entityRepository)->findOneBy(['id' => $id]);

        if (null === $entity) {
            throw new TransformationFailedException(sprintf(
                'No entity of class %s with id "%s".',
                $this->entityClass,
                $id
            ));
        }

        return $entity;
    }

    public function setEntityClass($entityClass)
    {
        $this->entityClass = $entityClass;
    }

    public function setEntityRepository($entityRepository)
    {
        $this->entityRepository = $entityRepository;
    }
}
