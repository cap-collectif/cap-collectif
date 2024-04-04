<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Form\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class IsSocialNetworkUrlValidator extends ConstraintValidator
{
    public array $patterns = [
        'facebookUrl' => '#^(?:https?:\/\/)?(?:www\.)?(mbasic.facebook|m\.facebook|facebook|fb)\.(com|me)\/[A-Za-z0-9\.]+\/?#i',
        'twitterUrl' => '#^(?:https?:\/\/)?(?:www\.)?(mbasic.twitter|m\.twitter|twitter|x)\.(com|me)\/(?:\#!\/)?[A-Za-z0-9_]+\/?#i',
        'instagramUrl' => '#^(?:https?:\/\/)?(?:www\.)?(mbasic.instagram|m\.instagram|instagram)\.(com|me)\/(?:\#!\/)?[A-Za-z0-9_]+\/?#i',
        'youtubeUrl' => '#^(?:https?:\/\/)?(?:www\.)?(mbasic.youtube|m\.youtube|youtube)\.(com|me)\/(?:\#!\/)?[A-Za-z0-9_]+\/?#i',
        'linkedInUrl' => '#^(?:https?:\/\/)?(?:(www|fr)\.)?(mbasic.linkedin|m\.linkedin|linkedin)\.(com|me)\/(?:\#!\/)?[A-Za-z0-9_]+\/?#i',
    ];

    public function validate($value, Constraint $constraint)
    {
        if (!$constraint instanceof IsSocialNetworkUrl) {
            throw new UnexpectedTypeException($constraint, __NAMESPACE__ . '\IsSocialNetworkUrl');
        }

        if (null === $value) {
            return;
        }

        if (!\in_array($constraint->social_network, $constraint->authorizedNetworks, true)) {
            return;
        }
        $pattern = null;
        if (isset($this->patterns[$constraint->social_network])) {
            $pattern = $this->patterns[$constraint->social_network];
        }

        if ($pattern && 1 === preg_match($pattern, strtolower($value))) {
            return;
        }

        if (
            'webPageUrl' === $constraint->social_network
            && filter_var($value, \FILTER_VALIDATE_URL)
        ) {
            return;
        }

        $this->context->buildViolation($constraint->getMessage())->addViolation();
    }
}
