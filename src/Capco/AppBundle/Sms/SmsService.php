<?php

namespace Capco\AppBundle\Sms;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\Translation\TranslatorInterface;

class SmsService
{
    protected $sender;
    protected $number;
    protected $sitename;
    protected $translator;

    public function __construct(SmsSender $sender, $number, Resolver $resolver, TranslatorInterface $translator)
    {
        $this->sender = $sender;
        $this->number = $number;
        $this->sitename = $resolver->getValue('global.site.fullname');
        $this->translator = $translator;
    }

    public function confirm(User $user)
    {
        $code = random_int(100000, 999999);
        $user->setSmsConfirmationCode($code);
        $message = $this->translator->trans('sms.content', [
          '%code%' => $code,
          '%sitename%' => $this->sitename,
        ], 'CapcoAppBundle');
        $this->sender->send($this->number, $user->getPhone(), $message);
    }
}
