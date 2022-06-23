<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\Organization\PendingOrganizationInvitation;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class PendingOrganizationInvitationValidator extends ConstraintValidator
{
    public function validate($pendingInvitaton, Constraint $constraint)
    {
        if (
            ($pendingInvitaton instanceof PendingOrganizationInvitation &&
                ($pendingInvitaton->getEmail() && $pendingInvitaton->getUser())) ||
            (!$pendingInvitaton->getEmail() && !$pendingInvitaton->getUser())
        ) {
            $this->context
                ->buildViolation($constraint->message)
                ->atPath('email')
                ->atPath('user')
                ->addViolation();
        }
    }
}
