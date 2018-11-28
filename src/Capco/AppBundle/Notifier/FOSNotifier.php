<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\User\UserRegistrationConfirmationMessage;
use Capco\AppBundle\Mailer\Message\User\UserResettingPasswordMessage;
use Capco\AppBundle\SiteParameter\Resolver;
use FOS\UserBundle\Mailer\MailerInterface;
use FOS\UserBundle\Model\UserInterface;

class FOSNotifier extends BaseNotifier implements MailerInterface
{
    private $userUrlResolver;

    public function __construct(
        MailerService $mailer,
        Resolver $siteParams,
        UserResolver $userResolver,
        UserUrlResolver $userUrlResolver
    ) {
        parent::__construct($mailer, $siteParams, $userResolver);
        $this->userUrlResolver = $userUrlResolver;
    }

    /**
     * Send an email to a user to confirm the account creation.
     *
     * @param UserInterface $user
     */
    public function sendConfirmationEmailMessage(UserInterface $user)
    {
        $this->mailer->sendMessage(
            UserRegistrationConfirmationMessage::create(
                $user,
                $user->getEmail(),
                $this->userResolver->resolveRegistrationConfirmationUrl($user),
                $this->siteParams->getValue('global.site.fullname'),
                'Cap Collectif',
                $this->userUrlResolver->__invoke($user)
            )
        );
    }

    /**
     * Send an email to a user to confirm the password reset.
     *
     * @param UserInterface $user
     */
    public function sendResettingEmailMessage(UserInterface $user)
    {
        $this->mailer->sendMessage(
            UserResettingPasswordMessage::create(
                $user,
                $user->getEmail(),
                $this->userResolver->resolveResettingPasswordUrl($user)
            )
        );
    }
}
