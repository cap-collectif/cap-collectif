<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\EmailDomain;
use Capco\AppBundle\Repository\RegistrationFormRepository;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class CheckEmailDomainValidator extends ConstraintValidator
{
    private $toggleManager;
    private $registrationFormRepo;

    public function __construct(
        Manager $toggleManager,
        RegistrationFormRepository $registrationFormRepo
    ) {
        $this->toggleManager = $toggleManager;
        $this->registrationFormRepo = $registrationFormRepo;
    }

    public function validate($email, Constraint $constraint)
    {
        if (null === $email || '' === $email) {
            return;
        }

        if (!$this->toggleManager->isActive('restrict_registration_via_email_domain')) {
            return;
        }

        $form = $this->registrationFormRepo->findCurrent();
        $availableDomains = $form->getDomains()->map(function (EmailDomain $element) {
            return $element->getValue();
        });

        list($local, $domain) = explode('@', $email);
        if ($availableDomains->contains($domain)) {
            return;
        }

        $this->context->buildViolation($constraint->message)->addViolation();
    }
}
