<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Following\ActivitiesService;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Capco\AppBundle\Notifier\FollowerNotifier;
use Capco\AppBundle\Following\ProposalActivitiesResolver;
use Capco\AppBundle\Following\OpinionActivitiesResolver;
use Symfony\Component\Console\Command\Command;
use Psr\Log\LoggerInterface;

class FollowerNotifierCommand extends Command
{
    private $followerNotifier;
    private $proposalActivitiesResolver;
    private $opinionActivitiesResolver;
    private $logger;
    private $activitiesService;

    public function __construct(
        FollowerNotifier $followerNotifier,
        ProposalActivitiesResolver $proposalActivitiesResolver,
        OpinionActivitiesResolver $opinionActivitiesResolver,
        LoggerInterface $logger,
        ActivitiesService $activitiesService
    ) {
        $this->followerNotifier = $followerNotifier;
        $this->proposalActivitiesResolver = $proposalActivitiesResolver;
        $this->opinionActivitiesResolver = $opinionActivitiesResolver;
        $this->logger = $logger;
        $this->activitiesService = $activitiesService;

        parent::__construct();
    }

    protected function configure()
    {
        $this->setName('capco:follower-notifier')
            ->addOption(
                'time',
                null,
                InputOption::VALUE_OPTIONAL,
                'The relative time you want to send email.'
            )
            ->setDescription('Send email to followers');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $followedProposalsByUserId = [];

        $relativeTime = $input->getOption('time');

        if ($relativeTime === null) {
            $relativeTime = 'yesterday';
        }

        try {
            $followedProposalsByUserId = $this->proposalActivitiesResolver->getFollowedByUserId();
        } catch (\RuntimeException $e) {
            $output->writeln('<error>' . $e->getMessage() . '</error>');
        }

        $proposalActivities = $this->proposalActivitiesResolver->getActivitiesByRelativeTime(
            $relativeTime
        );

        $followedProposalsActivitiesByUserId = $this->proposalActivitiesResolver->getMatchingActivitiesByUserId(
            $followedProposalsByUserId,
            $proposalActivities
        );

        unset($proposalActivities);

        $followersWithOpinion = [];

        try {
            $followersWithOpinion = $this->opinionActivitiesResolver->getFollowedByUserId();
        } catch (\RuntimeException $e) {
            $output->writeln('<error>' . $e->getMessage() . '</error>');
        }

        $opinionActivities = $this->opinionActivitiesResolver->getActivitiesByRelativeTime(
            $relativeTime
        );

        $followedOpinionsActivitiesByUserId = $this->opinionActivitiesResolver->getMatchingActivitiesByUserId(
            $followersWithOpinion,
            $opinionActivities
        );

        $followedActivities = $this->activitiesService->mergeFollowedActivities(
            $followedProposalsActivitiesByUserId,
            $followedOpinionsActivitiesByUserId
        );

        foreach ($followedActivities as $userId => $activities) {
            $this->followerNotifier->onReportActivities($activities);
        }

        $nbNewsletters = \count($followedActivities);

        /**
         * Prepare the notification
         */
        $notification = sprintf('Notification correctly send to %s users', $nbNewsletters);
        $this->logger->info($notification);

        $output->writeln('<info>' . $notification . '</info>');

        return 0;
    }
}
