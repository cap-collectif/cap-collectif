<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class CheckExternalLinkValidator extends ConstraintValidator
{
    private $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public function validate($value, Constraint $constraint)
    {
        $host = $this->router->getContext()->getHost();
        if (!isset($value) || strpos($value, $host)) {
            $this->context
                ->buildViolation('available-external-link-required')
                ->atPath('externalLink')
                ->addViolation();
        }
    }
}
