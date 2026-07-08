<?php

namespace Capco\AppBundle\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Process\Process;

#[AsCommand(
    name: 'capco:import:idf-proposals-on-instance',
    description: 'Copy IDF proposal import files to an instance and launch the remote import.'
)]
class ImportIDFProposalsOnInstanceCommand extends Command
{
    private const DEFAULT_REMOTE_APP_DIR = '/var/www';
    private const DEFAULT_REMOTE_MEDIA_ROOT = 'public/media';
    private const DEFAULT_IMPORT_COMMAND = 'capco:import:idf-proposals-from-csv';
    private const REFERENCE_COLUMN = 'Référence administrative - Demande';
    private const MEDIA_URL_COLUMN = 'media_url';
    private const MEDIA_EXTENSION = 'png';

    public function __construct(
        private readonly Filesystem $filesystem,
        ?string $name = null
    ) {
        parent::__construct($name);
    }

    protected function configure(): void
    {
        $this
            ->addArgument('instanceName', InputArgument::REQUIRED, 'Instance name used by capcocli.')
            ->addArgument('instance-url', InputArgument::REQUIRED, 'Instance public host used to generate media URLs.')
            ->addArgument('mediaDirectory', InputArgument::REQUIRED, 'Local media directory to copy.')
            ->addArgument('importFile', InputArgument::REQUIRED, 'Local CSV import file to copy.')
            ->addArgument('proposalFormId', InputArgument::REQUIRED, 'Remote proposal form id.')
            ->addOption('delimiter', 'd', InputOption::VALUE_REQUIRED, 'Delimiter used by the CSV import.', ';')
            ->addOption('remote-app-dir', null, InputOption::VALUE_REQUIRED, 'Remote application directory.', self::DEFAULT_REMOTE_APP_DIR)
            ->addOption('remote-media-root', null, InputOption::VALUE_REQUIRED, 'Remote media root directory.', self::DEFAULT_REMOTE_MEDIA_ROOT)
            ->addOption('import-command', null, InputOption::VALUE_REQUIRED, 'Remote Symfony import command.', self::DEFAULT_IMPORT_COMMAND)
            ->addOption('dry-run', null, InputOption::VALUE_NONE, 'Print capcocli commands without executing them.')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $instanceName = (string) $input->getArgument('instanceName');
        $mediaDirectory = rtrim((string) $input->getArgument('mediaDirectory'), '/');
        $importFile = (string) $input->getArgument('importFile');
        $proposalFormId = (string) $input->getArgument('proposalFormId');
        $instanceUrl = $this->normalizeInstanceUrl((string) $input->getArgument('instance-url'));
        $delimiter = (string) $input->getOption('delimiter');
        $remoteAppDir = rtrim((string) $input->getOption('remote-app-dir'), '/');
        $remoteMediaRoot = trim((string) $input->getOption('remote-media-root'), '/');
        $importCommand = (string) $input->getOption('import-command');
        $dryRun = (bool) $input->getOption('dry-run');

        if (1 !== \strlen($delimiter)) {
            $io->error('The delimiter must be exactly one character.');

            return Command::FAILURE;
        }

        if ('' === $instanceUrl) {
            $io->error('The instance-url argument is required.');

            return Command::FAILURE;
        }

        if (!$this->filesystem->exists($mediaDirectory) || !is_dir($mediaDirectory)) {
            $io->error("Media directory not found: {$mediaDirectory}");

            return Command::FAILURE;
        }

        if (!$this->filesystem->exists($importFile) || !is_file($importFile)) {
            $io->error("Import file not found: {$importFile}");

            return Command::FAILURE;
        }

        $remoteMediaDirectory = basename($mediaDirectory);
        $remoteImportFile = basename($importFile);
        if ('' === $remoteMediaDirectory || '' === $remoteImportFile) {
            $io->error('Unable to determine remote file or directory names.');

            return Command::FAILURE;
        }

        try {
            $csvUpdateSummary = $this->addMediaUrlsToImportCsv(
                $importFile,
                $mediaDirectory,
                $remoteMediaDirectory,
                $instanceUrl,
                $remoteMediaRoot,
                $delimiter,
                $dryRun
            );
        } catch (\RuntimeException $exception) {
            $io->error($exception->getMessage());

            return Command::FAILURE;
        }

        $io->info(sprintf(
            '%s: %d rows read, %d rows updated, %d missing media files.',
            $dryRun ? 'CSV update preview' : 'CSV updated',
            $csvUpdateSummary['rowsRead'],
            $csvUpdateSummary['updatedRows'],
            $csvUpdateSummary['missingMedias']
        ));
        if (!$dryRun) {
            $io->info("Backup created: {$importFile}.bak");
        }

        $commands = [
            ['capcocli', 'copy', $instanceName, $mediaDirectory],
            ['capcocli', 'copy', $instanceName, $importFile],
            ['capcocli', 'exec', $instanceName, $this->buildRemoteCommand($remoteAppDir, $remoteMediaDirectory, $remoteImportFile, $proposalFormId, $delimiter, $remoteMediaRoot, $importCommand)],
        ];

        foreach ($commands as $command) {
            $io->comment($this->formatCommand($command));

            if ($dryRun) {
                continue;
            }

            $exitCode = $this->runProcess($command, $output);
            if (Command::SUCCESS !== $exitCode) {
                $io->error(sprintf('Command failed with exit code %d.', $exitCode));

                return $exitCode;
            }
        }

        $io->success($dryRun ? 'Dry run completed.' : 'IDF proposals import launched successfully.');

        return Command::SUCCESS;
    }

    /**
     * @param list<string> $command
     */
    protected function runProcess(array $command, OutputInterface $output): int
    {
        $process = new Process($command);
        $process->setTimeout(null);
        $process->run(static function (string $type, string $buffer) use ($output): void {
            $output->write($buffer);
        });

        return $process->getExitCode() ?? Command::FAILURE;
    }

    private function buildRemoteCommand(
        string $remoteAppDir,
        string $remoteMediaDirectory,
        string $remoteImportFile,
        string $proposalFormId,
        string $delimiter,
        string $remoteMediaRoot,
        string $importCommand
    ): string {
        $remoteMediaTargetDirectory = $remoteMediaRoot . '/' . $remoteMediaDirectory;
        $shellCommand = implode(' && ', [
            'cd ' . escapeshellarg($remoteAppDir),
            'mkdir -p ' . escapeshellarg($remoteMediaTargetDirectory),
            'cp -R ' . escapeshellarg($remoteMediaDirectory) . '/. ' . escapeshellarg($remoteMediaTargetDirectory),
            'rm -rf ' . escapeshellarg($remoteMediaDirectory),
            sprintf(
                'php -d memory_limit=-1 bin/console %s %s %s -d %s',
                escapeshellarg($importCommand),
                escapeshellarg('/' . $remoteImportFile),
                escapeshellarg($proposalFormId),
                escapeshellarg($delimiter)
            ),
        ]);

        $diagnosticCommand = implode('; ', [
            $shellCommand,
            'status=$?',
            'if [ "$status" -ne 0 ]; then echo "[ERROR] Remote IDF proposal import failed with exit code $status"; pwd; ls -lah ' . escapeshellarg($remoteImportFile) . ' ' . escapeshellarg($remoteMediaTargetDirectory) . ' 2>&1 || true; exit "$status"; fi',
        ]);

        return 'sh -lc ' . escapeshellarg($diagnosticCommand);
    }

    /**
     * @param list<string> $command
     */
    private function formatCommand(array $command): string
    {
        return implode(' ', array_map('escapeshellarg', $command));
    }

    /**
     * @return array{rowsRead: int, updatedRows: int, missingMedias: int}
     */
    private function addMediaUrlsToImportCsv(
        string $importFile,
        string $mediaDirectory,
        string $remoteMediaDirectory,
        string $instanceUrl,
        string $remoteMediaRoot,
        string $delimiter,
        bool $dryRun
    ): array {
        [$headers, $rows] = $this->readCsv($importFile, $delimiter);

        if (!\in_array(self::REFERENCE_COLUMN, $headers, true)) {
            throw new \RuntimeException('Column not found: ' . self::REFERENCE_COLUMN);
        }

        if (!\in_array(self::MEDIA_URL_COLUMN, $headers, true)) {
            $headers[] = self::MEDIA_URL_COLUMN;
        }

        $updatedRows = 0;
        $missingMedias = 0;
        foreach ($rows as &$row) {
            $reference = trim($row[self::REFERENCE_COLUMN] ?? '');
            if ('' === $reference) {
                continue;
            }

            $mediaFile = $mediaDirectory . '/' . $reference . '.' . self::MEDIA_EXTENSION;
            if (!is_file($mediaFile)) {
                ++$missingMedias;

                continue;
            }

            $row[self::MEDIA_URL_COLUMN] = sprintf(
                'https://%s/%s/%s.%s',
                $instanceUrl,
                $this->buildPublicMediaPath($remoteMediaRoot, $remoteMediaDirectory),
                $reference,
                self::MEDIA_EXTENSION
            );

            ++$updatedRows;
        }
        unset($row);

        if (!$dryRun) {
            $this->filesystem->copy($importFile, $importFile . '.bak', true);
            $this->writeCsv($importFile, $headers, $rows, $delimiter);
        }

        return [
            'rowsRead' => \count($rows),
            'updatedRows' => $updatedRows,
            'missingMedias' => $missingMedias,
        ];
    }

    private function normalizeInstanceUrl(string $instanceUrl): string
    {
        return preg_replace('#^https?://#', '', rtrim(trim($instanceUrl), '/')) ?? trim($instanceUrl);
    }

    private function buildPublicMediaPath(string $remoteMediaRoot, string $remoteMediaDirectory): string
    {
        $publicMediaRoot = preg_replace('#^public/?#', '', trim($remoteMediaRoot, '/')) ?? '';

        return trim($publicMediaRoot . '/' . $remoteMediaDirectory, '/');
    }

    /**
     * @return array{0: array<int, string>, 1: array<int, array<string, string>>}
     */
    private function readCsv(string $importFile, string $delimiter): array
    {
        $handle = fopen($importFile, 'r');
        if (false === $handle) {
            throw new \RuntimeException("Unable to open import file: {$importFile}");
        }

        $headers = fgetcsv($handle, 0, $delimiter);
        if (false === $headers) {
            fclose($handle);

            throw new \RuntimeException('Import file is empty.');
        }

        $headers = array_map(
            static fn (string $header): string => preg_replace('/^\xEF\xBB\xBF/', '', $header) ?? $header,
            $headers
        );

        $rows = [];
        while (false !== ($values = fgetcsv($handle, 0, $delimiter))) {
            if ([null] === $values || [] === $values) {
                continue;
            }

            $row = [];
            foreach ($headers as $index => $header) {
                $row[$header] = $values[$index] ?? '';
            }
            $rows[] = $row;
        }

        fclose($handle);

        return [$headers, $rows];
    }

    /**
     * @param array<int, string>                $headers
     * @param array<int, array<string, string>> $rows
     */
    private function writeCsv(string $importFile, array $headers, array $rows, string $delimiter): void
    {
        $handle = fopen($importFile, 'w');
        if (false === $handle) {
            throw new \RuntimeException("Unable to write import file: {$importFile}");
        }

        fputcsv($handle, $headers, $delimiter);
        foreach ($rows as $row) {
            fputcsv(
                $handle,
                array_map(static fn (string $header): string => $row[$header] ?? '', $headers),
                $delimiter
            );
        }

        fclose($handle);
    }
}
