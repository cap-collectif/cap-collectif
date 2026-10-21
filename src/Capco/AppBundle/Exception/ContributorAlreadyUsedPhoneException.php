<?php

namespace Capco\AppBundle\Exception;

class ContributorAlreadyUsedPhoneException extends \Exception
{
    public function __construct()
    {
        parent::__construct('Participant or User already validated this phone number.');
    }
}
