<?php

namespace Capco\AppBundle\Toggle;

use Capco\UserBundle\Entity\User;

class SmsService
{
    protected $sender;
    protected $number;

    public function __construct(SmsSender $sender, $number)
    {
        $this->sender = $sender;
        $this->number = $number;
    }

    public function confirm(User $user)
    {
        $code = 123456;
        $user->setSmsConfirmationCode($code);
        $message = 'Hey coucou voici ton code: ' . $code;
        $this->sender->send($this->number, $user->getPhone(), $message);
    }

}
