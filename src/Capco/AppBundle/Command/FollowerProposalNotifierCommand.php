<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class FollowerProposalNotifierCommand extends ContainerAwareCommand
{
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
        $em = $container->get('doctrine')->getManager();

        $proposalRepository = $em->getRepository('CapcoAppBundle:Proposal');
        $proposalsWithFollowersAndProject = $proposalRepository->getProposalsWithOwnFollowersAndProject();
        $yesterdayMidnight = new \DateTime('yesterday midnight');
        $yesterdayLasTime = (new \DateTime('today midnight'))->modify('-1 second');

        /** @var Proposal $proposal */
        foreach ($proposalsWithFollowersAndProject as $proposal) {
//            foreach ($proposal->getFollowers() as $follower) {
//                dump($follower->getUser()->getUsername());
//            }
            $votesAndComments = $proposalRepository->countVotesAndCommentsBetween($yesterdayMidnight, $yesterdayLasTime, $proposal->getId());
            $proposaForm = $proposal->getProposalForm();
            /** @var CollectStep $step */
            $step = $proposaForm->getStep();
            $projectTitle = $step->getProject()->getTitle();
        }

        $output->writeln(
            '<info>opinions successfully created.</info>'
        );

        return 0;
    }
}
