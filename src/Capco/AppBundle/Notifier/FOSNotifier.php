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
use Psr\Log\LoggerInterface;
use Symfony\Component\Routing\RouterInterface;

class FOSNotifier extends BaseNotifier implements MailerInterface
{
    private $userUrlResolver;
    private $logger;

    public function __construct(
        RouterInterface $router,
        MailerService $mailer,
        Resolver $siteParams,
        UserResolver $userResolver,
        UserUrlResolver $userUrlResolver,
        LoggerInterface $logger
    ) {
        parent::__construct($mailer, $siteParams, $userResolver, $router);
        $this->userUrlResolver = $userUrlResolver;
        $this->logger = $logger;
    }

    /**
     * Send an email to a user to confirm the account creation.
     *
     * @param UserInterface $user
     */
    public function sendConfirmationEmailMessage(UserInterface $user)
    {
        if (empty($user->getEmail())) {
            $this->logger->error(__METHOD__.' user email can not be empty');

            return;
        }
        $this->mailer->sendMessage(
            UserRegistrationConfirmationMessage::create(
                $user,
                $user->getEmail(),
                $this->userResolver->resolveRegistrationConfirmationUrl($user),
                $this->siteParams->getValue('global.site.fullname'),
                'Cap Collectif',
                $this->userUrlResolver->__invoke($user),
                $this->router->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL)
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
