<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class PendingOrganizationInvitation extends Constraint
{
    public $message = 'must-contain-user-or-email-not-both';

    public function validatedBy()
    {
        return PendingOrganizationInvitationValidator::class;
    }
}
