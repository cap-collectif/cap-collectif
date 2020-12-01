<?php

namespace Capco\AppBundle\Mailer;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Enum\EmailingCampaignStatus;
use Capco\AppBundle\Enum\SendEmailingCampaignErrorCode;
use Capco\AppBundle\Mailer\Message\EmailingCampaign\EmailingCampaignMessage;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
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

    public function __construct(
        MailerService $mailerService,
        UserRepository $userRepository,
        SiteParameterResolver $siteParams,
        RouterInterface $router
    ) {
        $this->mailerService = $mailerService;
        $this->userRepository = $userRepository;
        $this->siteParams = $siteParams;
        $this->router = $router;
    }

    public function send(EmailingCampaign $emailingCampaign): EmailingCampaign
    {
        $this->mailerService->sendMessage($this->createMessage($emailingCampaign));

        return $this->setCampaignAsSent($emailingCampaign);
    }

    private function createMessage(EmailingCampaign $emailingCampaign): EmailingCampaignMessage
    {
        $message = new EmailingCampaignMessage($emailingCampaign, [
            'baseUrl' => $this->router->generate('app_homepage', [], UrlGeneratorInterface::ABSOLUTE_URL),
            'siteUrl' => $this->router->generate('app_homepage', [], UrlGeneratorInterface::ABSOLUTE_URL),
            'siteName' => $this->siteParams->getValue('global.site.fullname'),
        ]);
        $message->setRecipients($this->getRecipients($emailingCampaign));

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
            return $emailingCampaign->getMailingList()->getUsers();
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
