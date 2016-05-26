<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputOption;

class RecalculateUsersCountersCommand extends ContainerAwareCommand
{
    public $em;
    public $redis;

    protected function configure()
    {
        $this
            ->setName('capco:compute:users-counters')
            ->setDescription('Recalculate the users counters')
            ->addOption(
                'force', false, InputOption::VALUE_NONE,
                'set this option to force complete recomputation'
            )
        ;
    }

    protected function executeOnlyChangesFromLastRun($dql, $redisKey)
    {
      $ids = $this->redis->lrange($redisKey, 0, -1);
      if ($ids && count($ids) > 0) {
          $dql.= ' where u.id in (:ids)';
          $query = $this->em->createQuery($dql)->setParameter('ids', $ids);
          $query->execute();
          $this->redis->del($redisKey);
      }
    }

    protected function recalculateUserRepliesCounters($force)
    {
      $dql = 'update CapcoUserBundle:User u set u.repliesCount = (select count(r.id) from CapcoAppBundle:Reply r where r.author = u AND r.enabled = 1 AND r.private = 0 group by r.author)';
      if ($force) {
        $this->em->createQuery($dql)->execute();
      } else {
        $this->executeOnlyChangesFromLastRun($dql, 'recompute_replies_count');
      }
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $force = $input->getOption('force');
        $container = $this->getApplication()->getKernel()->getContainer();
        $this->em = $container->get('doctrine.orm.entity_manager');
        $em = $this->em;
        $this->redis = $container->get('snc_redis.default');

        $this->recalculateUserRepliesCounters($force);

        $query = $em->createQuery('update CapcoUserBundle:User u set u.projectsCount =
            (select count(p.id) from CapcoAppBundle:Project p where p.Author = u AND p.isEnabled = 1 group by p.Author)');
        $query->execute();

        if ($force || $em->createQuery('SELECT COUNT(idea.id) FROM CapcoAppBundle:Idea idea')->getSingleScalarResult() > 0) {
            $query = $em->createQuery('update CapcoUserBundle:User u set u.ideasCount =
              (select count(i.id) from CapcoAppBundle:Idea i where i.Author = u AND i.isEnabled = 1 group by i.Author)');
            $query->execute();
        }

        if ($force || $em->createQuery('SELECT COUNT(proposal.id) FROM CapcoAppBundle:Proposal proposal')->getSingleScalarResult() > 0) {
            $query = $em->createQuery('update CapcoUserBundle:User u set u.proposalsCount =
              (select count(p.id) from CapcoAppBundle:Proposal p where p.author = u AND p.enabled = 1 group by p.author)');
            $query->execute();
        }

        if ($force || $em->createQuery('SELECT COUNT(opinion.id) FROM CapcoAppBundle:Opinion opinion')->getSingleScalarResult() > 0) {
            $query = $em->createQuery('update CapcoUserBundle:User u set u.opinionsCount =
              (select count(o.id) from CapcoAppBundle:Opinion o INNER JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs where o.Author = u AND o.isEnabled = 1 AND cs.isEnabled = 1 group by o.Author)');
            $query->execute();
        }

        if ($force || $em->createQuery('SELECT COUNT(version.id) FROM CapcoAppBundle:OpinionVersion version')->getSingleScalarResult() > 0) {
            $em->createQuery('update CapcoUserBundle:User u set u.opinionVersionsCount =
              (select count(ov.id) from CapcoAppBundle:OpinionVersion ov INNER JOIN CapcoAppBundle:Opinion o WITH ov.parent = o INNER JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs where ov.author = u AND ov.enabled = 1 AND o.isEnabled = 1 AND cs.isEnabled = 1 group by ov.author)')
              ->execute();
        }

        if ($force || $em->createQuery('SELECT COUNT(argument.id) FROM CapcoAppBundle:Argument argument')->getSingleScalarResult() > 0) {
          $em
            ->createQuery('update CapcoUserBundle:User u set u.argumentsCount = (
            select count(a.id)
            from CapcoAppBundle:Argument a
            LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH a.opinionVersion = ov
            LEFT JOIN CapcoAppBundle:Opinion o WITH a.opinion = o
            LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
            LEFT JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs
            LEFT JOIN CapcoAppBundle:Steps\ConsultationStep ovocs WITH ovo.step = ovocs
            WHERE a.Author = u AND a.isEnabled = 1 AND ((a.opinion IS NOT NULL AND o.isEnabled = 1 AND cs.isEnabled = 1) OR (a.opinionVersion IS NOT NULL AND ov.enabled = 1 AND ovo.isEnabled = 1 AND ovocs.isEnabled = 1))
            GROUP BY a.Author
            )')
            ->execute();
        }

        if ($force || $em->createQuery('SELECT COUNT(source.id) FROM CapcoAppBundle:Source source')->getSingleScalarResult() > 0) {
          $em
            ->createQuery('update CapcoUserBundle:User u set u.sourcesCount = (
            select count(s.id)
            from CapcoAppBundle:Source s
            LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH s.opinionVersion = ov
            LEFT JOIN CapcoAppBundle:Opinion o WITH s.Opinion = o
            LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
            LEFT JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs
            LEFT JOIN CapcoAppBundle:Steps\ConsultationStep ovocs WITH ovo.step = ovocs
            WHERE s.Author = u AND s.isEnabled = 1 AND ((s.Opinion IS NOT NULL AND o.isEnabled = 1 AND cs.isEnabled = 1) OR (s.opinionVersion IS NOT NULL AND ov.enabled = 1 AND ovo.isEnabled = 1 AND ovocs.isEnabled = 1))
            GROUP BY s.Author
            )')
            ->execute();
        }

        if ($force || $em->createQuery('SELECT COUNT(comment.id) FROM CapcoAppBundle:IdeaComment comment')->getSingleScalarResult() > 0) {
            $em
              ->createQuery('update CapcoUserBundle:User u set u.ideaCommentsCount = (select count(ic.id) from CapcoAppBundle:IdeaComment ic INNER JOIN CapcoAppBundle:Idea i WITH ic.Idea = i where ic.Author = u AND ic.isEnabled = 1 AND i.isEnabled = 1 group by ic.Author)')
              ->execute()
            ;
        }

        if ($force || $em->createQuery('SELECT COUNT(comment.id) FROM CapcoAppBundle:PostComment comment')->getSingleScalarResult() > 0) {
            $em
              ->createQuery('update CapcoUserBundle:User u set u.postCommentsCount = (select count(pc.id) from CapcoAppBundle:PostComment pc INNER JOIN CapcoAppBundle:Post p WITH pc.Post = p where pc.Author = u AND pc.isEnabled = 1 AND p.isPublished = 1 group by pc.Author)')
              ->execute()
            ;
        }

        if ($force || $em->createQuery('SELECT COUNT(comment.id) FROM CapcoAppBundle:EventComment comment')->getSingleScalarResult() > 0) {
            $em
              ->createQuery('update CapcoUserBundle:User u set u.eventCommentsCount = (select count(ec.id) from CapcoAppBundle:EventComment ec INNER JOIN CapcoAppBundle:Event e WITH ec.Event = e where ec.Author = u AND ec.isEnabled = 1 AND e.isEnabled = 1 group by ec.Author)')
              ->execute()
            ;
        }

        if ($force || $em->createQuery('SELECT COUNT(vote.id) FROM CapcoAppBundle:IdeaVote vote')->getSingleScalarResult() > 0) {
            $em
              ->createQuery('update CapcoUserBundle:User u set u.ideaVotesCount = (select count(iv.id) from CapcoAppBundle:IdeaVote iv INNER JOIN CapcoAppBundle:Idea i WITH iv.idea = i where iv.user = u AND iv.confirmed = 1 AND iv.private = 0 AND i.isEnabled = 1 group by iv.user)')
              ->execute()
            ;
        }

        if ($force || $em->createQuery('SELECT COUNT(vote.id) FROM CapcoAppBundle:CommentVote vote')->getSingleScalarResult() > 0) {
            $em
              ->createQuery('update CapcoUserBundle:User u set u.commentVotesCount = (select count(cv.id) from CapcoAppBundle:CommentVote cv INNER JOIN CapcoAppBundle:Comment c WITH cv.comment = c where cv.user = u AND cv.confirmed = 1 AND c.isEnabled = 1 group by cv.user)')
              ->execute()
            ;
        }

        if ($force || $em->createQuery('SELECT COUNT(vote.id) FROM CapcoAppBundle:OpinionVote vote')->getSingleScalarResult() > 0) {
            $em
              ->createQuery('update CapcoUserBundle:User u set u.opinionVotesCount = (select count(ov.id) from CapcoAppBundle:OpinionVote ov INNER JOIN CapcoAppBundle:Opinion o WITH ov.opinion = o INNER JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs where ov.user = u AND ov.confirmed = 1 AND o.isEnabled = 1 AND cs.isEnabled = 1 group by ov.user)')
              ->execute()
            ;
        }

        if ($force || $em->createQuery('SELECT COUNT(vote.id) FROM CapcoAppBundle:OpinionVersionVote vote')->getSingleScalarResult() > 0) {
            $em
              ->createQuery('update CapcoUserBundle:User u set u.opinionVersionVotesCount = (select count(ovv.id) from CapcoAppBundle:OpinionVersionVote ovv INNER JOIN CapcoAppBundle:OpinionVersion ov WITH ovv.opinionVersion = ov INNER JOIN CapcoAppBundle:Opinion o WITH ov.parent = o INNER JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs where ovv.user = u AND ovv.confirmed = 1 AND ov.enabled = 1 AND o.isEnabled = 1 AND cs.isEnabled = 1 group by ovv.user)')
              ->execute()
            ;
        }

        if ($force || $em->createQuery('SELECT COUNT(vote.id) FROM CapcoAppBundle:ProposalVote vote')->getSingleScalarResult() > 0) {
            $em
              ->createQuery('update CapcoUserBundle:User u set u.proposalVotesCount = (select count(pv.id) from CapcoAppBundle:ProposalVote pv INNER JOIN CapcoAppBundle:Proposal p WITH pv.proposal = p where pv.user = u AND pv.confirmed = 1 AND pv.private = 0 AND p.enabled = 1 group by pv.user)')
              ->execute()
            ;
        }

        if ($force || $em->createQuery('SELECT COUNT(vote.id) FROM CapcoAppBundle:ArgumentVote vote')->getSingleScalarResult() > 0) {
          $em
            ->createQuery('update CapcoUserBundle:User u set u.argumentVotesCount = (
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
            )')
          ->execute();
        }

        if ($force || $em->createQuery('SELECT COUNT(vote.id) FROM CapcoAppBundle:SourceVote vote')->getSingleScalarResult() > 0) {
          $em
            ->createQuery('update CapcoUserBundle:User u set u.sourceVotesCount = (
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
          )')
            ->execute();
        }
        $output->writeln('Calculation completed');
    }
}
