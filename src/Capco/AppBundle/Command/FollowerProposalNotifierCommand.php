<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Interfaces\FollowerNotifiedOfInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Doctrine\ORM\EntityNotFoundException;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class FollowerProposalNotifierCommand extends ContainerAwareCommand
{
    const NOT_FOLLOWED = 0;

    protected function configure()
    {
        $this
            ->setName('capco:follower-proposal-notifier')
            ->setDescription('Send email to followers of proposals')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        $notifier = $container->get('capco.follower_notifier');
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

        foreach ($followersWithActivities as $userId => $userActivity) {
            $notifier->onReportActivities($userActivity);
        }
        $nbNewsletters = count($followersWithActivities);
        $output->writeln(
            '<info>Notification correctly send to ' . $nbNewsletters . ' users</info>'
        );

        return 0;
    }

    private function getFollowersWithActivities(): array
    {
        $container = $this->getContainer();
        $logger = $container->get('logger');
        $em = $container->get('doctrine')->getManager();
        $followers = $em->getRepository('CapcoAppBundle:Follower')->findAll();
        $followersWithActivities = [];

        /** @var Follower $follower */
        foreach ($followers as $follower) {
            try {
                $proposalId = $follower->getProposal()->getId();
                $userId = $follower->getUser()->getId();
            } catch (EntityNotFoundException $e) {
                $logger->addError(__METHOD__ . $e->getMessage());
                continue;
            }

            if (!isset($followersWithActivities[$userId])) {
                $userActivity = new UserActivity();
                $userActivity->setId($userId);
                $userActivity->setEmail($follower->getUser()->getEmailCanonical());
                $userActivity->setUsername($follower->getUser()->getUsername());
                $userActivity->setFirstname($follower->getUser()->getFirstname());
                $userActivity->setLastname($follower->getUser()->getLastname());
                $userActivity->addUserProposal($proposalId);
                $userActivity->setNotifiedOf($follower->getNotifiedOf());
                /* UserActivity */
                $followersWithActivities[$userId] = $userActivity;
                continue;
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
                        $project = $userActivity->getUserProject($proposal['projectId']);
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
                        if (!$this->hasMinimalRequiredFields($proposal)) {
                            continue;
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
        $proposalForms = $proposalFormrepository->findAll();
        $pProposals = [];
        $projects = [];

        /** @var ProposalForm $proposalForm */
        foreach ($proposalForms as $proposalForm) {
            $project = $proposalForm->getStep()->getProject();
            $projectId = $project->getId();
            $proposals = $proposalForm->getProposals();
            $projects[$projectId]['projectTitle'] = $project->getTitle();
            $projects[$projectId]['projectType'] = $project->getProjectType()->getTitle();
            /** @var Proposal $proposal */
            foreach ($proposals as $proposal) {
                $currentProposal = [];
                $proposalId = $proposal->getId();
                $proposalCommentYesterdays = $proposalRepository->countProposalCommentsCreatedBetween($yesterdayMidnight, $yesterdayLasTime, $proposalId);
                $proposalVotesInYesterday = $proposalRepository->countProposalVotesCreatedBetween($yesterdayMidnight, $yesterdayLasTime, $proposalId);
                $proposalStepInYesterday = $proposalRepository->proposalStepChangedBetween($yesterdayMidnight, $yesterdayLasTime, $proposalId);
                $currentProposal['title'] = $proposal->getTitle();
                $currentProposal['isUpdated'] = $proposal->isUpdatedInLastInterval($yesterdayLasTime, $twentyFourHoursInterval);
                $currentProposal['isDeleted'] = $proposal->isDeletedInLastInterval($yesterdayLasTime, $twentyFourHoursInterval);
                $currentProposal['comments'] = (int) $proposalCommentYesterdays[0]['countComment'];
                $currentProposal['votes'] = $proposalVotesInYesterday[0]['sVotes'] + $proposalVotesInYesterday[0]['cVotes'];
                $currentProposal['lastStep'] = !empty($proposalStepInYesterday) ? $proposalStepInYesterday : false;
                $currentProposal['projectId'] = $projectId;

                if (!$this->hasMinimalRequiredFields($currentProposal)) {
                    unset($currentProposal);
                } else {
                    $pProposals[$proposalId] = $currentProposal;
                }
            }
        }

        foreach ($followersWithActivities as $followerWithActivities) {
            foreach ($followerWithActivities as $follower) {
            }
        }

        $output->writeln(
            '<info>opinions successfully created.</info>'
        );

        return 0;
    }

    private function hasMinimalRequiredFields($proposal): bool
    {
        if (!$proposal['votes'] && !$proposal['comments'] && !$proposal['isUpdated'] && !$proposal['lastStep'] && !$proposal['isDeleted']) {
            return false;
        }

        return true;
    }
}
