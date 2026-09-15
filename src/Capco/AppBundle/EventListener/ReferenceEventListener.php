<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Event\PreFlushEventArgs;

class ReferenceEventListener
{
    final public const REFERENCE_TRAIT = 'Capco\AppBundle\Traits\ReferenceTrait';

    private $lastProposalFormsReferences = [];

    public function preFlush(PreFlushEventArgs $args)
    {
        $om = $args->getEntityManager();
        $uow = $args->getEntityManager()->getUnitOfWork();

        foreach ($uow->getScheduledEntityInsertions() as $entityInsertion) {
            $classMetaData = $om->getClassMetadata($entityInsertion::class);

            if (!$this->hasTrait($classMetaData->getReflectionClass())) {
                continue;
            }

            if ($entityInsertion instanceof Proposal && $entityInsertion->getReference()) {
                $this->synchronizeProposalFormReference($om, $entityInsertion);

                continue;
            }

            // Explicit references are used by fixtures and must not be replaced.
            if (!$entityInsertion->getReference()) {
                $this->updateReferenceIsNecessary($om, $entityInsertion);
            }
        }
    }

    private function synchronizeProposalFormReference(EntityManagerInterface $om, Proposal $proposal): void
    {
        $proposalForm = $proposal->getProposalForm();
        $reference = $proposal->getReference();

        if ($om->getUnitOfWork()->isScheduledForInsert($proposalForm)) {
            $proposalForm->synchronizeLastProposalReference($reference);

            return;
        }

        $om
            ->getRepository('CapcoAppBundle:ProposalForm')
            ->synchronizeLastProposalReference($proposalForm->getId(), $reference)
        ;
    }

    private function updateReferenceIsNecessary(EntityManagerInterface $om, $entity)
    {
        if ($entity instanceof Proposal) {
            $proposalForm = $entity->getProposalForm();

            $proposalFormRep = $om->getRepository('CapcoAppBundle:ProposalForm');

            $nextReference = $proposalFormRep->allocateNextProposalReference($proposalForm->getId());
            if (null === $nextReference) {
                if (!$om->getUnitOfWork()->isScheduledForInsert($proposalForm)) {
                    throw new \LogicException('Cannot allocate a proposal reference for an unknown proposal form.');
                }

                $nextReference = $proposalForm->allocateNextProposalReference();
            }

            $entity->setReference($nextReference);

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
