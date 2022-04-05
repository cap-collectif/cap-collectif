<?php

namespace Capco\AppBundle\Mailer;

use Capco\AppBundle\Entity\ActionToken;
use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Enum\EmailingCampaignStatus;
use Capco\AppBundle\Enum\SendEmailingCampaignErrorCode;
use Capco\AppBundle\GraphQL\Resolver\Project\ProjectContributorResolver;
use Capco\AppBundle\Mailer\Message\EmailingCampaign\EmailingCampaignMessage;
use Capco\AppBundle\Manager\TokenManager;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class EmailingCampaignSender
{
    private MailerService $mailerService;
    private UserRepository $userRepository;
    private SiteParameterResolver $siteParams;
    private RouterInterface $router;
    private TokenManager $tokenManager;
    private ProjectContributorResolver $projectContributorResolver;

    public function __construct(
        MailerService $mailerService,
        UserRepository $userRepository,
        SiteParameterResolver $siteParams,
        RouterInterface $router,
        TokenManager $tokenManager,
        ProjectContributorResolver $projectContributorResolver
    ) {
        $this->mailerService = $mailerService;
        $this->userRepository = $userRepository;
        $this->siteParams = $siteParams;
        $this->router = $router;
        $this->tokenManager = $tokenManager;
        $this->projectContributorResolver = $projectContributorResolver;
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
        $participantIds = [];
        $arg = new Argument([
            'first' => 100,
            'after' => null,
            'orderBy' => [
                'field' => 'CREATED_AT',
                'direction' => 'DESC',
            ],
            'emailConfirmed' => true,
            'consentInternalCommunication' => true,
        ]);
        do {
            $response = $this->projectContributorResolver->__invoke($project, $arg);
            $arg->offsetSet('after', $response->getPageInfo()->getEndCursor());
            foreach ($response->getEdges() as $edge) {
                $id = $edge->getNode()->getId();
                $participantIds[$id] = $id;
            }
        } while ($response->getPageInfo()->getHasNextPage());

        $participants = new ArrayCollection();
        foreach ($participantIds as $participantId) {
            $participant = $this->userRepository->find($participantId);
            if ($participant) {
                $participants->add($participant);
            }
        }

        return $participants;
    }
}
