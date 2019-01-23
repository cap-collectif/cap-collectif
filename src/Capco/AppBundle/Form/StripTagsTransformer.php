<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\DataTransformerInterface;

class StripTagsTransformer implements DataTransformerInterface
{
    public function transform($value)
    {
        return $value;
    }

    public function reverseTransform($value)
    {
        return $value ? strip_tags($value) : null;
    }
}
