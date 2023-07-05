<?php

namespace Capco\AppBundle\Utils;

use FOS\UserBundle\Util\CanonicalizerInterface;

class Canonicalizer implements CanonicalizerInterface
{
    // We authorize null value

    /**
     * {@inheritdoc}
     */
    public function canonicalize($string)
    {
        if (null === $string) {
            return null;
        }
        $encoding = mb_detect_encoding($string, mb_detect_order(), true);

        return $encoding
            ? mb_convert_case($string, \MB_CASE_LOWER, $encoding)
            : mb_convert_case($string, \MB_CASE_LOWER);
    }
}
