<?php

namespace Capco\AppBundle\Mailer;

use Capco\AppBundle\Entity\ActionToken;
use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Enum\EmailingCampaignStatus;
use Capco\AppBundle\Enum\SendEmailingCampaignErrorCode;
use Capco\AppBundle\GraphQL\Resolver\Project\ProjectEmailableContributorsResolver;
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
    private ProjectEmailableContributorsResolver $projectEmailableContributorsResolver;

    public function __construct(
        MailerService $mailerService,
        UserRepository $userRepository,
        SiteParameterResolver $siteParams,
        RouterInterface $router,
        TokenManager $tokenManager,
        ProjectEmailableContributorsResolver $projectEmailableContributorsResolver
    ) {
        $this->mailerService = $mailerService;
        $this->userRepository = $userRepository;
        $this->siteParams = $siteParams;
        $this->router = $router;
        $this->tokenManager = $tokenManager;
        $this->projectEmailableContributorsResolver = $projectEmailableContributorsResolver;
    }

    public function send(EmailingCampaign $emailingCampaign): int
    {
        $recipients = $this->getRecipients($emailingCampaign);
        foreach ($recipients as $recipient) {
            $this->createAndSendMessage($emailingCampaign, $recipient);
        }

        $this->setCampaignAsSent($emailingCampaign);

        return $recipients->count();
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
            'unsubscribeUrl' => $this->getUnsubscribeUrl($recipient),
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

    private function getUnsubscribeUrl(User $user): string
    {
        if ($user->getId()) {
            $parameters = [
                'token' => $this->tokenManager
                    ->getOrCreateActionToken($user, ActionToken::UNSUBSCRIBE)
                    ->getToken(),
            ];
            $route = 'capco_app_action_token';
        } else {
            //user without account, token is put in password
            $parameters = [
                'token' => $user->getPassword(),
                'email' => $user->getEmail(),
            ];
            $route = 'capco_app_unsubscribe_anonymous';
        }

        return $this->router->generate($route, $parameters, UrlGeneratorInterface::ABSOLUTE_URL);
    }

    private function getRecipients(EmailingCampaign $emailingCampaign): Collection
    {
        if ($emailingCampaign->getMailingList()) {
            return $emailingCampaign->getMailingList()->getUsersWithValidEmail(true);
        }
        if ($emailingCampaign->getMailingInternal()) {
            return $this->getRecipientsFromInternalList($emailingCampaign->getMailingInternal());
        }
        if ($emailingCampaign->getEmailingGroup()) {
            return $this->getRecipientsFromUserGroup($emailingCampaign->getEmailingGroup());
        }
        if ($emailingCampaign->getProject()) {
            return $this->getRecipientsFromProject($emailingCampaign->getProject());
        }

        throw new UserError(SendEmailingCampaignErrorCode::CANNOT_BE_SENT);
    }

    private function getRecipientsFromInternalList(string $internalList): Collection
    {
        return new ArrayCollection(
            ($users = $this->userRepository->getFromInternalList($internalList))
        );
    }

    private function getRecipientsFromUserGroup(Group $group): Collection
    {
        return new ArrayCollection(
            ($users = $this->userRepository->getUsersInGroup($group, 0, 1000, true))
        );
    }

    private function getRecipientsFromProject(Project $project): Collection
    {
        $participantsData = $this->projectEmailableContributorsResolver->getContributors(
            $project,
            null,
            null
        );
        $participants = new ArrayCollection();
        foreach ($participantsData as $participantsDatum) {
            $email = $participantsDatum['email'];
            $user = $this->userRepository->findOneByEmail($email);
            if (null === $user) {
                $user = new User();
                $user->setEmail($email);
                $user->setPassword($participantsDatum['token']);
            }
            $participants->add($user);
        }

        return $participants;
    }
}
