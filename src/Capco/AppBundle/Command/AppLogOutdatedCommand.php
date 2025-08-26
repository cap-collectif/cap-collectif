<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\AppLog;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class AppLogOutdatedCommand extends Command
{
    private const BATCH_SIZE = 1000;

    public function __construct(
        private readonly EntityManagerInterface $em
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setName('capco:app-log:outdated')
            ->setDescription('Remove outdated app logs')
            ->addOption(
                'date',
                'd',
                InputArgument::OPTIONAL,
                'set this option to specify an outdated date with Y-m-d format'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $dateOption = $input->getOption('date');

        $dateLimit = (new \DateTime())->modify('-6 months');

        if (false !== \DateTime::createFromFormat('Y-m-d', $dateOption)) {
            throw new \RuntimeException('The date option must be a valid date format : Y-m-d');
        }

        $totalLogs = (int) $this->em->createQueryBuilder()
            ->select('COUNT(l.id)')
            ->from(AppLog::class, 'l')
            ->where('l.createdAt <= :dateLimit')
            ->setParameter(':dateLimit', $dateLimit)
            ->getQuery()
            ->getSingleScalarResult()
        ;

        $output->writeln(sprintf('%s logs to delete have been found', $totalLogs));

        $progress = new ProgressBar($output, $totalLogs);
        $progress->start();

        $deletedLogCount = 0;

        do {
            $queryBuilder = $this->em->createQueryBuilder();
            $queryBuilder->select('l.id')
                ->from(AppLog::class, 'l')
                ->where('l.createdAt <= :dateLimit')
                ->setParameter(':dateLimit', $dateLimit)
                ->setMaxResults(self::BATCH_SIZE)
            ;

            $ids = $queryBuilder->getQuery()->getScalarResult();

            $logToDeleteCount = \count($ids);

            if ($logToDeleteCount > 0) {
                $this->em->createQueryBuilder()
                    ->delete(AppLog::class, 'l')
                    ->where('l.id IN (:ids)')
                    ->setParameter(':ids', array_column($ids, 'id'))
                    ->getQuery()
                    ->execute()
                ;

                $deletedLogCount += $logToDeleteCount;

                $progress->advance($logToDeleteCount);

                $this->em->clear();
            }
        } while ($logToDeleteCount > 0);

        $progress->finish();

        $output->writeln(sprintf('The logs (%s) prior to the date %s have been deleted.', $deletedLogCount, $dateLimit->format('Y-m-d')));

        return 0;
    }
}
