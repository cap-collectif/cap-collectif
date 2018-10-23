<?php

namespace Capco\AppBundle\Command;

// use Capco\AppBundle\Elasticsearch\DoctrineUpdateListener;
use Capco\AppBundle\Elasticsearch\DoctrineUpdateListener;
use Doctrine\DBAL\ConnectionException;
use Joli\JoliNotif\Notification;
use Joli\JoliNotif\NotifierFactory;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Capco\AppBundle\Publishable\DoctrineListener;

class ReinitCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this->setName('capco:reinit')
            ->setDescription('Reinit the application data')
            ->addOption(
                'force',
                false,
                InputOption::VALUE_NONE,
                'set this option to force the rebuild'
            )
            ->addOption(
                'migrate',
                false,
                InputOption::VALUE_NONE,
                'set this option to execute the migrations instead of creating schema'
            )
            ->addOption(
                'no-toggles',
                false,
                InputOption::VALUE_NONE,
                'set this option to skip reseting feature flags'
            );
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
            $output->writeln(
                '<error>Database could not be deleted - maybe it didn\'t exist?</error>'
            );
            if ($notifier) {
                $notifier->send(
                    (new Notification())
                        ->setTitle('Warning')
                        ->setBody('Database could not be deleted.')
                );
            }
        }

        $eventManager = $this->getContainer()
            ->get('doctrine')
            ->getManager()
            ->getEventManager();
        $elasticsearchListener = $this->getContainer()->get(DoctrineUpdateListener::class);
        $publishableListener = $this->getContainer()->get(DoctrineListener::class);

        $eventManager->removeEventListener(
            $elasticsearchListener->getSubscribedEvents(),
            $elasticsearchListener
        );
        $output->writeln('Disabled <info>' . \get_class($elasticsearchListener) . '</info>.');

        $eventManager->removeEventListener(
            $publishableListener->getSubscribedEvents(),
            $publishableListener
        );
        $output->writeln('Disabled <info>' . \get_class($publishableListener) . '</info>.');

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

        $this->getContainer()
            ->get('doctrine')
            ->getManager()
            ->clear();
        $this->recalculateCounters($output);
        $this->updateSyntheses($output);

        $this->populateElastica($output);

        $output->writeln('Reinit completed');

        if ($notifier) {
            $notifier->send(
                (new Notification())->setTitle('Success')->setBody('Database reseted.')
            );
        }
    }

    protected function createDatabase(OutputInterface $output)
    {
        $this->runCommands(
            [
                'doctrine:database:create' => [],
            ],
            $output
        );
    }

    protected function createSchema(OutputInterface $output)
    {
        $this->runCommands(
            [
                'doctrine:schema:create' => [],
            ],
            $output
        );
    }

    protected function dropDatabase(OutputInterface $output)
    {
        $this->runCommands(
            [
                'doctrine:database:drop' => ['--force' => true],
            ],
            $output
        );
        $connection = $this->getContainer()
            ->get('doctrine')
            ->getConnection();

        if ($connection->isConnected()) {
            $connection->close();
            $output->writeln('<info>previous connection closed</info>');
        }
    }

    protected function loadFixtures(OutputInterface $output)
    {
        $this->runCommands(
            [
                'hautelook_alice:doctrine:fixtures:load' => ['-e' => 'dev'],
            ],
            $output
        );
    }

    protected function loadToggles(OutputInterface $output)
    {
        $this->runCommands(
            [
                'capco:reset-feature-flags' => [
                    '--force' => true,
                ],
            ],
            $output
        );
    }

    protected function recalculateCounters(OutputInterface $output)
    {
        $this->runCommands(
            [
                'capco:compute:users-counters' => ['--force' => true],
                'capco:compute:counters' => ['--force' => true],
                'capco:compute:projects-counters' => [],
                'capco:compute:rankings' => [],
            ],
            $output
        );
    }

    protected function updateSyntheses(OutputInterface $output)
    {
        $this->runCommands(
            [
                'capco:syntheses:update' => [],
                'capco:syntheses:fix-urls' => [],
                'capco:syntheses:counters' => [],
            ],
            $output
        );
    }

    protected function populateElastica(OutputInterface $output)
    {
        $this->runCommands(
            [
                'capco:es:create' => ['--quiet' => true, '--no-debug' => true],
            ],
            $output
        );

        $this->runCommands(
            [
                'capco:es:populate' => ['--quiet' => true, '--no-debug' => true],
            ],
            $output
        );
    }

    protected function executeMigrations(OutputInterface $output)
    {
        $this->runCommands(
            [
                'doctrine:migration:migrate' => ['--no-interaction' => true],
            ],
            $output
        );
    }

    protected function mockMigrations(OutputInterface $output)
    {
        $this->runCommands(
            [
                'doctrine:migration:version' => ['--add' => true, '--all' => true],
            ],
            $output
        );
    }

    private function runCommands(array $commands, $output)
    {
        foreach ($commands as $key => $value) {
            $input = new ArrayInput($value);
            $input->setInteractive(false);
            $this->getApplication()
                ->find($key)
                ->run($input, $output);
        }
    }
}
