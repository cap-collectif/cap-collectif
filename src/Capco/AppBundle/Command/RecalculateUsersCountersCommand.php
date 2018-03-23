<?php

namespace Capco\AppBundle\Command;

use Doctrine\ORM\EntityManager;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class RecalculateUsersCountersCommand extends ContainerAwareCommand
{
    public $force;

    /**
     * @var EntityManager
     */
    public $em;
    public $redis;
    public $ids;

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

    protected function compute($dql, $native = false)
    {
        if ($this->force) {
            if ($native) {
                $this->em->getConnection()->executeUpdate($dql);
            } else {
                $this->em->createQuery($dql)->execute();
            }
        } else {
            $this->executeOnlyChangesFromLastRun($dql);
        }
    }

    protected function executeOnlyChangesFromLastRun($dql)
    {
        if ($this->ids && count($this->ids) > 0) {
            $dql .= ' where u.id in (:ids)';
            $query = $this->em->createQuery($dql)->setParameter('ids', $this->ids);
            $query->execute();
        }
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $redisKey = 'recalculate_user_counters';
        $this->force = $input->getOption('force');
        $container = $this->getContainer();
        $this->em = $container->get('doctrine')->getManager();
        $redis = $container->get('snc_redis.default');
        $this->ids = $redis->smembers($redisKey);
        $redis->del($redisKey);

        $this->compute('UPDATE CapcoUserBundle:User u set u.repliesCount = (
          SELECT count(r.id) from CapcoAppBundle:Reply r
          WHERE r.author = u AND r.enabled = 1 AND r.private = 0 AND r.expired = 0
          GROUP BY r.author
        )');

        // Recalculate admin projects count
        $this->em
          ->createQuery('UPDATE CapcoUserBundle:User u SET u.projectsCount = (
            SELECT count(p.id) FROM CapcoAppBundle:Project p
            WHERE p.Author = u AND p.isEnabled = 1
            GROUP BY p.Author
            )
            WHERE u.roles like :role
          ')
          ->setParameter('role', '%"ROLE_SUPER_ADMIN"%')
          ->execute()
        ;

        if ($this->force || $this->em->createQuery('SELECT COUNT(idea.id) FROM CapcoAppBundle:Idea idea')->getSingleScalarResult() > 0) {
            $this->em->createQuery('UPDATE CapcoUserBundle:User u SET u.ideasCount = (
              SELECT count(i.id) from CapcoAppBundle:Idea i
              WHERE i.Author = u AND i.isEnabled = 1
              GROUP BY i.Author
            )')->execute();
        }

        $this->compute('UPDATE CapcoUserBundle:User u set u.proposalsCount = (
          SELECT count(p.id) FROM CapcoAppBundle:Proposal p
          WHERE p.author = u AND p.enabled = 1 AND p.expired = 0 AND p.draft = 0 AND p.isTrashed = 0 AND p.deletedAt IS NULL
          GROUP BY p.author
        )');

        if ($this->force || $this->em->createQuery('SELECT COUNT(opinion.id) FROM CapcoAppBundle:Opinion opinion')->getSingleScalarResult() > 0) {
            $query = $this->em->createQuery('UPDATE CapcoUserBundle:User u SET u.opinionsCount = (
              SELECT count(o.id) from CapcoAppBundle:Opinion o
              INNER JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs
              WHERE o.Author = u AND o.isEnabled = 1 AND cs.isEnabled = 1 GROUP BY o.Author
            )');
            $query->execute();
        }

        $this->compute('UPDATE CapcoUserBundle:User u SET u.opinionVersionsCount = (
          SELECT count(ov.id) from CapcoAppBundle:OpinionVersion ov
          INNER JOIN CapcoAppBundle:Opinion o with ov.parent = o
          INNER JOIN CapcoAppBundle:Steps\ConsultationStep cs with o.step = cs
          WHERE ov.author = u AND ov.enabled = 1 AND ov.expired = 0 AND o.expired = 0 AND o.isEnabled = 1 AND cs.isEnabled = 1 GROUP BY ov.author
        )');

        $this->compute('UPDATE CapcoUserBundle:User u SET u.argumentsCount = (
            SELECT count(a.id)
            FROM CapcoAppBundle:Argument a
            LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH a.opinionVersion = ov
            LEFT JOIN CapcoAppBundle:Opinion o WITH a.opinion = o
            LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
            LEFT JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs
            LEFT JOIN CapcoAppBundle:Steps\ConsultationStep ovocs WITH ovo.step = ovocs
            WHERE a.Author = u AND a.isEnabled = 1 AND a.expired = 0 AND (
              (a.opinion IS NOT NULL AND o.isEnabled = 1 AND o.expired = 0 AND cs.isEnabled = 1)
              OR
              (a.opinionVersion IS NOT NULL AND ov.enabled = 1 AND ov.expired = 0 AND ovo.expired = 0 AND ovo.isEnabled = 1 AND ovocs.isEnabled = 1)
            )
            GROUP BY a.Author
        )');

        $this->compute('UPDATE CapcoUserBundle:User u set u.sourcesCount = (
            SELECT count(s.id)
            FROM CapcoAppBundle:Source s
            LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH s.opinionVersion = ov
            LEFT JOIN CapcoAppBundle:Opinion o WITH s.Opinion = o
            LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
            LEFT JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs
            LEFT JOIN CapcoAppBundle:Steps\ConsultationStep ovocs WITH ovo.step = ovocs
            WHERE s.Author = u AND s.isEnabled = 1 AND s.expired = 0 AND (
              (s.Opinion IS NOT NULL AND o.isEnabled = 1 AND o.expired = 0 AND cs.isEnabled = 1)
              OR
              (s.opinionVersion IS NOT NULL AND ov.enabled = 1 AND ov.expired = 0 AND ovo.isEnabled = 1 AND ovocs.isEnabled = 1)
            )
            GROUP BY s.Author
        )');

        $this->compute('UPDATE CapcoUserBundle:User u set u.ideaCommentsCount = (
          SELECT count(ic.id) from CapcoAppBundle:IdeaComment ic INNER JOIN CapcoAppBundle:Idea i WITH ic.Idea = i
          WHERE ic.Author = u AND ic.isEnabled = 1 AND i.isEnabled = 1 GROUP BY ic.Author
        )');

        if ($this->force || $this->em->createQuery('SELECT COUNT(comment.id) FROM CapcoAppBundle:PostComment comment')->getSingleScalarResult() > 0) {
            $this->em
              ->createQuery('UPDATE CapcoUserBundle:User u set u.postCommentsCount = (
                SELECT count(pc.id) from CapcoAppBundle:PostComment pc
                INNER JOIN CapcoAppBundle:Post p WITH pc.post = p
                WHERE pc.Author = u AND pc.isEnabled = 1 AND p.isPublished = 1 GROUP BY pc.Author
              )')
              ->execute()
            ;
        }

        if ($this->force || $this->em->createQuery('SELECT COUNT(comment.id) FROM CapcoAppBundle:EventComment comment')->getSingleScalarResult() > 0) {
            $this->em
              ->createQuery('UPDATE CapcoUserBundle:User u set u.eventCommentsCount = (
                SELECT count(ec.id) from CapcoAppBundle:EventComment ec
                INNER JOIN CapcoAppBundle:Event e WITH ec.Event = e
                WHERE ec.Author = u AND ec.isEnabled = 1 AND e.isEnabled = 1 GROUP BY ec.Author
              )')
              ->execute()
            ;
        }

        if ($this->force || $this->em->createQuery('SELECT COUNT(vote.id) FROM CapcoAppBundle:IdeaVote vote')->getSingleScalarResult() > 0) {
            $this->em
              ->createQuery('UPDATE CapcoUserBundle:User u set u.ideaVotesCount = (
                SELECT count(iv.id) from CapcoAppBundle:IdeaVote iv
                INNER JOIN CapcoAppBundle:Idea i WITH iv.idea = i
                WHERE iv.user = u AND iv.expired = 0 AND iv.private = 0 AND i.isEnabled = 1 GROUP BY iv.user
              )')
              ->execute()
            ;
        }

        if ($this->force || $this->em->createQuery('SELECT COUNT(vote.id) FROM CapcoAppBundle:CommentVote vote')->getSingleScalarResult() > 0) {
            $this->em
              ->createQuery('UPDATE CapcoUserBundle:User u set u.commentVotesCount = (
                SELECT count(cv.id) from CapcoAppBundle:CommentVote cv
                INNER JOIN CapcoAppBundle:Comment c WITH cv.comment = c
                WHERE cv.user = u AND cv.expired = 0 AND c.isEnabled = 1 GROUP BY cv.user
              )')
              ->execute()
            ;
        }

        if ($this->force || $this->em->createQuery('SELECT COUNT(vote.id) FROM CapcoAppBundle:OpinionVote vote')->getSingleScalarResult() > 0) {
            $this->em
              ->createQuery('UPDATE CapcoUserBundle:User u set u.opinionVotesCount = (
                SELECT count(ov.id) from CapcoAppBundle:OpinionVote ov
                INNER JOIN CapcoAppBundle:Opinion o WITH ov.opinion = o
                INNER JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs
                WHERE ov.user = u AND ov.expired = 0 AND o.isEnabled = 1 AND cs.isEnabled = 1 GROUP BY ov.user
              )')
              ->execute()
            ;
        }

        $this->compute('UPDATE CapcoUserBundle:User u set u.opinionVersionVotesCount = (
          SELECT count(ovv.id) from CapcoAppBundle:OpinionVersionVote ovv
          INNER JOIN CapcoAppBundle:OpinionVersion ov WITH ovv.opinionVersion = ov
          INNER JOIN CapcoAppBundle:Opinion o WITH ov.parent = o
          INNER JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs
          WHERE ovv.user = u AND ovv.expired = 0 AND ov.enabled = 1 AND o.isEnabled = 1 AND cs.isEnabled = 1
          GROUP BY ovv.user
        )');

        $this->compute('UPDATE fos_user u set u.proposal_votes_count = (
          SELECT count(pv.id) from votes pv
          INNER JOIN proposal p ON pv.proposal_id = p.id
          WHERE pv.voter_id = u.id AND pv.expired = 0 AND pv.private = 0 AND p.enabled = 1 AND p.expired = 0 AND p.is_draft = 0 AND p.trashed = 0 AND p.deleted_at IS NULL
          GROUP BY pv.voter_id
        )', true);

        $this->compute('UPDATE CapcoUserBundle:User u set u.argumentVotesCount = (
            SELECT count(av.id)
            from CapcoAppBundle:ArgumentVote av
            LEFT JOIN CapcoAppBundle:Argument a WITH av.argument = a
            LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH a.opinionVersion = ov
            LEFT JOIN CapcoAppBundle:Opinion o WITH a.opinion = o
            LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
            LEFT JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs
            LEFT JOIN CapcoAppBundle:Steps\ConsultationStep ovocs WITH ovo.step = ovocs
            WHERE av.user = u AND av.expired = 0 AND a.isEnabled = 1 AND (
              (a.opinion IS NOT NULL AND o.isEnabled = 1 AND o.expired = 0 AND cs.isEnabled = 1)
              OR
              (a.opinionVersion IS NOT NULL AND ov.enabled = 1 AND ov.expired = 0 AND ovo.isEnabled = 1 AND ovocs.isEnabled = 1)
            )
            GROUP BY av.user
        )');

        $this->compute('UPDATE CapcoUserBundle:User u set u.sourceVotesCount = (
            SELECT count(sv.id)
            from CapcoAppBundle:SourceVote sv
            LEFT JOIN CapcoAppBundle:Source s WITH sv.source = s
            LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH s.opinionVersion = ov
            LEFT JOIN CapcoAppBundle:Opinion o WITH s.Opinion = o
            LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
            LEFT JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs
            LEFT JOIN CapcoAppBundle:Steps\ConsultationStep ovocs WITH ovo.step = ovocs
            WHERE sv.user = u AND sv.expired = 0 AND s.isEnabled = 1 AND s.expired = 0 AND (
              (s.Opinion IS NOT NULL AND o.isEnabled = 1 AND o.expired =0 AND cs.isEnabled = 1)
              OR
              (s.opinionVersion IS NOT NULL AND ov.enabled = 1 AND ov.expired = 0 AND ovo.isEnabled = 1 AND ovocs.isEnabled = 1)
            )
            GROUP BY sv.user
       )');

        $output->writeln('Calculation completed');
    }
}
