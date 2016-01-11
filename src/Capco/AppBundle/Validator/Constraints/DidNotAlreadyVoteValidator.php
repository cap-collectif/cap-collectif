<?php

namespace Capco\AppBundle\Validator\Constraints;

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

        if ($object->hasUser()) {
            $votes = $this->entityManager->getRepository($constraint->repositoryPath)->findBy([
                $constraint->objectPath => $accessor->getValue($object, $constraint->objectPath),
                'user' => $object->getUser(),
            ]);
        } else {
            $votes = $this->entityManager->getRepository($constraint->repositoryPath)->findBy([
                $constraint->objectPath => $accessor->getValue($object, $constraint->objectPath),
                'email' => $object->getEmail(),
            ]);
        }

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
