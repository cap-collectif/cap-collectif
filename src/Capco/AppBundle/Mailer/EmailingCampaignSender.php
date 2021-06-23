<?php

namespace Capco\AppBundle\Mailer;

use Capco\AppBundle\Entity\ActionToken;
use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Enum\EmailingCampaignStatus;
use Capco\AppBundle\Enum\SendEmailingCampaignErrorCode;
use Capco\AppBundle\Mailer\Message\EmailingCampaign\EmailingCampaignMessage;
use Capco\AppBundle\Manager\TokenManager;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use GraphQL\Error\UserError;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class EmailingCampaignSender
{
    private MailerService $mailerService;
    private UserRepository $userRepository;
    private SiteParameterResolver $siteParams;
    private RouterInterface $router;
    private TokenManager $tokenManager;

    public function __construct(
        MailerService $mailerService,
        UserRepository $userRepository,
        SiteParameterResolver $siteParams,
        RouterInterface $router,
        TokenManager $tokenManager
    ) {
        $this->mailerService = $mailerService;
        $this->userRepository = $userRepository;
        $this->siteParams = $siteParams;
        $this->router = $router;
        $this->tokenManager = $tokenManager;
    }

    public function send(EmailingCampaign $emailingCampaign): EmailingCampaign
    {
        foreach ($this->getRecipients($emailingCampaign) as $recipient) {
            $this->createAndSendMessage($emailingCampaign, $recipient);
        }

        return $this->setCampaignAsSent($emailingCampaign);
    }

    private function createAndSendMessage(
        EmailingCampaign $emailingCampaign,
        User $recipient
    ): EmailingCampaignMessage {
        $message = new EmailingCampaignMessage($emailingCampaign, [
            'baseUrl' => $this->router->generate(
                'app_homepage',
                [],
                UrlGeneratorInterface::ABSOLUTE_URL
            ),
            'siteUrl' => $this->router->generate(
                'app_homepage',
                [],
                UrlGeneratorInterface::ABSOLUTE_URL
            ),
            'unsubscribeUrl' => $this->router->generate(
                'capco_app_action_token',
                [
                    'token' => $this->tokenManager
                        ->getOrCreateActionToken($recipient, ActionToken::UNSUBSCRIBE)
                        ->getToken(),
                ],
                UrlGeneratorInterface::ABSOLUTE_URL
            ),
            'siteName' => $this->siteParams->getValue('global.site.fullname'),
        ]);
        $message->addRecipient(
            $recipient->getEmail(),
            $recipient->getLocale(),
            $recipient->getUsername()
        );

        $this->mailerService->sendMessage($message);

        return $message;
    }

    private function setCampaignAsSent(EmailingCampaign $emailingCampaign): EmailingCampaign
    {
        $emailingCampaign->setSendAt(new \DateTime());
        $emailingCampaign->setStatus(EmailingCampaignStatus::SENT);

        return $emailingCampaign;
    }

    private function getRecipients(EmailingCampaign $emailingCampaign): Collection
    {
        if ($emailingCampaign->getMailingList()) {
            return $emailingCampaign->getMailingList()->getUsersWithValidEmail(true);
        }
        if ($emailingCampaign->getMailingInternal()) {
            return $this->getRecipientsFromInternalList($emailingCampaign->getMailingInternal());
        }

        throw new UserError(SendEmailingCampaignErrorCode::CANNOT_BE_SENT);
    }

    private function getRecipientsFromInternalList(string $internalList): Collection
    {
        return new ArrayCollection(
            ($users = $this->userRepository->getFromInternalList($internalList))
        );
    }
}
