<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\ProposalSelectionVote;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PropertyAccess\PropertyAccess;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class DidNotAlreadyVoteValidator extends ConstraintValidator
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager
    ) {
    }

    public function validate($object, Constraint $constraint)
    {
        $accessor = PropertyAccess::createPropertyAccessor();

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
        if ($object instanceof ProposalSelectionVote) {
            $data['selectionStep'] = $object->getSelectionStep();
        }

        $votes = $this->entityManager->getRepository($constraint->repositoryPath)->findBy($data);

        foreach ($votes as $vote) {
            if ($vote->getId() !== $object->getId()) {
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
