<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Doctrine\ORM\EntityNotFoundException;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class FollowerProposalNotifierCommand extends ContainerAwareCommand
{
    public function getFollowersWithActivities()
    {
        $container = $this->getContainer();
        $em = $container->get('doctrine')->getManager();
        $followers = $em->getRepository('CapcoAppBundle:Follower')->findAll();
        $followersWithActivities = [];

        /** @var Follower $follower */
        foreach ($followers as $follower) {
            try {
                $proposalId = $follower->getProposal()->getId();
                $userId = $follower->getUser()->getId();
            } catch (EntityNotFoundException $e) {
                // TODO to log
//                dump($e->getMessage());
//                dump($follower);
                continue;
            }

            if (!isset($followersWithActivities[$userId])) {
                $followersWithActivities[$userId] = new \stdClass();
                $followersWithActivities[$userId]->proposal = [$proposalId];
                $followersWithActivities[$userId]->email = $follower->getUser()->getEmailCanonical();
                $followersWithActivities[$userId]->username = $follower->getUser()->getUsername();
                continue;
            }

            array_push($followersWithActivities[$userId]->proposal, $proposalId);
        }
    }

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
        $em = $container->get('doctrine')->getManager();
        $proposalRepository = $em->getRepository('CapcoAppBundle:Proposal');

        $followersWithActivities = $this->getFollowersWithActivities();

        $proposalFormrepository = $em->getRepository('CapcoAppBundle:ProposalForm');
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
                $proposalCommentsInLast24Hours = $proposalRepository->countProposalCommentsCreatedBetween($yesterdayMidnight, $yesterdayLasTime, $proposalId);
                $proposalVotesInLast24Hours = $proposalRepository->countProposalVotesCreatedBetween($yesterdayMidnight, $yesterdayLasTime, $proposalId);
                $proposalStepInLast24Hours = $proposalRepository->proposalStepChangedBetween($yesterdayMidnight, $yesterdayLasTime, $proposalId);
                $currentProposal['title'] = $proposal->getTitle();
                $currentProposal['isUpdated'] = $proposal->isUpdatedInLastInterval($yesterdayLasTime, $twentyFourHoursInterval);
                $currentProposal['isDeleted'] = $proposal->isDeletedInLastInterval($yesterdayLasTime, $twentyFourHoursInterval);
                $currentProposal['comments'] = (int) $proposalCommentsInLast24Hours[0]['countComment'];
                $currentProposal['votes'] = $proposalVotesInLast24Hours[0]['sVotes'] + $proposalVotesInLast24Hours[0]['cVotes'];
                $currentProposal['lastStep'] = !empty($proposalStepInLast24Hours) ? $proposalStepInLast24Hours : false;
                $currentProposal['projectId'] = $projectId;

                if (0 === $currentProposal['votes'] && 0 === $currentProposal['comments'] && !$currentProposal['isUpdated'] && !$currentProposal['lastStep'] && !$currentProposal['isDeleted']) {
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
}
