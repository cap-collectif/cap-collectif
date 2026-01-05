<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\GraphQL\Mutation\DeleteAccountByEmailMutation;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\DBAL\Logging\DebugStack;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Stopwatch\Stopwatch;

#[AsCommand(
    name: 'capco:benchmark:delete-account-by-email',
    description: 'Run deleteAccountByEmail across many users and report timings/memory/query stats.'
)]
class BenchmarkDeleteAccountByEmailCommand extends Command
{
    public function __construct(
        private readonly DeleteAccountByEmailMutation $mutation,
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $entityManager
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument(
                'emails',
                InputArgument::IS_ARRAY,
                'Email addresses to delete. If omitted, the command will pick recent non-admin users (use --limit).'
            )
            ->addOption('limit', 'l', InputOption::VALUE_REQUIRED, 'How many users to pick when no emails are provided.', 10)
            ->addOption('viewer-email', null, InputOption::VALUE_REQUIRED, 'Admin email used as mutation viewer.', 'admin@cap-collectif.com')
            ->addOption('profile-sql', null, InputOption::VALUE_NONE, 'Enable SQL profiling (query count and slowest query).')
            ->addOption('force', 'f', InputOption::VALUE_NONE, 'Skip confirmation prompt.')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $emails = $input->getArgument('emails');
        $viewerEmail = (string) $input->getOption('viewer-email');
        $profileSql = (bool) $input->getOption('profile-sql');
        $limit = (int) $input->getOption('limit');

        $viewer = $this->userRepository->findOneByEmail($viewerEmail);
        if (!$viewer instanceof User) {
            $io->error(sprintf('Viewer user "%s" not found.', $viewerEmail));

            return Command::FAILURE;
        }

        if (!$emails) {
            $emails = $this->pickCandidateEmails($limit);
        }

        if (!$emails) {
            $io->warning('No users found to delete.');

            return Command::SUCCESS;
        }

        if (!$input->getOption('force') && !$io->confirm(sprintf('This will delete %d users. Continue?', \count($emails)), false)) {
            return Command::SUCCESS;
        }

        $stopwatch = new Stopwatch();
        $perUserStopwatch = new Stopwatch();
        $sqlLogger = null;
        $connection = $this->entityManager->getConnection();
        $previousSqlLogger = $connection->getConfiguration()->getSQLLogger();
        if ($profileSql) {
            $sqlLogger = new DebugStack();
            $connection->getConfiguration()->setSQLLogger($sqlLogger);
        }

        $io->section(sprintf('Starting deleteAccountByEmail for %d users...', \count($emails)));
        $overallEvent = $stopwatch->start('delete_accounts');
        $rows = [];
        $peakMemory = 0;

        foreach ($emails as $email) {
            $eventName = 'delete_' . $email;
            $perUserStopwatch->start($eventName);
            $status = 'ok';
            $message = '';

            try {
                $result = ($this->mutation)(new Arg(['input' => ['email' => $email]]), $viewer);
                if (isset($result['errorCode'])) {
                    $status = 'error';
                    $message = (string) $result['errorCode'];
                }
            } catch (\Throwable $e) {
                $status = 'error';
                $message = $e->getMessage();
            }
            // Keep the UnitOfWork small when iterating over many users.
            $this->entityManager->clear();
            $event = $perUserStopwatch->stop($eventName);
            $peakMemory = max($peakMemory, memory_get_peak_usage(true));
            $rows[] = [
                $email,
                $event->getDuration(),
                round($event->getMemory() / 1024 / 1024, 2),
                $status,
                $message,
            ];
        }

        $overallEvent = $stopwatch->stop('delete_accounts');
        if ($profileSql) {
            $connection->getConfiguration()->setSQLLogger($previousSqlLogger);
        }

        $io->table(['Email', 'Duration (ms)', 'Memory (MB)', 'Status', 'Message'], $rows);
        $io->success(sprintf(
            'Deleted %d users in %d ms (peak memory %.2f MB).',
            \count($emails),
            $overallEvent->getDuration(),
            $peakMemory / 1024 / 1024
        ));

        if ($profileSql && $sqlLogger instanceof DebugStack) {
            $slowest = $this->extractSlowestQuery($sqlLogger);
            $io->section('SQL profile');
            $io->writeln(sprintf('Total queries: %d', \count($sqlLogger->queries)));
            if ($slowest) {
                $io->writeln(sprintf('Slowest query: %.2f ms', $slowest['time'] * 1000));
                $io->writeln($slowest['sql']);
            }
        }

        return Command::SUCCESS;
    }

    /**
     * @return array<int, string>
     */
    private function pickCandidateEmails(int $limit): array
    {
        $rows = $this->userRepository->createQueryBuilder('u')
            ->select('u.email')
            ->where('u.deletedAccountAt IS NULL')
            ->andWhere('u.roles NOT LIKE :adminRole')
            ->orderBy('u.createdAt', 'DESC')
            ->setParameter('adminRole', '%ADMIN%')
            ->setMaxResults($limit)
            ->getQuery()
            ->getScalarResult()
        ;

        return array_map(static fn (array $row): string => (string) $row['email'], $rows);
    }

    /**
     * @return null|array{sql: string, time: float}
     */
    private function extractSlowestQuery(DebugStack $stack): ?array
    {
        $slowest = null;
        foreach ($stack->queries as $query) {
            $time = $query['executionMS'] ?? 0;
            if (null === $slowest || $time > $slowest['time']) {
                $slowest = ['sql' => $query['sql'], 'time' => $time];
            }
        }

        return $slowest;
    }
}
