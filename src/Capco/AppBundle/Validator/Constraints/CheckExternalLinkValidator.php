<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class CheckExternalLinkValidator extends ConstraintValidator
{
    private $container;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    /**
     * Checks if the passed value is valid.
     *
     * @param mixed      $value      The value that should be validated
     * @param Constraint $constraint The constraint for the validation
     */
    public function validate($value, Constraint $constraint)
    {
        $host = $this->container
            ->get('router')
            ->getContext()
            ->getHost();
        if (!isset($value) || strpos($value, $host)) {
            $this->context->buildViolation('available-external-link-required')->addViolation();
        }
    }
}
