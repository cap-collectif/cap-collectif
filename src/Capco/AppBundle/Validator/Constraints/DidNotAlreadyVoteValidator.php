<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\ProposalVote;
use Doctrine\ORM\EntityManager;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\PropertyAccess\PropertyAccess;

class DidNotAlreadyVoteValidator extends ConstraintValidator
{
    private $entityManager;

    public function __construct(EntityManager $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function validate($object, Constraint $constraint)
    {
        $accessor = PropertyAccess::createPropertyAccessor();

        $votes = [];

        $data = [
            $constraint->objectPath => $accessor->getValue($object, $constraint->objectPath),
        ];
        if ($object->hasUser()) {
            $data['user'] = $object->getUser();
        } elseif ($object->getEmail()) {
            $data['email'] = $object->getEmail();
        } else {
            return true;
        }

        // Data specific to proposal votes
        if ($object instanceof ProposalVote) {
            $data['selectionStep'] = $object->getSelectionStep();
        }

        $votes = $this->entityManager->getRepository($constraint->repositoryPath)->findBy($data);

        foreach ($votes as $vote) {
            if ($vote->getId() != $object->getId()) {
                $this->context
                    ->buildViolation($constraint->message)
                    ->atPath('email')
                    ->addViolation()
                ;

                return false;
            }
        }

        return true;
    }
}
