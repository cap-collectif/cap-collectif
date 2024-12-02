<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Event\PreFlushEventArgs;

class ReferenceEventListener
{
    final public const REFERENCE_TRAIT = 'Capco\AppBundle\Traits\ReferenceTrait';

    private $lastProposals = [];
    private $lastProposalFormsReferences = [];

    public function preFlush(PreFlushEventArgs $args)
    {
        $om = $args->getEntityManager();
        $uow = $args->getEntityManager()->getUnitOfWork();

        foreach ($uow->getScheduledEntityInsertions() as $entityInsertion) {
            $classMetaData = $om->getClassMetadata($entityInsertion::class);

            // if entity has Reference Trait & has not already a reference (specific case in fixtures)
            if (
                $this->hasTrait($classMetaData->getReflectionClass())
                && !$entityInsertion->getReference()
            ) {
                $this->updateReferenceIsNecessary($om, $entityInsertion);
            }
        }
    }

    private function updateReferenceIsNecessary(EntityManagerInterface $om, $entity)
    {
        if ($entity instanceof Proposal) {
            $proposalForm = $entity->getProposalForm();

            $proposalFormRep = $om->getRepository('CapcoAppBundle:ProposalForm');

            if (isset($this->lastProposals[$proposalForm->getId()])) {
                $lastReference = $this->lastProposals[$proposalForm->getId()];
            } else {
                // Disable the built-in softdelete
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
            ->getRepository($entity::class)
            ->findOneBy([], ['reference' => 'DESC'])
        ;

        if ($entity instanceof ProposalForm) {
            if (!empty($this->lastProposalFormsReferences)) {
                $entity->setReference(end($this->lastProposalFormsReferences) + 1);
                $this->lastProposalFormsReferences[] = $entity->getReference();

                return;
            }
            if (null === $lastEntity) {
                $entity->setReference(1);
            } else {
                $entity->setReference($lastEntity->getReference() + 1);
            }

            $this->lastProposalFormsReferences[] = $entity->getReference();

            return;
        }

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
