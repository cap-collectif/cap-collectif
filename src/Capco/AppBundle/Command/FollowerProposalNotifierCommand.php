<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Interfaces\FollowerNotifiedOfInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Model\UserActivity;
use Doctrine\ORM\EntityNotFoundException;
use Monolog\Logger;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class FollowerProposalNotifierCommand extends ContainerAwareCommand
{
    const NOT_FOLLOWED = 0;
    const ACTIVITIES = ['isUpdated', 'isDeleted', 'comments', 'votes', 'lastStep'];

    private static $userWithoutValidEmail = [];

    protected function configure()
    {
        $this
            ->setName('capco:follower-proposal-notifier')
            ->setDescription('Send email to followers of proposals');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        $siteName = $container->get('capco.site_parameter.resolver')->getValue('global.site.fullname');
        $notifier = $container->get('capco.follower_notifier');
        $followersWithActivities = [];
        try {
            $followersWithActivities = $this->getFollowersWithActivities();
        } catch (\Exception $e) {
            $output->writeln(
                '<error>' . $e->getMessage() . '</error>'
            );
        }
        $proposalActivities = $this->getProposalActivities();
        $followersWithActivities = $this->orderUserProposalActivitiesInProject($followersWithActivities, $proposalActivities['projects'], $proposalActivities['proposals']);
        unset($proposalActivities);
        $sendAt = (new \DateTime('yesterday'))->setTimezone(new \DateTimeZone('Europe/Paris'));
        foreach ($followersWithActivities as $userId => $userActivity) {
            $notifier->onReportActivities($userActivity, $sendAt, $siteName);
        }
        $nbNewsletters = count($followersWithActivities);
        $output->writeln(
            '<info>Notification correctly send to ' . $nbNewsletters . ' users</info>'
        );
        $userWithoutEmail = array_unique(static::$userWithoutValidEmail);

        $output->writeln(
            '<comment>There are ' . count($userWithoutEmail) . ' users who follow some proposals, without valid email</comment>'
        );

        return 0;
    }

    private function getFollowersWithActivities(): array
    {
        $container = $this->getContainer();
        /** @var Logger $logger */
        $logger = $container->get('logger');
        $em = $container->get('doctrine')->getManager();
        $followers = $em->getRepository('CapcoAppBundle:Follower')->findAll();
        $followersWithActivities = [];

        /** @var Follower $follower */
        foreach ($followers as $follower) {
            try {
                $proposalId = $follower->getProposal()->getId();
                $user = $follower->getUser();
                $userId = $user->getId();
            } catch (EntityNotFoundException $e) {
                $logger->addError(__METHOD__ . $e->getMessage());
                continue;
            }
            if (!filter_var($user->getEmailCanonical(), FILTER_VALIDATE_EMAIL)) {
                static::$userWithoutValidEmail[] = $userId;

                $logger->error(sprintf('%s doesnt have a valid email %s', $user->getUsername(), $user->getEmailCanonical()));
                continue;
            }
            if (!isset($followersWithActivities[$userId])) {
                $userActivity = new UserActivity();
                $userActivity->setId($userId);
                $userActivity->setEmail($user->getEmailCanonical());
                $userActivity->setUsername($user->getUsername());
                $userActivity->setFirstname($user->getFirstname());
                $userActivity->setLastname($user->getLastname());
                $userActivity->addUserProposal($proposalId);
                $userActivity->setNotifiedOf($follower->getNotifiedOf());
                $userActivity->setConnectionToken($user->getNotificationsConfiguration()->getUnsubscribeToken());
                /* UserActivity */
                $followersWithActivities[$userId] = $userActivity;
                continue;
            }
            $followersWithActivities[$userId]->addUserProposal($proposalId);
        }

        return $followersWithActivities;
    }

    private function orderUserProposalActivitiesInProject(array $followersWithActivities, array $projects, array $proposalActivities): array
    {
        /** @var UserActivity $userActivity * */
        foreach ($followersWithActivities as $userId => $userActivity) {
            $userActivity->setUserProjects($projects);
            if (!$userActivity->hasProposal()) {
                unset($followersWithActivities[$userId]);
                continue;
            }

            foreach ($userActivity->getUserProposals() as $proposalId) {
                if (isset($proposalActivities[$proposalId])) {
                    $proposal = $proposalActivities[$proposalId];
                    if (isset($projects[$proposal['projectId']])) {
                        if (0 === $proposal['countActivities']) {
                            continue;
                        }
                        $project = $userActivity->getUserProject($proposal['projectId']);
                        $project['countActivities'] += $proposal['countActivities'];

                        if (!isset($project['proposals'])) {
                            $project['proposals'] = [];
                        }
                        if (FollowerNotifiedOfInterface::DEFAULT === $userActivity->getNotifiedOf()) {
                            $proposal['comments'] = self::NOT_FOLLOWED;
                            $proposal['votes'] = self::NOT_FOLLOWED;
                        }
                        if (FollowerNotifiedOfInterface::DEFAULT_AND_COMMENTS === $userActivity->getNotifiedOf()) {
                            $proposal['votes'] = self::NOT_FOLLOWED;
                        }

                        $project['proposals'][$proposalId] = $proposal;
                        $userActivity->addUserProject($project, $proposal['projectId']);
                    }
                }
            }
            // check if user project got a proposal and remove empty project
            foreach ($userActivity->getUserProjects() as $projectId => $project) {
                if (empty($project['proposals'])) {
                    $userActivity->removeUserProject($projectId);
                }
            }

            $userActivity->setUserProposals([]);
            // check if user got a project and remove user without project
            if (!$userActivity->hasUserProject()) {
                unset($followersWithActivities[$userId]);
                continue;
            }
            $followersWithActivities[$userId] = $userActivity;
        }

        return $followersWithActivities;
    }

    private function getProposalActivities(): array
    {
        $container = $this->getContainer();
        $em = $container->get('doctrine')->getManager();
        $proposalRepository = $em->getRepository('CapcoAppBundle:Proposal');
        $proposalFormRepository = $em->getRepository('CapcoAppBundle:ProposalForm');
        $yesterdayMidnight = new \DateTime('yesterday midnight');
        $yesterdayLasTime = (new \DateTime('today midnight'))->modify('-1 second');
        $twentyFourHoursInterval = new \DateInterval('PT24H');
        $proposalForms = $proposalFormRepository->findAll();
        $router = $container->get('router');
        $pProposals = [];
        $projects = [];

        /** @var ProposalForm $proposalForm */
        foreach ($proposalForms as $proposalForm) {
            $project = $proposalForm->getStep()->getProject();
            $projectId = $project->getId();
            $proposals = $proposalForm->getProposals();
            $projects[$projectId]['projectTitle'] = $project->getTitle();
            $projects[$projectId]['projectType'] = $project->getProjectType()->getTitle();
            // init variable, not used yet
            $projects[$projectId]['proposals'] = [];
            $projects[$projectId]['countActivities'] = 0;

            /** @var Proposal $proposal */
            foreach ($proposals as $proposal) {
                $step = $proposal->getStep();
                if ($step instanceof SelectionStep && $step->isProposalsHidden()) {
                    continue;
                }
                $currentProposal = [];
                $proposalId = $proposal->getId();
                $proposalCommentYesterdays = $proposalRepository->countProposalCommentsCreatedBetween($yesterdayMidnight, $yesterdayLasTime, $proposalId);
                $proposalVotesInYesterday = $proposalRepository->countProposalVotesCreatedBetween($yesterdayMidnight, $yesterdayLasTime, $proposalId);
                $proposalStepInYesterday = $proposalRepository->proposalStepChangedBetween($yesterdayMidnight, $yesterdayLasTime, $proposalId);
                $currentProposal['title'] = $proposal->getTitle();
                $currentProposal['link'] = $router->generate(
                    'app_project_show_proposal',
                    [
                        'projectSlug' => $project->getSlug(),
                        'stepSlug' => $proposal->getStep()->getSlug(),
                        'proposalSlug' => $proposal->getSlug(),
                    ],
                    0
                );
                $currentProposal['isUpdated'] = $proposal->isUpdatedInLastInterval($yesterdayLasTime, $twentyFourHoursInterval);
                $currentProposal['isDeleted'] = $proposal->isDeletedInLastInterval($yesterdayLasTime, $twentyFourHoursInterval);
                $currentProposal['comments'] = (int) $proposalCommentYesterdays[0]['countComment'];
                $currentProposal['votes'] = $proposalVotesInYesterday[0]['sVotes'] + $proposalVotesInYesterday[0]['cVotes'];
                $currentProposal['lastStep'] = !empty($proposalStepInYesterday) ? $proposalStepInYesterday[0] : false;
                $currentProposal['projectId'] = $projectId;
                $currentProposal['countActivities'] = $this->countProposalActivities($currentProposal);
                if (0 === $currentProposal['countActivities']) {
                    unset($currentProposal);
                } else {
                    $pProposals[$proposalId] = $currentProposal;
                }
            }
        }
        $proposalActivities = $activitiesResolver->getYesterdayProposalActivities();
        $followedProposalsActivitiesByUserId = $activitiesResolver->getMatchingActivitiesByUserId($followedProposalsByUserId, $proposalActivities);
        unset($proposalActivities);
        $sendAt = (new \DateTime('yesterday'))->setTimezone(new \DateTimeZone('Europe/Paris'));
        $siteUrl = $container->get('router')->generate('app_homepage', [], UrlGeneratorInterface::ABSOLUTE_URL);
        foreach ($followedProposalsActivitiesByUserId as $userId => $activities) {
            $notifier->onReportActivities($activities, $sendAt, $siteName, $siteUrl);
        }
        $nbNewsletters = count($followedProposalsActivitiesByUserId);
        $output->writeln(
            '<info>Notification correctly send to ' . $nbNewsletters . ' users</info>'
        );

        return 0;
    }

    private function countProposalActivities(array $proposalActivities): int
    {
        $nbActivities = count(self::ACTIVITIES);
        foreach (self::ACTIVITIES as $activity) {
            if (!$proposalActivities[$activity]) {
                --$nbActivities;
            }
        }

        return $nbActivities;
    }
}
