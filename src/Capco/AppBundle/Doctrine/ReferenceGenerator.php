<?php

namespace Capco\AppBundle\Doctrine;

use Capco\AppBundle\Entity\Proposal;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\Id\AbstractIdGenerator;

class ReferenceGenerator extends AbstractIdGenerator
{
    public function generate(EntityManager $em, $entity)
    {
        if ($entity instanceof Proposal) {
            $proposalForm = $entity->getProposalForm();

            $lastReference = 0;
            foreach ($proposalForm->getProposals() as $proposal) {
                if ($proposal->getReference() > $lastReference) {
                    $lastReference = $proposal->getReference();
                }
            }

            return ++$lastReference;
        }

        $lastEntity = $em->getRepository(get_class($entity))->findOneBy([], ['reference' => 'DESC']);

        if (null === $lastEntity) {
            return 1;
        }

        return $lastEntity->getReference() + 1;
    }
}
