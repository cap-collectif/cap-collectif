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
        } catch (\RuntimeException $e) {
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
        $this->getContainer()->get('logger')->addInfo('Notification correctly send to ' . $nbNewsletters . ' users');
        $output->writeln(
            '<info>Notification correctly send to ' . $nbNewsletters . ' users</info>'
        );

        return 0;
    }
}
