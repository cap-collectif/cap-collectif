<?php

namespace Capco\AppBundle\Mailer;

use Capco\AppBundle\Entity\ActionToken;
use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Entity\EmailingCampaignUser;
use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Enum\EmailingCampaignStatus;
use Capco\AppBundle\Enum\SendEmailingCampaignErrorCode;
use Capco\AppBundle\GraphQL\Resolver\Project\ProjectEmailableContributorsResolver;
use Capco\AppBundle\Mailer\Message\EmailingCampaign\EmailingCampaignMessage;
use Capco\AppBundle\Manager\TokenManager;
use Capco\AppBundle\Repository\EmailingCampaignUserRepository;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Psr\Log\LoggerInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class EmailingCampaignSender
{
    public function __construct(
        private readonly MailerService $mailerService,
        private readonly UserRepository $userRepository,
        private readonly SiteParameterResolver $siteParams,
        private readonly RouterInterface $router,
        private readonly TokenManager $tokenManager,
        private readonly ProjectEmailableContributorsResolver $projectEmailableContributorsResolver,
        private readonly EntityManagerInterface $em,
        private readonly EmailingCampaignUserRepository $emailingCampaignUserRepository,
        private readonly LoggerInterface $logger,
        private readonly ParticipantRepository $participantRepository,
    ) {
    }

    public function send(EmailingCampaign $emailingCampaign): int
    {
        $batchSize = 500;
        $totalCount = 0;

        do {
            $emailingCampaignUsers = $this->getEmailingCampaignUsersUnsent($emailingCampaign, $batchSize);
            $this->logger->debug('$totalCount: ' . $totalCount);
            $this->logger->debug(sprintf('Memory: %s', memory_get_usage(true)));

            $count = 0;
            /** * @var EmailingCampaignUser $emailingCampaignUser  */
            foreach ($emailingCampaignUsers as $emailingCampaignUser) {
                ++$count;
                $this->createAndSendMessage($emailingCampaign, $emailingCampaignUser->getContributor());

                $emailingCampaignUser->setSentAt(new \DateTime());
                $this->em->persist($emailingCampaignUser);
                if (0 === $count % 50) {
                    $this->em->flush();
                }
            }
            $this->em->flush();

            $totalCount += $emailingCampaignUsers->count();
        } while (0 < $emailingCampaignUsers->count());

        $this->setCampaignAsSent($emailingCampaign);

        return $totalCount;
    }

    /**
     * @return ArrayCollection<int, EmailingCampaignUser>
     */
    public function getEmailingCampaignUsersUnsent(EmailingCampaign $emailingCampaign, int $maxResults = 0): ArrayCollection
    {
        $allRecipients = $this->getRecipients($emailingCampaign);

        $emailingCampaignUsersCount = $this->emailingCampaignUserRepository->countAllByEmailingCampaign($emailingCampaign);

        if (0 === $emailingCampaignUsersCount) {
            $emailingCampaignUsers = new ArrayCollection();
            foreach ($allRecipients as $recipient) {
                $emailingCampaignUser = (new EmailingCampaignUser())->setEmailingCampaign($emailingCampaign);
                if ($recipient instanceof User) {
                    $emailingCampaignUser->setUser($recipient);
                } elseif ($recipient instanceof Participant) {
                    $emailingCampaignUser->setParticipant($recipient);
                }

                $emailingCampaignUsers->add($emailingCampaignUser);
                $this->em->persist($emailingCampaignUser);
            }
            $this->em->flush();
        }

        return $this->emailingCampaignUserRepository->findUnsentByEmailingCampaign($emailingCampaign, $maxResults);
    }

    // todo this method is made public by the issue implementing the tests: #18817
    // todo it will be refactoed as a separate service in the Mailjet implementation: #18611
    public function getRecipients(EmailingCampaign $emailingCampaign): Collection
    {
        if ($emailingCampaign->getMailingList()) {
            return $emailingCampaign->getMailingList()->getUsersWithValidEmail(true);
        }
        if ($emailingCampaign->getMailingInternal()) {
            return $this->getRecipientsFromInternalList();
        }
        if ($emailingCampaign->getEmailingGroup()) {
            return $this->getRecipientsFromUserGroup($emailingCampaign->getEmailingGroup());
        }
        if ($emailingCampaign->getProject()) {
            return $this->getRecipientsFromProject($emailingCampaign->getProject());
        }

        throw new UserError(SendEmailingCampaignErrorCode::CANNOT_BE_SENT);
    }

    private function createAndSendMessage(
        EmailingCampaign $emailingCampaign,
        ContributorInterface $recipient
    ): void {
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
            $recipient->getLocale() ?? null,
            $recipient->getUsername()
        );

        $this->mailerService->sendMessage($message);
    }

    private function setCampaignAsSent(EmailingCampaign $emailingCampaign): EmailingCampaign
    {
        $emailingCampaign->setSendAt(new \DateTime());
        $emailingCampaign->setStatus(EmailingCampaignStatus::SENT);

        return $emailingCampaign;
    }

    private function getUnsubscribeUrl(ContributorInterface $contributor): string
    {
        if ($contributor instanceof User) {
            $parameters = [
                'token' => $this->tokenManager
                    ->getOrCreateActionToken($contributor, ActionToken::UNSUBSCRIBE)
                    ->getToken(),
            ];
            $route = 'capco_app_action_token';
        } elseif ($contributor instanceof Participant) {
            $parameters = [
                'token' => $contributor->getToken(),
                'email' => $contributor->getEmail(),
            ];
            $route = 'capco_app_unsubscribe_anonymous';
        } else {
            throw new \Exception('Contributor must be either Participant or User');
        }

        return $this->router->generate($route, $parameters, UrlGeneratorInterface::ABSOLUTE_URL);
    }

    private function getRecipientsFromInternalList(): Collection
    {
        $users = $this->userRepository->getFromInternalList();
        $participants = $this->participantRepository->getFromInternalList();

        $contributors = array_merge($users, $participants);

        return new ArrayCollection($contributors);
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
            $participant = $this->participantRepository->findOneByEmail($email);

            $contributor = $user ?? $participant;

            if (null === $contributor) {
                $contributor = new User();
                $contributor->setEmail($email);
                $contributor->setPassword($participantsDatum['token']);
            }
            $participants->add($contributor);
        }

        return $participants;
    }
}
