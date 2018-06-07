<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Form\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class IsSocialNetworkUrlValidator extends ConstraintValidator
{
    public $patterns = [
        'facebook' => '#^(?:https?:\/\/)?(?:www\.)?facebook\.com\/[A-Za-z0-9\.]+\/?#i',
        'twitter' => '#^(?:https?:\/\/)?twitter\.com\/(?:\#!\/)?[A-Za-z0-9_]+\/?#i',
        'gplus' => '#^(?:https?:\/\/)?plus\.google\.com\/(?:\#!\/)?[A-Za-z0-9_]+\/?#i',
    ];

    public function validate($value, Constraint $constraint)
    {
        if (!$constraint instanceof IsSocialNetworkUrl) {
            throw new UnexpectedTypeException($constraint, __NAMESPACE__ . '\IsSocialNetworkUrl');
        }

        if (null === $value) {
            return;
        }

        if (!in_array($constraint->social_network, $constraint->authorizedNetworks, true)) {
            return;
        }

        $pattern = $this->patterns[$constraint->social_network];

        if (1 === preg_match($pattern, strtolower($value))) {
            return;
        }

        $this->context->addViolation($constraint->getMessage(), []);
    }
}
