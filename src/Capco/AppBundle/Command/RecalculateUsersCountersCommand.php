<?php

namespace Capco\AppBundle\Command;

use Doctrine\ORM\EntityManagerInterface;
use Predis\ClientInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Command\LockableTrait;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class RecalculateUsersCountersCommand extends Command
{
    use LockableTrait;

    public $force;
    public $ids;

    protected static $defaultName = 'capco:compute:users-counters';

    public function __construct(public EntityManagerInterface $em, public ClientInterface $redis)
    {
        parent::__construct();
    }

    protected function configure()
    {
        $this->setDescription('Recalculate the users counters')->addOption(
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
                ? $this->em->getConnection()->executeStatement($dql)
                : $this->em->createQuery($dql)->execute();
        } else {
            $this->executeOnlyChangesFromLastRun($dql, $native);
        }
    }

    protected function executeOnlyChangesFromLastRun(string $dql, bool $native = false): void
    {
        if ($this->ids && \count($this->ids) > 0) {
            $dql .= ' where fos_user.id in (:ids)';

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
        if (!$this->lock()) {
            $output->writeln('The command is already running in another process.');

            return 0;
        }
        $redisKey = 'recalculate_user_counters';
        $this->force = $input->getOption('force');
        $this->ids = $this->redis->smembers($redisKey);
        $this->redis->del($redisKey);

        $this->compute(
            "UPDATE fos_user SET opinion_version_votes_count =
                IFNULL((SELECT count(v0_.id) AS sclr_0 FROM votes v0_
                INNER JOIN opinion_version o1_ ON (v0_.opinion_version_id = o1_.id)
                INNER JOIN opinion o2_ ON (o1_.opinion_id = o2_.id)
                INNER JOIN consultation c3_ ON (o2_.consultation_id = c3_.id)
                INNER JOIN step s4_ ON (c3_.step_id = s4_.id) AND s4_.step_type IN ('consultation')
                WHERE (v0_.voter_id = fos_user.id AND
                o1_.published = 1 AND o2_.published = 1 AND s4_.is_enabled = 1)
                AND v0_.voteType IN ('opinionVersion') GROUP BY v0_.voter_id),0)",
            true
        );

        $this->compute(
            'UPDATE fos_user set fos_user.proposal_votes_count =
          IFNULL((SELECT count(pv.id) from votes pv
          INNER JOIN proposal p ON pv.proposal_id = p.id
          WHERE pv.voter_id = fos_user.id AND pv.published = 1 AND pv.private = 0 AND p.published = 1 AND p.is_draft = 0 AND p.trashed_at IS NULL AND p.deleted_at IS NULL
          GROUP BY pv.voter_id
        ),0)',
            true
        );

        $this->compute(
            "UPDATE fos_user SET argument_votes_count = IFNULL((SELECT count(DISTINCT v0_.id) AS sclr_0 FROM votes v0_ LEFT JOIN argument a1_ ON (v0_.argument_id = a1_.id) LEFT JOIN opinion_version o2_ ON (a1_.opinion_version_id = o2_.id) LEFT JOIN opinion o3_ ON (a1_.opinion_id = o3_.id) LEFT JOIN consultation c4_ ON (o3_.consultation_id = c4_.id) LEFT JOIN step s5_ ON s5_.step_type IN ('consultation') LEFT JOIN opinion o6_ ON (o2_.opinion_id = o6_.id) LEFT JOIN consultation c7_ ON (o6_.consultation_id = c7_.id) LEFT JOIN step s8_ ON s8_.step_type IN ('consultation') WHERE (v0_.voter_id = fos_user.id AND a1_.published = 1 AND ((c4_.step_id = s5_.id AND a1_.opinion_id IS NOT NULL AND o3_.published = 1 AND s5_.is_enabled = 1) OR (c7_.step_id = s8_.id AND a1_.opinion_version_id IS NOT NULL AND o2_.published = 1 AND o6_.published = 1 AND s8_.is_enabled = 1))) AND v0_.voteType IN ('argument') GROUP BY v0_.voter_id),0)",
            true
        );

        $this->compute(
            "UPDATE fos_user SET source_votes_count = IFNULL((SELECT count(v0_.id) AS sclr_0 FROM votes v0_ LEFT JOIN source s1_ ON (v0_.source_id = s1_.id) LEFT JOIN opinion_version o2_ ON (s1_.opinion_version_id = o2_.id) LEFT JOIN opinion o3_ ON (s1_.opinion_id = o3_.id) LEFT JOIN consultation c4_ ON (o3_.consultation_id = c4_.id) INNER JOIN step s5_ ON (c4_.step_id = s5_.id) AND s5_.step_type IN ('consultation') LEFT JOIN opinion o6_ ON (o2_.opinion_id = o6_.id) LEFT JOIN consultation c7_ ON (o6_.consultation_id = c7_.id) INNER JOIN step s8_ ON (c7_.step_id = s8_.id) AND s8_.step_type IN ('consultation') WHERE (v0_.voter_id = fos_user.id AND s1_.published = 1 AND ((s1_.opinion_id IS NOT NULL AND o3_.published = 1 AND s5_.is_enabled = 1) OR (s1_.opinion_version_id IS NOT NULL AND o2_.published = 1 AND o6_.published = 1 AND s8_.is_enabled = 1))) AND v0_.voteType IN ('source') GROUP BY v0_.voter_id),0)",
            true
        );

        $output->writeln('<info>User counters calculation completed !</info>');

        return 0;
    }
}
