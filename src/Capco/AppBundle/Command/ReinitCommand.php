<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\ArrayInput;
use Doctrine\DBAL\Exception\ConnectionException;
use Joli\JoliNotif\Notification;
use Joli\JoliNotif\NotifierFactory;

class ReinitCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:reinit')
            ->setDescription('Reinit the application data')
            ->addOption('force', false, InputOption::VALUE_NONE, 'set this option to force the rebuild')
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
        $this->createSchema($output);
        $this->loadFixtures($output);
        $this->loadToggles($output);
        $this->recalculateCounters($output);
        $this->recalculateConsultationsCounters($output);
        $this->recalculateRankings($output);
        $this->updateSyntheses($output);
        $this->populateElastica($output);

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
        $input = new ArrayInput(array(
            '--force' => true,
            '',
        ));
        $input->setInteractive(false);
        $command->run($input, $output);
    }

    protected function recalculateCounters(OutputInterface $output)
    {
        $command = $this->getApplication()->find('capco:recalculate-counters');
        $input = new ArrayInput(array(''));
        $input->setInteractive(false);
        $command->run($input, $output);
    }

    protected function recalculateConsultationsCounters(OutputInterface $output)
    {
        $command = $this->getApplication()->find('capco:recalculate-projects-counters');
        $input = new ArrayInput(['']);
        $input->setInteractive(false);
        $command->run($input, $output);
    }

    protected function recalculateRankings(OutputInterface $output)
    {
        $command = $this->getApplication()->find('capco:recalculate-rankings');
        $input = new ArrayInput(['']);
        $input->setInteractive(false);
        $command->run($input, $output);
    }

    protected function updateSyntheses(OutputInterface $output)
    {
        $command = $this->getApplication()->find('capco:update-syntheses');
        $input = new ArrayInput(['']);
        $input->setInteractive(false);
        $command->run($input, $output);
    }

    protected function populateElastica(OutputInterface $output)
    {
        $command = $this->getApplication()->find('fos:elastica:populate');
        $input = new ArrayInput(['']);
        $input->setInteractive(false);
        $command->run($input, $output);
    }
}
