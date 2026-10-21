<?php

namespace Capco\AppBundle\Exception;

class ParticipantNotFoundException extends \Exception
{
    public function __construct()
    {
        parent::__construct('Participant not found.');
    }
}
