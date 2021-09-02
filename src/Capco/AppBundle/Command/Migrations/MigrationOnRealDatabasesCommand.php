<?php

namespace Capco\AppBundle\Command\Migrations;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class MigrationOnRealDatabasesCommand extends Command
{
    protected static $defaultName = 'database:check-migrations';

    private $projectDir;

    public function __construct(string $projectRootDir)
    {
        parent::__construct();
        $this->projectDir = $projectRootDir;
    }

    public function checkDatabase(
        string $key,
        string $database,
        OutputInterface $output,
        string $wdir,
        array $noLimit
    ): void {
        $output->writeln('<info>Checking database ' . $database . '</info>');
        $encodedDatabase = $database . '.gzip.enc';
        $compressedDatabase = $database . '.gz';

        // decrypt
        $this->launchCommand($wdir, [
            'openssl',
            'enc',
            '-d',
            '-aes-256-cbc',
            '-in',
            $encodedDatabase,
            '-out',
            $compressedDatabase,
            '-k',
            $key,
        ]);

        //unzip
        $this->launchCommand($wdir, ['gunzip', '-f', $compressedDatabase]);

        //reset database schema
        $this->launchCommand(
            $this->projectDir,
            array_merge($noLimit, ['bin/console', 'doctrine:d:drop', '--force'])
        );
        $this->launchCommand(
            $this->projectDir,
            array_merge($noLimit, ['bin/console', 'doctrine:d:create'])
        );

        $output->writeln('<info>Loading data...</info>');
        $job = Process::fromShellCommandline(
            'mysql -h database -u root symfony < ' . 'databases/' . $database
        );
        $job->setTimeout(3600 * 20);
        $job->run();
        $output->writeln('<info>Done loading data.</info>');

        //migrate
        $this->launchCommand(
            $this->projectDir,
            array_merge($noLimit, ['bin/console', 'doctrine:migrations:migrate'])
        );
        //validate
        $this->launchCommand(
            $this->projectDir,
            array_merge($noLimit, ['bin/console', 'doctrine:schema:validate'])
        );
        $output->writeln('<info>Database ' . $database . ' has successfully migrated</info>');

        //cleaning
        $this->launchCommand($wdir, ['rm', '-f', $compressedDatabase]);
        $this->launchCommand($wdir, ['rm', '-f', $database]);
    }

    protected function configure(): void
    {
        parent::configure();
        $this->setDescription('Run migration on databases');
        $this->addOption('key', 'k', InputOption::VALUE_REQUIRED, 'Key used to decrypt sql files');
    }

    protected function launchCommand(string $wdir, array $command, bool $echoOutput = false): void
    {
        $process = new Process($command);
        $process->setWorkingDirectory($wdir);

        try {
            $process->run();
        } catch (\Exception $e) {
            if (!$process->isSuccessful()) {
                //cleaning to be sure no private date remain in case of error
                throw new Process($process);
            }
            $this->launchCommand($wdir, ['rm', '-f', '*.gz']);
            $this->launchCommand($wdir, ['rm', '-f', '*.sql']);
        }

        if ($echoOutput) {
            echo $process->getOutput();
        }
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $key = $input->getOption('key');
        $databases = ['p.sql', 'pc.sql', 'r.sql'];

        $wdir = $this->projectDir . '/databases/';

        $noLimit = ['php', '-d', 'memory_limit=-1'];

        try {
            foreach ($databases as $database) {
                $this->checkDatabase($key, $database, $output, $wdir, $noLimit);
            }
        } catch (\Exception $e) {
            $this->launchCommand($wdir, ['rm', '-f', '*.gz']);
            $this->launchCommand($wdir, ['rm', '-f', '*.sql']);

            return 1;
        }

        return 0;
    }
}
