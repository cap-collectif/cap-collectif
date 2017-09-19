<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Proposal;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\Event\LifecycleEventArgs;

class ReferenceEventListener
{
    const REFERENCE_TRAIT = 'Capco\AppBundle\Traits\ReferenceTrait';

    public function prePersist(LifecycleEventArgs $args)
    {
        $entity = $args->getEntity();
        $om = $args->getEntityManager();

        $classMetaData = $om->getClassMetadata(get_class($entity));

        if (!$this->hasTrait($classMetaData->getReflectionClass())) {
            return;
        }

        if ($entity->getReference() === null) {
            $this->updateReferenceIsNecessary($om, $entity);
        }
    }

    private function updateReferenceIsNecessary(EntityManager $om, $entity)
    {
        if ($entity instanceof Proposal) {
            $proposalForm = $entity->getProposalForm();

            $lastReference = 0;
            foreach ($proposalForm->getProposals() as $proposal) {
                if ($proposal->getReference() > $lastReference) {
                    $lastReference = $proposal->getReference();
                }
            }

            $entity->setReference($lastReference + 1);
        }

        $lastEntity = $om->getRepository(get_class($entity))->findOneBy([], ['reference' => 'DESC']);

        if (null === $lastEntity) {
            $entity->setReference(1);
        }

        $entity->setReference($lastEntity->getReference() + 1);
    }

    private function hasTrait(\ReflectionClass $reflectionClass): bool
    {
        if (in_array(self::REFERENCE_TRAIT, $reflectionClass->getTraitNames(), true)) {
            return true;
        }

        return false;
    }
}
