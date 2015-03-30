<?php
namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class RecalculCounterCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:recalcul-counter')
            ->setDescription('Recalcul the application counters')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getApplication()->getKernel()->getContainer();
        $em = $container->get('doctrine')->getManager();

        $users = $em->getRepository('CapcoUserBundle:User')->findAll();

        $opinions_counters = $em->getRepository('CapcoUserBundle:User')->getOpinionCounters();
        $comments_counters = $em->getRepository('CapcoUserBundle:User')->getCommentCounters();
        $arguments_counters = $em->getRepository('CapcoUserBundle:User')->getArgumentCounters();
        $sources_counters = $em->getRepository('CapcoUserBundle:User')->getSourceCounters();
        $ideas_counters = $em->getRepository('CapcoUserBundle:User')->getIdeaCounters();
        $votes_counters = $em->getRepository('CapcoUserBundle:User')->getVoteCounters();

        foreach ($users as $key => $user) {
            $user->setOpinionsCount($opinions_counters[$key]['opinion_count'])
                 ->setArgumentsCount($arguments_counters[$key]['argument_count'])
                 ->setSourcesCount($sources_counters[$key]['source_count'])
                 ->setIdeasCount($ideas_counters[$key]['idea_count'])
                 ->setCommentsCount($comments_counters[$key]['comment_count'])
                 ->setVotesCount($votes_counters[$key]['vote_count'])
            ;
        }
        $em->flush();

        $query = $em->createQuery('update CapcoAppBundle:Argument a set a.voteCount =
            (select count(av.id) from CapcoAppBundle:ArgumentVote av where av.argument = a group by av.argument)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Opinion a set a.argumentsCount =
            (select count(av.id) from CapcoAppBundle:Argument av where av.opinion = a group by av.opinion)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Opinion a set a.voteCountOk =
            (select count(av.id) from CapcoAppBundle:OpinionVote av where av.opinion = a and av.value = 1 group by av.opinion)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Opinion a set a.voteCountMitige =
            (select count(av.id) from CapcoAppBundle:OpinionVote av where av.opinion = a and av.value = 0 group by av.opinion)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Opinion a set a.voteCountNok =
            (select count(av.id) from CapcoAppBundle:OpinionVote av where av.opinion = a and av.value = -1 group by av.opinion)');
        $query->execute();

        $output->writeln('Recalcul completed');
    }
}
