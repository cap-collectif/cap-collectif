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
            ->setName('capco:compute:counters')
            ->setDescription('Recalculate the application counters')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getApplication()->getKernel()->getContainer();
        $em = $container->get('doctrine')->getManager();

        // ********************************* User counters *************************************************

        $query = $em->createQuery('update CapcoUserBundle:User u set u.projectsCount =
            (select count(p.id) from CapcoAppBundle:Project p where p.Author = u AND p.isEnabled = 1 group by p.Author)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.ideasCount =
            (select count(i.id) from CapcoAppBundle:Idea i where i.Author = u AND i.isEnabled = 1 group by i.Author)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.proposalsCount =
            (select count(p.id) from CapcoAppBundle:Proposal p where p.author = u AND p.enabled = 1 group by p.author)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.proposalVotesCount =
            (select count(pv.id) from CapcoAppBundle:ProposalVote pv INNER JOIN CapcoAppBundle:Proposal p WITH pv.proposal = p where pv.user = u AND pv.confirmed = 1 AND p.enabled = 1 group by pv.user)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.opinionsCount =
            (select count(o.id) from CapcoAppBundle:Opinion o INNER JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs where o.Author = u AND o.isEnabled = 1 AND cs.isEnabled = 1 group by o.Author)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.opinionVersionsCount =
            (select count(ov.id) from CapcoAppBundle:OpinionVersion ov INNER JOIN CapcoAppBundle:Opinion o WITH ov.parent = o INNER JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs where ov.author = u AND ov.enabled = 1 AND o.isEnabled = 1 AND cs.isEnabled = 1 group by ov.author)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.argumentsCount = (
          select count(a.id)
          from CapcoAppBundle:Argument a
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH a.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH a.opinion = o
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          LEFT JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs
          LEFT JOIN CapcoAppBundle:Steps\ConsultationStep ovocs WITH ovo.step = ovocs
          WHERE a.Author = u AND a.isEnabled = 1 AND ((a.opinion IS NOT NULL AND o.isEnabled = 1 AND cs.isEnabled = 1) OR (a.opinionVersion IS NOT NULL AND ov.enabled = 1 AND ovo.isEnabled = 1 AND ovocs.isEnabled = 1))
          GROUP BY a.Author
        )');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.sourcesCount = (
          select count(s.id)
          from CapcoAppBundle:Source s
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH s.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH s.Opinion = o
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          LEFT JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs
          LEFT JOIN CapcoAppBundle:Steps\ConsultationStep ovocs WITH ovo.step = ovocs
          WHERE s.Author = u AND s.isEnabled = 1 AND ((s.Opinion IS NOT NULL AND o.isEnabled = 1 AND cs.isEnabled = 1) OR (s.opinionVersion IS NOT NULL AND ov.enabled = 1 AND ovo.isEnabled = 1 AND ovocs.isEnabled = 1))
          GROUP BY s.Author
        )');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.ideaCommentsCount =
            (select count(ic.id) from CapcoAppBundle:IdeaComment ic INNER JOIN CapcoAppBundle:Idea i WITH ic.Idea = i where ic.Author = u AND ic.isEnabled = 1 AND i.isEnabled = 1 group by ic.Author)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.postCommentsCount =
            (select count(pc.id) from CapcoAppBundle:PostComment pc INNER JOIN CapcoAppBundle:Post p WITH pc.Post = p where pc.Author = u AND pc.isEnabled = 1 AND p.isPublished = 1 group by pc.Author)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.eventCommentsCount =
            (select count(ec.id) from CapcoAppBundle:EventComment ec INNER JOIN CapcoAppBundle:Event e WITH ec.Event = e where ec.Author = u AND ec.isEnabled = 1 AND e.isEnabled = 1 group by ec.Author)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.ideaVotesCount =
            (select count(iv.id) from CapcoAppBundle:IdeaVote iv INNER JOIN CapcoAppBundle:Idea i WITH iv.idea = i where iv.user = u AND iv.confirmed = 1 AND i.isEnabled = 1 group by iv.user)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.commentVotesCount =
            (select count(cv.id) from CapcoAppBundle:CommentVote cv INNER JOIN CapcoAppBundle:Comment c WITH cv.comment = c where cv.user = u AND cv.confirmed = 1 AND c.isEnabled = 1 group by cv.user)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.opinionVotesCount =
            (select count(ov.id) from CapcoAppBundle:OpinionVote ov INNER JOIN CapcoAppBundle:Opinion o WITH ov.opinion = o INNER JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs where ov.user = u AND ov.confirmed = 1 AND o.isEnabled = 1 AND cs.isEnabled = 1 group by ov.user)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.opinionVersionVotesCount =
            (select count(ovv.id) from CapcoAppBundle:OpinionVersionVote ovv INNER JOIN CapcoAppBundle:OpinionVersion ov WITH ovv.opinionVersion = ov INNER JOIN CapcoAppBundle:Opinion o WITH ov.parent = o INNER JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs where ovv.user = u AND ovv.confirmed = 1 AND ov.enabled = 1 AND o.isEnabled = 1 AND cs.isEnabled = 1 group by ovv.user)');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.argumentVotesCount = (
          select count(av.id)
          from CapcoAppBundle:ArgumentVote av
          LEFT JOIN CapcoAppBundle:Argument a WITH av.argument = a
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH a.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH a.opinion = o
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          LEFT JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs
          LEFT JOIN CapcoAppBundle:Steps\ConsultationStep ovocs WITH ovo.step = ovocs
          WHERE av.user = u AND av.confirmed = 1 AND a.isEnabled = 1 AND ((a.opinion IS NOT NULL AND o.isEnabled = 1 AND cs.isEnabled = 1) OR (a.opinionVersion IS NOT NULL AND ov.enabled = 1 AND ovo.isEnabled = 1 AND ovocs.isEnabled = 1))
          GROUP BY av.user
        )');
        $query->execute();

        $query = $em->createQuery('update CapcoUserBundle:User u set u.sourceVotesCount = (
          select count(sv.id)
          from CapcoAppBundle:SourceVote sv
          LEFT JOIN CapcoAppBundle:Source s WITH sv.source = s
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH s.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH s.Opinion = o
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          LEFT JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs
          LEFT JOIN CapcoAppBundle:Steps\ConsultationStep ovocs WITH ovo.step = ovocs
          WHERE sv.user = u AND sv.confirmed = 1 AND s.isEnabled = 1 AND ((s.Opinion IS NOT NULL AND o.isEnabled = 1 AND cs.isEnabled = 1) OR (s.opinionVersion IS NOT NULL AND ov.enabled = 1 AND ovo.isEnabled = 1 AND ovocs.isEnabled = 1))
          GROUP BY sv.user
        )');
        $query->execute();

        // ************************ Consultation step counters ***********************************************

        $query = $em->createQuery('update CapcoAppBundle:Steps\ConsultationStep cs set cs.opinionCount =
            (select count(o.id) from CapcoAppBundle:Opinion o where o.step = cs AND o.isEnabled = 1 AND o.isTrashed = 0 group by o.step)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Steps\ConsultationStep cs set cs.opinionVersionsCount =
            (select count(ov.id) from CapcoAppBundle:OpinionVersion ov INNER JOIN CapcoAppBundle:Opinion o WITH ov.parent = o where o.step = cs AND ov.enabled = 1 AND ov.isTrashed = 0 AND o.isEnabled = 1 AND o.isTrashed = 0 group by o.step)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Steps\ConsultationStep cs set cs.trashedOpinionCount =
            (select count(o.id) from CapcoAppBundle:Opinion o where o.step = cs AND o.isEnabled = 1 AND o.isTrashed = 1 group by o.step)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Steps\ConsultationStep cs set cs.trashedOpinionVersionsCount =
            (select count(ov.id) from CapcoAppBundle:OpinionVersion ov INNER JOIN CapcoAppBundle:Opinion o WITH ov.parent = o where o.step = cs AND ov.enabled = 1 AND ov.isTrashed = 1 AND o.isEnabled = 1 group by o.step)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Steps\ConsultationStep cs set cs.argumentCount = (
          select count(a.id)
          from CapcoAppBundle:Argument a
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH a.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH a.opinion = o
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          WHERE a.isEnabled = 1 AND a.isTrashed = 0 AND ((a.opinion IS NOT NULL AND o.isEnabled = 1 AND o.step = cs) OR (a.opinionVersion IS NOT NULL AND ov.enabled = 1 AND ovo.isEnabled = 1 AND ovo.step = cs))
        )');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Steps\ConsultationStep cs set cs.trashedArgumentCount = (
          select count(a.id)
          from CapcoAppBundle:Argument a
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH a.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH a.opinion = o
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          WHERE a.isEnabled = 1 AND a.isTrashed = 1 AND ((a.opinion IS NOT NULL AND o.isEnabled = 1 AND o.step = cs) OR (a.opinionVersion IS NOT NULL AND ov.enabled = 1 AND ovo.isEnabled = 1 AND ovo.step = cs))
        )');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Steps\ConsultationStep cs set cs.sourcesCount = (
          select count(s.id)
          from CapcoAppBundle:Source s
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH s.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH s.Opinion = o
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          WHERE s.isEnabled = 1 AND s.isTrashed = 0 AND ((s.Opinion IS NOT NULL AND o.isEnabled = 1 AND o.step = cs) OR (s.opinionVersion IS NOT NULL AND ov.enabled = 1 AND ovo.isEnabled = 1 AND ovo.step = cs))
        )');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Steps\ConsultationStep cs set cs.trashedSourceCount = (
          select count(s.id)
          from CapcoAppBundle:Source s
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH s.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH s.Opinion = o
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          WHERE s.isEnabled = 1 AND s.isTrashed = 1 AND ((s.Opinion IS NOT NULL AND o.isEnabled = 1 AND o.step = cs) OR (s.opinionVersion IS NOT NULL AND ov.enabled = 1 AND ovo.isEnabled = 1 AND ovo.step = cs))
        )');
        $query->execute();
        
        // ****************************** Collect step counters **************************************

        $query = $em->createQuery('update CapcoAppBundle:Steps\CollectStep cs set cs.proposalsCount =
            (select count(p.id) from CapcoAppBundle:Proposal p INNER JOIN CapcoAppBundle:ProposalForm pf WITH p.proposalForm = pf where pf.step = cs AND p.enabled = 1 group by pf.step)');
        $query->execute();

        // ****************************** Selection steps counters **************************************

        $query = $em->createQuery('update CapcoAppBundle:Steps\SelectionStep ss set ss.votesCount =
            (select count(pv.id) from CapcoAppBundle:ProposalVote pv INNER JOIN CapcoAppBundle:Proposal p WITH pv.proposal = p where pv.selectionStep = ss AND pv.confirmed = 1 AND p.enabled = 1 group by pv.selectionStep)');
        $query->execute();

        // ****************************** Selection steps counters **************************************

        $query = $em->createQuery('update CapcoAppBundle:Steps\SelectionStep ss set ss.votesCount =
            (select count(pv.id) from CapcoAppBundle:ProposalVote pv INNER JOIN CapcoAppBundle:Proposal p WITH pv.proposal = p where pv.selectionStep = ss AND pv.confirmed = 1 AND p.enabled = 1 group by pv.selectionStep)');
        $query->execute();

        // ****************************** Opinion counters **********************************************

        $query = $em->createQuery('update CapcoAppBundle:Opinion o set o.versionsCount = (
          select count(ov.id)
          from CapcoAppBundle:OpinionVersion ov
          where ov.enabled = 1 AND ov.isTrashed = 0 AND ov.parent = o
        )');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Opinion o set o.argumentsCount = (
          select count(a.id)
          from CapcoAppBundle:Argument a
          WHERE a.isEnabled = 1 AND a.isTrashed = 0 AND a.opinion = o
        )');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Opinion o set o.sourcesCount = (
          select count(s.id)
          from CapcoAppBundle:Source s
          WHERE s.isEnabled = 1 AND s.isTrashed = 0 AND s.Opinion = o
        )');
        $query->execute();

        // Currently, you cannot update a table and select from the same table in a subquery.
        $conn = $em->getConnection();
        $conn->executeUpdate('UPDATE opinion AS o
          JOIN
          ( SELECT p.id, COUNT(r.opinion_source) AS cnt
            FROM opinion p
            LEFT JOIN opinion_relation r
            ON r.opinion_source = p.id OR r.opinion_target = p.id
            GROUP BY p.id
          ) AS g
          ON g.id = o.id
          SET o.connections_count = g.cnt'
        );

        $query = $em->createQuery('update CapcoAppBundle:Opinion a set a.votesCountOk =
            (select count(ov.id) from CapcoAppBundle:OpinionVote ov where ov.opinion = a AND ov.confirmed = 1 AND ov.value = 1 group by ov.opinion)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Opinion a set a.votesCountMitige =
            (select count(ov.id) from CapcoAppBundle:OpinionVote ov where ov.opinion = a AND ov.confirmed = 1 AND ov.value = 0 group by ov.opinion)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Opinion a set a.votesCountNok =
            (select count(ov.id) from CapcoAppBundle:OpinionVote ov where ov.opinion = a AND ov.confirmed = 1 AND ov.value = -1 group by ov.opinion)');
        $query->execute();

        // ******************************** Opinion version counters ****************************************

        $query = $em->createQuery('update CapcoAppBundle:OpinionVersion ov set ov.argumentsCount = (
          select count(a.id)
          from CapcoAppBundle:Argument a
          WHERE a.isEnabled = 1 AND a.isTrashed = 0 AND a.opinionVersion = ov
        )');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:OpinionVersion ov set ov.sourcesCount = (
          select count(s.id)
          from CapcoAppBundle:Source s
          WHERE s.isEnabled = 1 AND s.isTrashed = 0 AND s.opinionVersion = ov
        )');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:OpinionVersion ov set ov.votesCountOk =
            (select count(ovv.id) from CapcoAppBundle:OpinionVersionVote ovv where ovv.opinionVersion = ov AND ovv.confirmed = 1 AND ovv.value = 1 group by ovv.opinionVersion)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:OpinionVersion ov set ov.votesCountMitige =
            (select count(ovv.id) from CapcoAppBundle:OpinionVersionVote ovv where ovv.opinionVersion = ov AND ovv.confirmed = 1 AND ovv.value = 0 group by ovv.opinionVersion)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:OpinionVersion ov set ov.votesCountNok =
            (select count(ovv.id) from CapcoAppBundle:OpinionVersionVote ovv where ovv.opinionVersion = ov AND ovv.confirmed = 1 AND ovv.value = -1 group by ovv.opinionVersion)');
        $query->execute();

        // ************************************ Votes counters **********************************************

        $query = $em->createQuery('update CapcoAppBundle:Argument a set a.votesCount =
            (select count(av.id) from CapcoAppBundle:ArgumentVote av where av.argument = a AND av.confirmed = 1 group by av.argument)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Source s set s.votesCount =
            (select count(sv.id) from CapcoAppBundle:SourceVote sv where sv.source = s AND sv.confirmed = 1 group by sv.source)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Idea i set i.votesCount =
            (select count(iv.id) from CapcoAppBundle:IdeaVote iv where iv.idea = i AND iv.confirmed = 1 group by iv.idea)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Comment c set c.votesCount =
            (select count(cv.id) from CapcoAppBundle:CommentVote cv where cv.comment = c AND cv.confirmed = 1 group by cv.comment)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Proposal p set p.votesCount =
            (select count(pv.id) from CapcoAppBundle:ProposalVote pv where pv.proposal = p AND pv.confirmed = 1 group by pv.proposal)');
        $query->execute();

        // **************************************** Comments counters ***************************************

        $query = $em->createQuery('update CapcoAppBundle:Idea i set i.commentsCount =
            (select count(ic.id) from CapcoAppBundle:IdeaComment ic where ic.Idea = i AND ic.isEnabled = 1 AND ic.isTrashed = 0 GROUP BY ic.Idea)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Post p set p.commentsCount =
            (select count(pc.id) from CapcoAppBundle:PostComment pc where pc.Post = p AND pc.isEnabled = 1 AND pc.isTrashed = 0 GROUP BY pc.Post)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Event e set e.commentsCount =
            (select count(ec.id) from CapcoAppBundle:EventComment ec where ec.Event = e AND ec.isEnabled = 1 AND ec.isTrashed = 0 GROUP BY ec.Event)');
        $query->execute();

        $query = $em->createQuery('update CapcoAppBundle:Proposal p set p.commentsCount =
            (select count(pc.id) from CapcoAppBundle:ProposalComment pc where pc.proposal = p AND pc.isEnabled = 1 AND pc.isTrashed = 0 GROUP BY pc.proposal)');
        $query->execute();

        $output->writeln('Calculation completed');
    }
}
