<?php

namespace Capco\AppBundle\Sms;

interface SmsSender
{
    public function send($from, $to, $message);
}
