<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Proposal;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class FollowerProposalNotifierCommand extends ContainerAwareCommand
{
    public function getFollowersWithActivities(): array
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
                $logger->addError(__METHOD__ . $e->getMessage() . var_export($follower, true));
                continue;
            }
            if (!filter_var($follower->getUser()->getEmailCanonical(), FILTER_VALIDATE_EMAIL)) {
                $logger->addError(sprintf('%s doesnt have a valid email %s', $follower->getUser()->getUsername(), $follower->getUser()->getEmailCanonical()));
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
                /* UserActivity */
                $followersWithActivities[$userId] = $userActivity;
                continue;
            }
            $followersWithActivities[$userId]->addUserProposal($proposalId);
        }

        return $followersWithActivities;
    }

    public function orderUserProposalActivitiesInProject(array $followersWithActivities, array $projects, array $proposalActivities)
    {
        /**
         * @var UserActivity
         */
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
                        $project['proposals'][$proposalId] = $proposal;
                        $userActivity->addUserProject($project, $proposal['projectId']);
                    }
                }
            }

            foreach ($userActivity->getUserProjects() as $projectId => $project) {
                if (empty($project['proposals'])) {
                    $userActivity->removeUserProject($projectId);
                }
            }

            $userActivity->setUserProposals([]);
            if (!$userActivity->hasUserProject()) {
                unset($followersWithActivities[$userId]);
                continue;
            }
            $followersWithActivities[$userId] = $userActivity;
        }

        return $followersWithActivities;
    }

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
        $activitiesResolver = $container->get('capco.following.activities.resolver');
        $followedProposalsByUserId = [];
        try {
            $followedProposalsByUserId = $activitiesResolver->getFollowedProposalsByUserId();
        } catch (\Exception $e) {
            $output->writeln(
                '<error>' . $e->getMessage() . '</error>'
            );
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
}
