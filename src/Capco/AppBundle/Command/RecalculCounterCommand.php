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

        // User contribution counter

        $query = $em->createQuery('update CapcoUserBundle:User u set u.argumentsCount =
            (select count(a.id) from CapcoAppBundle:Argument a where a.Author = u AND a.isEnabled = 1 group by a.Author)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.commentsCount =
            (select count(ac.id) from CapcoAppBundle:AbstractComment ac where ac.Author = u AND ac.isEnabled = 1 group by ac.Author)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.opinionsCount =
            (select count(o.id) from CapcoAppBundle:Opinion o where o.Author = u AND o.isEnabled = 1 group by o.Author)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.sourcesCount =
            (select count(s.id) from CapcoAppBundle:Source s where s.Author = u AND s.isEnabled = 1 group by s.Author)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.votesCount =
            (select count(av.id) from CapcoAppBundle:AbstractVote av where av.user = u AND av.confirmed = 1 group by av.user)');
        $query->execute();

        // Consultation, Opinions & Arguments counters

        $query = $em->createQuery('update CapcoAppBundle:Opinion o set o.argumentsCount =
            (select count(a.id) from CapcoAppBundle:Argument a where a.opinion = o AND a.isEnabled = 1 group by a.opinion)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Opinion o set o.sourcesCount =
            (select count(s.id) from CapcoAppBundle:Source s where s.Opinion = o AND s.isEnabled = 1 group by s.Opinion)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Consultation c set c.opinionCount =
            (select count(o.id) from CapcoAppBundle:Opinion o where o.Consultation = c AND o.isTrashed = 0 group by o.Consultation)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Consultation c set c.trashedOpinionCount =
            (select count(o.id) from CapcoAppBundle:Opinion o where o.Consultation = c AND o.isTrashed = 1 group by o.Consultation)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Consultation c set c.argumentCount =
            (select count(a.id) from CapcoAppBundle:Argument a INNER JOIN CapcoAppBundle:Opinion o WITH a.opinion = o where o.Consultation = c AND a.isTrashed = 0 GROUP BY o.Consultation)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Consultation c set c.trashedArgumentCount =
            (select count(a.id) from CapcoAppBundle:Argument a INNER JOIN CapcoAppBundle:Opinion o WITH a.opinion = o where o.Consultation = c AND a.isTrashed = 1 GROUP BY o.Consultation)');
        $query->execute();

        // Votes counters

        $query = $em->createQuery('update CapcoAppBundle:Argument a set a.voteCount =
            (select count(av.id) from CapcoAppBundle:ArgumentVote av where av.argument = a AND av.confirmed = 1 group by av.argument)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Opinion a set a.voteCountOk =
            (select count(ov.id) from CapcoAppBundle:OpinionVote ov where ov.opinion = a AND ov.confirmed = 1 AND ov.value = 1 group by ov.opinion)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Opinion a set a.voteCountMitige =
            (select count(ov.id) from CapcoAppBundle:OpinionVote ov where ov.opinion = a AND ov.confirmed = 1 AND ov.value = 0 group by ov.opinion)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Opinion a set a.voteCountNok =
            (select count(ov.id) from CapcoAppBundle:OpinionVote ov where ov.opinion = a AND ov.confirmed = 1 AND ov.value = -1 group by ov.opinion)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Source s set s.voteCount =
            (select count(sv.id) from CapcoAppBundle:SourceVote sv where sv.source = s AND sv.confirmed = 1 group by sv.source)');
        $query->execute();

        $output->writeln('Recalcul completed');
    }
}
