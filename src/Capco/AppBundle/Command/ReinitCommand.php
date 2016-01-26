<?php

namespace Capco\AppBundle\Command;

use Doctrine\DBAL\ConnectionException;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\ArrayInput;
use Joli\JoliNotif\Notification;
use Joli\JoliNotif\NotifierFactory;

class ReinitCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:reinit')
            ->setDescription('Reinit the application data')
            ->addOption(
                'force', false, InputOption::VALUE_NONE,
                'set this option to force the rebuild'
            )
            ->addOption(
                'migrate', false, InputOption::VALUE_NONE,
                'set this option to execute the migrations instead of creating schema'
            )
            ->addOption(
                'no-toggles', false, InputOption::VALUE_NONE,
                'set this option to skip reseting feature flags'
            )
            ->addOption(
                'no-es-populate', false, InputOption::VALUE_NONE,
                'set this option to skip populating ES'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$input->getOption('force')) {
            $output->writeln('Please set the --force option to run this command');

            return;
        }

        $notifier = NotifierFactory::create();

        try {
            $this->dropDatabase($output);
        } catch (ConnectionException $e) {
            $output->writeln('<error>Database could not be deleted - maybe it didn\'t exist?</error>');
            if ($notifier) {
                $notifier
                    ->send(
                        (new Notification())
                            ->setTitle('Warning')
                            ->setBody('Database could not be deleted.')
                    );
            }
        }

        $this->createDatabase($output);
        if ($input->getOption('migrate')) {
            $this->executeMigrations($output);
        } else {
            $this->createSchema($output);
            $this->mockMigrations($output);
        }
        $this->loadFixtures($output);
        if (!$input->getOption('no-toggles')) {
            $this->loadToggles($output);
        }
        $this->recalculateCounters($output);
        $this->recalculateProjectsCounters($output);
        $this->recalculateRankings($output);
        $this->updateSyntheses($output);
        if (!$input->getOption('no-es-populate')) {
            $this->populateElastica($output);
        }

        $output->writeln('Reinit completed');

        if ($notifier) {
            $notifier
                ->send(
                    (new Notification())
                        ->setTitle('Success')
                        ->setBody('Database reseted.')
                );
        }
    }

    protected function createDatabase(OutputInterface $output)
    {
        $command = $this->getApplication()->find('doctrine:database:create');
        $input = new ArrayInput(['']);
        $command->run($input, $output);
    }

    protected function createSchema(OutputInterface $output)
    {
        $command = $this->getApplication()->find('doctrine:schema:create');
        $input = new ArrayInput(['']);
        $command->run($input, $output);
    }

    protected function dropDatabase(OutputInterface $output)
    {
        $command = $this->getApplication()->find('doctrine:database:drop');
        $input = new ArrayInput([
            '--force' => true,
            '',
        ]);
        $command->run($input, $output);
        $connection = $this->getApplication()->getKernel()->getContainer()->get('doctrine')->getConnection();

        if ($connection->isConnected()) {
            $connection->close();
            $output->writeln('<info>previous connection closed</info>');
        }
    }

    protected function loadFixtures(OutputInterface $output)
    {
        $command = $this->getApplication()->find('doctrine:fixtures:load');
        $input = new ArrayInput(['']);
        $input->setInteractive(false);
        $command->run($input, $output);
    }

    protected function loadToggles(OutputInterface $output)
    {
        $command = $this->getApplication()->find('capco:reset-feature-flags');
        $input = new ArrayInput([
            '--force' => true,
            '',
        ]);
        $input->setInteractive(false);
        $command->run($input, $output);
    }

    protected function recalculateCounters(OutputInterface $output)
    {
        $command = $this->getApplication()->find('capco:compute:counters');
        $input = new ArrayInput(['']);
        $input->setInteractive(false);
        $command->run($input, $output);
    }

    protected function recalculateProjectsCounters(OutputInterface $output)
    {
        $command = $this->getApplication()->find('capco:compute:projects-counters');
        $input = new ArrayInput(['']);
        $input->setInteractive(false);
        $command->run($input, $output);
    }

    protected function recalculateRankings(OutputInterface $output)
    {
        $command = $this->getApplication()->find('capco:compute:rankings');
        $input = new ArrayInput(['']);
        $input->setInteractive(false);
        $command->run($input, $output);
    }

    protected function updateSyntheses(OutputInterface $output)
    {
        $command = $this->getApplication()->find('capco:syntheses:update');
        $input = new ArrayInput(['']);
        $input->setInteractive(false);
        $command->run($input, $output);

        $command = $this->getApplication()->find('capco:syntheses:fix-urls');
        $input = new ArrayInput(['']);
        $input->setInteractive(false);
        $command->run($input, $output);

        $command = $this->getApplication()->find('capco:syntheses:counters');
        $input = new ArrayInput(['']);
        $input->setInteractive(false);
        $command->run($input, $output);
    }

    protected function populateElastica(OutputInterface $output)
    {
        $command = $this->getApplication()->find('fos:elastica:populate');
        $input = new ArrayInput([
            '--quiet' => true,
            '--no-debug' => true,
            '',
        ]);
        $input->setInteractive(false);
        $command->run($input, $output);
    }

    protected function executeMigrations(OutputInterface $output)
    {
        $command = $this->getApplication()->find('doctrine:migration:migrate');
        $input = new ArrayInput([
            '--no-interaction' => true,
            '',
        ]);
        $input->setInteractive(false);
        $command->run($input, $output);
    }

    protected function mockMigrations(OutputInterface $output)
    {
        $command = $this->getApplication()->find('doctrine:migration:version');
        $input = new ArrayInput([
            '--add' => true,
            '--all' => true,
            '',
        ]);
        $input->setInteractive(false);
        $command->run($input, $output);
    }
}
