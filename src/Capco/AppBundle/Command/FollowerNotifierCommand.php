<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Following\ActivitiesService;
use Capco\AppBundle\Following\OpinionActivitiesResolver;
use Capco\AppBundle\Following\ProposalActivitiesResolver;
use Capco\AppBundle\Notifier\FollowerNotifier;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class FollowerNotifierCommand extends Command
{
    protected static $defaultName = 'capco:follower-notifier';
    private readonly FollowerNotifier $followerNotifier;
    private readonly ProposalActivitiesResolver $proposalActivitiesResolver;
    private readonly OpinionActivitiesResolver $opinionActivitiesResolver;
    private readonly LoggerInterface $logger;
    private readonly ActivitiesService $activitiesService;

    public function __construct(
        FollowerNotifier $followerNotifier,
        ProposalActivitiesResolver $proposalActivitiesResolver,
        OpinionActivitiesResolver $opinionActivitiesResolver,
        LoggerInterface $logger,
        ActivitiesService $activitiesService,
        ?string $name
    ) {
        $this->followerNotifier = $followerNotifier;
        $this->proposalActivitiesResolver = $proposalActivitiesResolver;
        $this->opinionActivitiesResolver = $opinionActivitiesResolver;
        $this->logger = $logger;
        $this->activitiesService = $activitiesService;

        parent::__construct($name);
    }

    protected function configure()
    {
        $this->setName('capco:follower-notifier')
            ->addOption(
                'time',
                null,
                InputOption::VALUE_OPTIONAL,
                '/!\ Should be used for CI only /!\ .The relative time you want to send email.',
                'yesterday'
            )
            ->setDescription('Send an email to followers')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $relativeTime = $input->getOption('time');

        $followedProposalsByUserId = $this->proposalActivitiesResolver->getFollowedByUserId();

        $proposalActivities = $this->proposalActivitiesResolver->getActivitiesByRelativeTime(
            $relativeTime
        );

        $followedProposalsActivitiesByUserId = $this->proposalActivitiesResolver->getMatchingActivitiesByUserId(
            $followedProposalsByUserId,
            $proposalActivities
        );

        unset($proposalActivities);

        $followersWithOpinion = $this->opinionActivitiesResolver->getFollowedByUserId();

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

        $this->followerNotifier->setSendAt($relativeTime);

        foreach ($followedActivities as $userId => $activities) {
            $this->followerNotifier->onReportActivities($activities);
        }

        $nbNewsletters = \count($followedActivities);

        /**
         * Prepare the notification.
         */
        $notification = sprintf('Notification correctly send to %s users', $nbNewsletters);
        $this->logger->info($notification);

        $output->writeln('<info>' . $notification . '</info>');

        return 0;
    }
}
