<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Proposal;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\Event\PreFlushEventArgs;

class ReferenceEventListener
{
    const REFERENCE_TRAIT = 'Capco\AppBundle\Traits\ReferenceTrait';

    private $lastProposals = [];

    public function preFlush(PreFlushEventArgs $args)
    {
        $om = $args->getEntityManager();
        $uow = $args->getEntityManager()->getUnitOfWork();

        foreach ($uow->getScheduledEntityInsertions() as $entityInsertion) {
            $classMetaData = $om->getClassMetadata(\get_class($entityInsertion));

            // if entity has Reference Trait & has not already a reference (specific case in fixtures)
            if (
                $this->hasTrait($classMetaData->getReflectionClass()) &&
                !$entityInsertion->getReference()
            ) {
                $this->updateReferenceIsNecessary($om, $entityInsertion);
            }
        }
    }

    private function updateReferenceIsNecessary(EntityManager $om, $entity)
    {
        if ($entity instanceof Proposal) {
            $proposalForm = $entity->getProposalForm();

            $proposalFormRep = $om->getRepository('CapcoAppBundle:ProposalForm');

            if (isset($this->lastProposals[$proposalForm->getId()])) {
                $lastReference = $this->lastProposals[$proposalForm->getId()];
            } else {
                $filters = $om->getFilters();
                if ($filters->isEnabled('softdeleted')) {
                    $filters->disable('softdeleted');
                }
                $lastReference = $proposalFormRep->getLastProposalReference($proposalForm->getId());
            }

            $entity->setReference($lastReference + 1);
            $this->lastProposals[$proposalForm->getId()] = $lastReference + 1;

            return;
        }

        $lastEntity = $om
            ->getRepository(\get_class($entity))
            ->findOneBy([], ['reference' => 'DESC']);

        if (null === $lastEntity) {
            $entity->setReference(1);
        } else {
            $entity->setReference($lastEntity->getReference() + 1);
        }
    }

    private function hasTrait(\ReflectionClass $reflectionClass): bool
    {
        if (\in_array(self::REFERENCE_TRAIT, $reflectionClass->getTraitNames(), true)) {
            return true;
        }

        return false;
    }
}
