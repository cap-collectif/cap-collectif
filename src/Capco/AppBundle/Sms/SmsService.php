<?php

namespace Capco\AppBundle\Sms;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\SiteParameter\Resolver;

class SmsService
{
    protected $sender;
    protected $number;
    protected $sitename;

    public function __construct(SmsSender $sender, $number, Resolver $resolver)
    {
        $this->sender = $sender;
        $this->number = $number;
        $this->sitename = $resolver->getValue('global.site.fullname');
    }

    public function confirm(User $user)
    {
        $code = rand(100000, 999999);
        $user->setSmsConfirmationCode($code);
        $message = $this->sitename . ' Votre code de confirmation est ' . $code . '.';
        $this->sender->send($this->number, $user->getPhone(), $message);
    }

}
