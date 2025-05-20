<?php

namespace Capco\AppBundle\Exception;

use Exception;

final class UnserializableException extends Exception
{
    public function __construct()
    {
        parent::__construct('Given content is not unserializable.');
    }
}
