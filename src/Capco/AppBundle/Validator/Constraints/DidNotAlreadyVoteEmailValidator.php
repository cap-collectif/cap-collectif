<?php

namespace Capco\AppBundle\Validator\Constraints;

use Doctrine\ORM\EntityManager;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class DidNotAlreadyVoteEmailValidator extends ConstraintValidator
{
    private $entityManager;

    public function __construct(EntityManager $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function validate($value, Constraint $constraint)
    {
        if ($value->getEmail() == null) {
            return;
        }

        $votes = $this->entityManager->getRepository('CapcoAppBundle:IdeaVote')->findBy([
            'idea' => $value->getIdea(),
            'email' => $value->getEmail(),
        ]);

        $present = false;
        foreach ($votes as $vote) {
            if ($vote->getId() != $value->getId()) {
                $present = true;
            }
        }

        if ($present) {
            $this->context->addViolationAt('email', $constraint->message, [], null);

            return false;
        }

        return true;
    }
}
