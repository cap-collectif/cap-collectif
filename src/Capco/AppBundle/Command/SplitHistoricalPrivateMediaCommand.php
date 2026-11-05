<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Filter\ContributionCompletionStatusFilter;
use Capco\AppBundle\Service\HistoricalMediaSplit;
use Capco\AppBundle\Service\MediaDocumentReferences;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\NullOutput;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'capco:media:split-historical-private', description: 'Move historical confidential references to private copies, preserving public URLs.')]
class SplitHistoricalPrivateMediaCommand extends Command
{
    public function __construct(private readonly EntityManagerInterface $em, private readonly HistoricalMediaSplit $split, private readonly MediaDocumentReferences $documents)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption('format', null, InputOption::VALUE_REQUIRED, 'Output format: text or json.', 'text')
            ->addOption('apply', null, InputOption::VALUE_NONE, 'Apply changes; default is a read-only simulation.')
            ->addOption('maintenance-confirmed', null, InputOption::VALUE_NONE, 'Confirm web writes, imports, workers and media purges are stopped for the entire run.')
            ->addOption('media-id', null, InputOption::VALUE_REQUIRED, 'Limit the run to one media ID.')
            ->addOption('batch-size', null, InputOption::VALUE_REQUIRED, 'Number of contents or media IDs per batch.', '100')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $started = hrtime(true);
        $json = 'json' === $input->getOption('format');
        $report = [
            'mode' => $input->getOption('apply') ? 'apply' : 'simulation',
            'completed' => false,
            'checked_media_count' => 0,
            'eligible_media_ids' => [],
            'converted_media_ids' => [],
            'errors' => [],
            'duration_seconds' => 0.0,
        ];
        $display = $json ? new NullOutput() : $output;

        try {
            $code = $this->runAudit($input, $display, $report);
        } catch (\Throwable $error) {
            $message = $error::class . ': audit interrupted; results are incomplete.';
            $report['errors'][] = ['media_id' => null, 'message' => $message];
            (new SymfonyStyle($input, $display))->error($message);
            $code = self::FAILURE;
        }
        $report['duration_seconds'] = round((hrtime(true) - $started) / 1e9, 3);
        if ($json) {
            $output->writeln(json_encode($report, \JSON_PRETTY_PRINT | \JSON_UNESCAPED_SLASHES | \JSON_THROW_ON_ERROR));
        }

        return $code;
    }

    /** @param array{mode: string, completed: bool, checked_media_count: int, eligible_media_ids: list<string>, converted_media_ids: list<string>, errors: list<array{media_id: ?string, message: string}>, duration_seconds: float} $report */
    private function runAudit(InputInterface $input, OutputInterface $output, array &$report): int
    {
        $io = new SymfonyStyle($input, $output);
        if (!\in_array($input->getOption('format'), ['text', 'json'], true)) {
            $io->error('format must be text or json.');

            return self::INVALID;
        }
        $apply = (bool) $input->getOption('apply');
        if ($apply && !$input->getOption('maintenance-confirmed')) {
            $report['errors'][] = ['media_id' => null, 'message' => 'Stop all writes and media purges, then pass --maintenance-confirmed.'];
            $io->error('Stop all writes and media purges, then pass --maintenance-confirmed.');

            return self::INVALID;
        }
        $batchSize = filter_var($input->getOption('batch-size'), \FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 1000]]);
        if (false === $batchSize) {
            $report['errors'][] = ['media_id' => null, 'message' => 'batch-size must be between 1 and 1000.'];
            $io->error('batch-size must be between 1 and 1000.');

            return self::INVALID;
        }
        $connection = $this->em->getConnection();
        if ($apply && 1 !== (int) $connection->fetchOne("SELECT GET_LOCK('capco-historical-media-split', 0)")) {
            $report['errors'][] = ['media_id' => null, 'message' => 'Another historical conversion is running.'];
            $io->error('Another historical conversion is running.');

            return self::FAILURE;
        }
        $filters = $this->em->getFilters();
        $filtered = $filters->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME);
        if ($filtered) {
            $filters->disable(ContributionCompletionStatusFilter::FILTER_NAME);
        }
        $last = '';
        $converted = $errors = 0;
        $results = [];

        try {
            $io->section('Inventory of content references');
            $progress = new ProgressBar($output);
            $progress->setFormat(' %current% contents [%elapsed:6s%] %message%');
            $progress->setMessage('Starting');
            $progress->minSecondsBetweenRedraws(1);
            $progress->start();
            $inventory = $this->documents->inventory($batchSize, static function (int $advance, string $class) use ($progress): void {
                $progress->setMessage($class);
                if ($advance) {
                    $progress->advance();
                }
            }, $input->getOption('media-id'));
            $progress->setMessage('Inventory complete');
            $progress->finish();
            $io->newLine(2);
            $io->text(sprintf('Inventory complete: %d contents, %d referenced media.', $progress->getProgress(), \count($inventory)));
            $io->section('Checking media');
            $total = $input->getOption('media-id') ? 1 : $this->em->getRepository(Media::class)->count([]);
            $io->progressStart($total);
            do {
                $query = $this->em->createQueryBuilder()->select('m.id')->from(Media::class, 'm')->where('m.id > :last')->setParameter('last', $last)->orderBy('m.id')->setMaxResults($batchSize);
                if ($input->getOption('media-id')) {
                    $query->andWhere('m.id = :id')->setParameter('id', $input->getOption('media-id'));
                }
                $rows = $query->getQuery()->getScalarResult();
                foreach ($rows as $row) {
                    $last = $row['id'];

                    try {
                        $media = $this->em->find(Media::class, $last);
                        $references = $inventory[$last] ?? [];
                        $plan = $this->split->inspect($media, $references);
                        if ($plan['public'] || $plan['classify']) {
                            $report['eligible_media_ids'][] = $last;
                            if ($apply) {
                                $this->split->apply($media, $references);
                                $report['converted_media_ids'][] = $last;
                            }
                            $results[] = sprintf('%s: %d public reference(s), %d confidential reference(s), %s', $last, $plan['public'], \count($plan['private']), $plan['public'] && $plan['private'] ? 'private copy required' : 'no copy required');
                            ++$converted;
                        }
                    } catch (\Throwable $error) {
                        ++$errors;
                        $message = \RuntimeException::class === $error::class ? $error->getMessage() : $error::class . ': conversion failed; original remains private.';
                        $report['errors'][] = ['media_id' => $last, 'message' => $message];
                        $io->error($last . ': ' . $message);
                    } finally {
                        ++$report['checked_media_count'];
                        $this->em->clear();
                        $io->progressAdvance();
                    }
                }
            } while (\count($rows) === $batchSize);
            $io->progressFinish();
        } finally {
            if ($filtered) {
                $filters->enable(ContributionCompletionStatusFilter::FILTER_NAME);
            }
            if ($apply) {
                $connection->executeQuery("SELECT RELEASE_LOCK('capco-historical-media-split')");
            }
        }
        $report['completed'] = true;
        $io->section($apply ? 'Converted media IDs' : 'Eligible media IDs');
        if ($results) {
            $io->listing($results);
        } else {
            $io->text('None.');
        }
        $io->text(sprintf('%s: %d media, %d errors.', $apply ? 'Applied' : 'Simulation', $converted, $errors));

        return $errors ? self::FAILURE : self::SUCCESS;
    }
}
