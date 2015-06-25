<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class RecalculateCountersCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:recalculate-counters')
            ->setDescription('Recalculate the application counters')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getApplication()->getKernel()->getContainer();
        $em = $container->get('doctrine')->getManager();

        // User contribution counter

        $query = $em->createQuery('update CapcoUserBundle:User u set u.ideasCount =
            (select count(i.id) from CapcoAppBundle:Idea i where i.Author = u AND i.isEnabled = 1 group by i.Author)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.argumentsCount =
            (select count(a.id) from CapcoAppBundle:Argument a INNER JOIN CapcoAppBundle:Opinion o WITH a.opinion = o INNER JOIN CapcoAppBundle:ConsultationStep cs WITH o.step = cs where a.Author = u AND a.isEnabled = 1 AND o.isEnabled = 1 AND cs.isEnabled = 1 group by a.Author)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.opinionsCount =
            (select count(o.id) from CapcoAppBundle:Opinion o INNER JOIN CapcoAppBundle:ConsultationStep cs WITH o.step = cs where o.Author = u AND o.isEnabled = 1 AND cs.isEnabled = 1 group by o.Author)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.sourcesCount =
            (select count(s.id) from CapcoAppBundle:Source s INNER JOIN CapcoAppBundle:Opinion o WITH s.Opinion = o INNER JOIN CapcoAppBundle:ConsultationStep cs WITH o.step = cs where s.Author = u AND s.isEnabled = 1 AND o.isEnabled = 1 AND cs.isEnabled = 1 group by s.Author)');
        $query->execute();

        // User comments

        $query = $em->createQuery('update CapcoUserBundle:User u set u.ideaCommentsCount =
            (select count(ic.id) from CapcoAppBundle:IdeaComment ic INNER JOIN CapcoAppBundle:Idea i WITH ic.Idea = i where ic.Author = u AND ic.isEnabled = 1 AND i.isEnabled = 1 group by ic.Author)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.postCommentsCount =
            (select count(pc.id) from CapcoAppBundle:PostComment pc INNER JOIN CapcoAppBundle:Post p WITH pc.Post = p where pc.Author = u AND pc.isEnabled = 1 AND p.isPublished = 1 group by pc.Author)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.eventCommentsCount =
            (select count(ec.id) from CapcoAppBundle:EventComment ec INNER JOIN CapcoAppBundle:Event e WITH ec.Event = e where ec.Author = u AND ec.isEnabled = 1 AND e.isEnabled = 1 group by ec.Author)');
        $query->execute();

        // User votes

        $query = $em->createQuery('update CapcoUserBundle:User u set u.ideaVotesCount =
            (select count(iv.id) from CapcoAppBundle:IdeaVote iv INNER JOIN CapcoAppBundle:Idea i WITH iv.idea = i where iv.user = u AND iv.confirmed = 1 AND i.isEnabled = 1 group by iv.user)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.commentVotesCount =
            (select count(cv.id) from CapcoAppBundle:CommentVote cv INNER JOIN CapcoAppBundle:AbstractComment c WITH cv.comment = c where cv.user = u AND cv.confirmed = 1 AND c.isEnabled = 1 group by cv.user)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.opinionVotesCount =
            (select count(ov.id) from CapcoAppBundle:OpinionVote ov INNER JOIN CapcoAppBundle:Opinion o WITH ov.opinion = o INNER JOIN CapcoAppBundle:ConsultationStep cs WITH o.step = cs where ov.user = u AND ov.confirmed = 1 AND o.isEnabled = 1 AND cs.isEnabled = 1 group by ov.user)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.argumentVotesCount =
            (select count(av.id) from CapcoAppBundle:ArgumentVote av INNER JOIN CapcoAppBundle:Argument a WITH av.argument = a INNER JOIN CapcoAppBundle:Opinion o WITH a.opinion = o INNER JOIN CapcoAppBundle:ConsultationStep cs WITH o.step = cs where av.user = u AND av.confirmed = 1 AND a.isEnabled = 1 AND o.isEnabled = 1 AND cs.isEnabled = 1 group by av.user)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.sourceVotesCount =
            (select count(sv.id) from CapcoAppBundle:SourceVote sv INNER JOIN CapcoAppBundle:Source s WITH sv.source = s INNER JOIN CapcoAppBundle:Opinion o WITH s.Opinion = o INNER JOIN CapcoAppBundle:ConsultationStep cs WITH o.step = cs where sv.user = u AND sv.confirmed = 1 AND s.isEnabled = 1 AND o.isEnabled = 1 AND cs.isEnabled = 1 group by sv.user)');
        $query->execute();

        // Consultation, Opinions & Arguments counters

        $query = $em->createQuery('update CapcoAppBundle:Opinion o set o.argumentsCount =
            (select count(a.id) from CapcoAppBundle:Argument a where a.opinion = o AND a.isEnabled = 1 AND a.isTrashed = 0 group by a.opinion)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Opinion o set o.sourcesCount =
            (select count(s.id) from CapcoAppBundle:Source s where s.Opinion = o AND s.isEnabled = 1 AND s.isTrashed = 0 group by s.Opinion)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:ConsultationStep cs set cs.opinionCount =
            (select count(o.id) from CapcoAppBundle:Opinion o where o.step = cs AND o.isEnabled = 1 AND o.isTrashed = 0 group by o.step)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:ConsultationStep cs set cs.trashedOpinionCount =
            (select count(o.id) from CapcoAppBundle:Opinion o where o.step = cs AND o.isEnabled = 1 AND o.isTrashed = 1 group by o.step)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:ConsultationStep cs set cs.argumentCount =
            (select count(a.id) from CapcoAppBundle:Argument a INNER JOIN CapcoAppBundle:Opinion o WITH a.opinion = o where o.step = cs AND a.isEnabled = 1 AND a.isTrashed = 0 GROUP BY o.step)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:ConsultationStep cs set cs.trashedArgumentCount =
            (select count(a.id) from CapcoAppBundle:Argument a INNER JOIN CapcoAppBundle:Opinion o WITH a.opinion = o where o.step = cs AND a.isEnabled = 1 AND a.isTrashed = 1 GROUP BY o.step)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:ConsultationStep cs set cs.sourcesCount =
            (select count(s.id) from CapcoAppBundle:Source s INNER JOIN CapcoAppBundle:Opinion o WITH s.Opinion = o where o.step = cs AND s.isEnabled = 1 AND s.isTrashed = 0 GROUP BY o.step)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:ConsultationStep cs set cs.trashedSourceCount =
            (select count(s.id) from CapcoAppBundle:Source s INNER JOIN CapcoAppBundle:Opinion o WITH s.Opinion = o where o.step = cs AND s.isEnabled = 1 AND s.isTrashed = 1 GROUP BY o.step)');
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

        $query = $em->createQuery('update CapcoAppBundle:Idea i set i.voteCount =
            (select count(iv.id) from CapcoAppBundle:IdeaVote iv where iv.idea = i AND iv.confirmed = 1 group by iv.idea)');
        $query->execute();

        // Comments counters

        $query = $em->createQuery('update CapcoAppBundle:Idea i set i.commentsCount =
            (select count(ic.id) from CapcoAppBundle:IdeaComment ic where ic.Idea = i AND ic.isEnabled = 1 AND ic.isTrashed = 0 GROUP BY ic.Idea)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Post p set p.commentsCount =
            (select count(pc.id) from CapcoAppBundle:PostComment pc where pc.Post = p AND pc.isEnabled = 1 AND pc.isTrashed = 0 GROUP BY pc.Post)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Event e set e.commentsCount =
            (select count(ec.id) from CapcoAppBundle:EventComment ec where ec.Event = e AND ec.isEnabled = 1 AND ec.isTrashed = 0 GROUP BY ec.Event)');
        $query->execute();

        $output->writeln('Calculation completed');
    }
}
