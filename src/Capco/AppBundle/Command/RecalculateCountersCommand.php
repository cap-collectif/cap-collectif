<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputOption;

class RecalculateCountersCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:compute:counters')
            ->setDescription('Recalculate the application counters')
            ->addOption(
                'force', false, InputOption::VALUE_NONE,
                'set this option to force complete recomputation'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getApplication()->getKernel()->getContainer();
        $em = $container->get('doctrine')->getManager();
        $contributionResolver = $container->get('capco.contribution.resolver');
        $force = $input->getOption('force');

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

        $consultationSteps = $em->getRepository('CapcoAppBundle:Steps\ConsultationStep')->findAll();

        foreach ($consultationSteps as $cs) {
            $participants = $contributionResolver->countStepContributors($cs);
            $query = $em->createQuery('
              update CapcoAppBundle:Steps\ConsultationStep cs
              set cs.contributorsCount = '.$participants.'
              where cs.id = '.$cs->getId()
            );
            $query->execute();
        }

        foreach ($consultationSteps as $cs) {
            $votes = $contributionResolver->countStepVotes($cs);
            $query = $em->createQuery('
              update CapcoAppBundle:Steps\ConsultationStep cs
              set cs.votesCount = '.$votes.'
              where cs.id = '.$cs->getId()
            );
            $query->execute();
        }

        // ****************************** Collect step counters **************************************

        $query = $em->createQuery('update CapcoAppBundle:Steps\CollectStep cs set cs.proposalsCount =
            (select count(p.id) from CapcoAppBundle:Proposal p INNER JOIN CapcoAppBundle:ProposalForm pf WITH p.proposalForm = pf where pf.step = cs AND p.enabled = 1 group by pf.step)');
        $query->execute();

        $collectSteps = $em->getRepository('CapcoAppBundle:Steps\CollectStep')->findAll();
        foreach ($collectSteps as $cs) {
            $participants = $contributionResolver->countStepContributors($cs);
            $query = $em->createQuery('
              update CapcoAppBundle:Steps\CollectStep cs
              set cs.contributorsCount = '.$participants.'
              where cs.id = '.$cs->getId()
            );
            $query->execute();
        }

        // ****************************** Questionnaire step counters **************************************

        $query = $em->createQuery('update CapcoAppBundle:Steps\QuestionnaireStep qs set qs.repliesCount =
            (select count(r.id) from CapcoAppBundle:Reply r INNER JOIN CapcoAppBundle:Questionnaire q WITH r.questionnaire = q where q.step = qs AND r.enabled = 1 group by q.step)');
        $query->execute();

        $questionnaireSteps = $em->getRepository('CapcoAppBundle:Steps\QuestionnaireStep')->findAll();
        foreach ($questionnaireSteps as $qs) {
            $participants = $contributionResolver->countStepContributors($qs);
            $query = $em->createQuery('
              update CapcoAppBundle:Steps\QuestionnaireStep qs
              set qs.contributorsCount = '.$participants.'
              where qs.id = '.$qs->getId()
            );
            $query->execute();
        }

        // ****************************** Selection steps counters **************************************

        $query = $em->createQuery('update CapcoAppBundle:Steps\SelectionStep ss set ss.votesCount =
            (select count(pv.id) from CapcoAppBundle:ProposalVote pv INNER JOIN CapcoAppBundle:Proposal p WITH pv.proposal = p where pv.selectionStep = ss AND pv.confirmed = 1 AND p.enabled = 1 group by pv.selectionStep)');
        $query->execute();

        $selectionSteps = $em->getRepository('CapcoAppBundle:Steps\SelectionStep')->findAll();
        foreach ($selectionSteps as $ss) {
            $participants = $contributionResolver->countStepContributors($ss);
            $query = $em->createQuery('
              update CapcoAppBundle:Steps\SelectionStep ss
              set ss.contributorsCount = '.$participants.'
              where ss.id = '.$ss->getId()
            );
            $query->execute();
        }

        $output->writeln('Calculation completed');
    }
}
