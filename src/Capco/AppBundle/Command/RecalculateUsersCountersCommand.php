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
        $this->setName('capco:compute:users-counters')
            ->setDescription('Recalculate the users counters')
            ->addOption(
                'force',
                false,
                InputOption::VALUE_NONE,
                'set this option to force complete recomputation'
            );
    }

    protected function compute(string $dql, bool $native = false): void
    {
        if ($this->force) {
            $native
                ? $this->em->getConnection()->executeUpdate($dql)
                : $this->em->createQuery($dql)->execute();
        } else {
            $this->executeOnlyChangesFromLastRun($dql, $native);
        }
    }

    protected function executeOnlyChangesFromLastRun(string $dql, bool $native = false): void
    {
        if ($this->ids && \count($this->ids) > 0) {
            $dql .= ' where u.id in (:ids)';

            if ($native) {
                $ids = implode(',', $this->ids);
                $query = $this->em->getConnection()->prepare($dql);
                $query->bindParam(':ids', $ids);
            } else {
                $query = $this->em->createQuery($dql)->setParameter('ids', $this->ids);
            }
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

        $this->compute(
            'UPDATE CapcoUserBundle:User u set u.proposalsCount = (
          SELECT count(p.id) FROM CapcoAppBundle:Proposal p
          WHERE p.author = u AND p.published = 1 AND p.draft = 0 AND p.trashedAt IS NULL AND p.deletedAt IS NULL
          GROUP BY p.author
        )'
        );

        if (
            $this->force ||
            $this->em
                ->createQuery('SELECT COUNT(opinion.id) FROM CapcoAppBundle:Opinion opinion')
                ->getSingleScalarResult() > 0
        ) {
            $query = $this->em->createQuery(
                'UPDATE CapcoUserBundle:User u SET u.opinionsCount = (
              SELECT count(o.id) from CapcoAppBundle:Opinion o
              INNER JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs
              WHERE o.Author = u AND o.published = 1 AND cs.isEnabled = 1 GROUP BY o.Author
            )'
            );
            $query->execute();
        }

        $this->compute(
            'UPDATE CapcoUserBundle:User u SET u.opinionVersionsCount = (
          SELECT count(ov.id) from CapcoAppBundle:OpinionVersion ov
          INNER JOIN CapcoAppBundle:Opinion o with ov.parent = o
          INNER JOIN CapcoAppBundle:Steps\ConsultationStep cs with o.step = cs
          WHERE ov.author = u AND ov.published = 1 AND o.published = 1 AND cs.isEnabled = 1 GROUP BY ov.author
        )'
        );

        $this->compute(
            'UPDATE CapcoUserBundle:User u SET u.argumentsCount = (
            SELECT count(a.id)
            FROM CapcoAppBundle:Argument a
            LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH a.opinionVersion = ov
            LEFT JOIN CapcoAppBundle:Opinion o WITH a.opinion = o
            LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
            LEFT JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs
            LEFT JOIN CapcoAppBundle:Steps\ConsultationStep ovocs WITH ovo.step = ovocs
            WHERE a.Author = u AND a.published = 1 AND (
              (a.opinion IS NOT NULL AND o.published = 1 AND cs.isEnabled = 1)
              OR
              (a.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovocs.isEnabled = 1)
            )
            GROUP BY a.Author
        )'
        );

        $this->compute(
            'UPDATE CapcoUserBundle:User u set u.sourcesCount = (
            SELECT count(s.id)
            FROM CapcoAppBundle:Source s
            LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH s.opinionVersion = ov
            LEFT JOIN CapcoAppBundle:Opinion o WITH s.opinion = o
            LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
            LEFT JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs
            LEFT JOIN CapcoAppBundle:Steps\ConsultationStep ovocs WITH ovo.step = ovocs
            WHERE s.author = u AND s.published = 1 AND (
              (s.opinion IS NOT NULL AND o.published = 1 AND cs.isEnabled = 1)
              OR
              (s.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovocs.isEnabled = 1)
            )
            GROUP BY s.author
        )'
        );

        if (
            $this->force ||
            $this->em
                ->createQuery('SELECT COUNT(comment.id) FROM CapcoAppBundle:PostComment comment')
                ->getSingleScalarResult() > 0
        ) {
            $this->em
                ->createQuery(
                    'UPDATE CapcoUserBundle:User u set u.postCommentsCount = (
                SELECT count(pc.id) from CapcoAppBundle:PostComment pc
                INNER JOIN CapcoAppBundle:Post p WITH pc.post = p
                WHERE pc.Author = u AND pc.published = 1 GROUP BY pc.Author
              )'
                )
                ->execute();
        }

        if (
            $this->force ||
            $this->em
                ->createQuery(
                    'SELECT COUNT(comment.id) FROM CapcoAppBundle:ProposalComment comment'
                )
                ->getSingleScalarResult() > 0
        ) {
            $this->em
                ->createQuery(
                    'UPDATE CapcoUserBundle:User u set u.proposalCommentsCount = (
                SELECT count(pc.id) from CapcoAppBundle:ProposalComment pc
                INNER JOIN CapcoAppBundle:Proposal p WITH pc.proposal = p
                WHERE pc.Author = u AND pc.published = 1 GROUP BY pc.Author
              )'
                )
                ->execute();
        }

        if (
            $this->force ||
            $this->em
                ->createQuery('SELECT COUNT(vote.id) FROM CapcoAppBundle:CommentVote vote')
                ->getSingleScalarResult() > 0
        ) {
            $this->em
                ->createQuery(
                    'UPDATE CapcoUserBundle:User u set u.commentVotesCount = (
                SELECT count(cv.id) from CapcoAppBundle:CommentVote cv
                INNER JOIN CapcoAppBundle:Comment c WITH cv.comment = c
                WHERE cv.user = u AND c.published = 1 GROUP BY cv.user
              )'
                )
                ->execute();
        }

        if (
            $this->force ||
            $this->em
                ->createQuery('SELECT COUNT(vote.id) FROM CapcoAppBundle:OpinionVote vote')
                ->getSingleScalarResult() > 0
        ) {
            $this->em
                ->createQuery(
                    'UPDATE CapcoUserBundle:User u set u.opinionVotesCount = (
                SELECT count(ov.id) from CapcoAppBundle:OpinionVote ov
                INNER JOIN CapcoAppBundle:Opinion o WITH ov.opinion = o
                INNER JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs
                WHERE ov.user = u AND o.published = 1 AND cs.isEnabled = 1 GROUP BY ov.user
              )'
                )
                ->execute();
        }

        $this->compute(
            'UPDATE CapcoUserBundle:User u set u.opinionVersionVotesCount = (
          SELECT count(ovv.id) from CapcoAppBundle:OpinionVersionVote ovv
          INNER JOIN CapcoAppBundle:OpinionVersion ov WITH ovv.opinionVersion = ov
          INNER JOIN CapcoAppBundle:Opinion o WITH ov.parent = o
          INNER JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs
          WHERE ovv.user = u AND ov.published = 1 AND o.published = 1 AND cs.isEnabled = 1
          GROUP BY ovv.user
        )'
        );

        $this->compute(
            'UPDATE fos_user u set u.proposal_votes_count = (
          SELECT count(pv.id) from votes pv
          INNER JOIN proposal p ON pv.proposal_id = p.id
          WHERE pv.voter_id = u.id AND pv.published = 1 AND pv.private = 0 AND p.published = 1 AND p.is_draft = 0 AND p.trashed_at IS NULL AND p.deleted_at IS NULL
          GROUP BY pv.voter_id
        )',
            true
        );

        $this->compute(
            'UPDATE CapcoUserBundle:User u set u.argumentVotesCount = (
            SELECT count(av.id)
            from CapcoAppBundle:ArgumentVote av
            LEFT JOIN CapcoAppBundle:Argument a WITH av.argument = a
            LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH a.opinionVersion = ov
            LEFT JOIN CapcoAppBundle:Opinion o WITH a.opinion = o
            LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
            LEFT JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs
            LEFT JOIN CapcoAppBundle:Steps\ConsultationStep ovocs WITH ovo.step = ovocs
            WHERE av.user = u AND a.published = 1 AND (
              (a.opinion IS NOT NULL AND o.published = 1 AND cs.isEnabled = 1)
              OR
              (a.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovocs.isEnabled = 1)
            )
            GROUP BY av.user
        )'
        );

        $this->compute(
            'UPDATE CapcoUserBundle:User u set u.sourceVotesCount = (
            SELECT count(sv.id)
            from CapcoAppBundle:SourceVote sv
            LEFT JOIN CapcoAppBundle:Source s WITH sv.source = s
            LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH s.opinionVersion = ov
            LEFT JOIN CapcoAppBundle:Opinion o WITH s.opinion = o
            LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
            LEFT JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH o.step = cs
            LEFT JOIN CapcoAppBundle:Steps\ConsultationStep ovocs WITH ovo.step = ovocs
            WHERE sv.user = u AND s.published = 1 AND (
              (s.opinion IS NOT NULL AND o.published = 1 AND cs.isEnabled = 1)
              OR
              (s.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovocs.isEnabled = 1)
            )
            GROUP BY sv.user
       )'
        );

        $output->writeln('Calculation completed');
    }
}
