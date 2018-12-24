<?php

namespace Capco\AppBundle\Command;

use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputOption;
use Capco\AppBundle\Publishable\DoctrineListener;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Capco\AppBundle\Elasticsearch\ElasticsearchDoctrineListener;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;

class LoadBenchmarkDataCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this->setName('capco:load-benchmark-data')
            ->setDescription('A bunch of fixtures to benchmark the application')
            ->addOption(
                'force',
                false,
                InputOption::VALUE_NONE,
                'set the --force option to run this command'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$input->getOption('force')) {
            $output->writeln(
                'This command will clear your database and populate it with lots of data, if you\'re sure that you want those data, go ahead and add --force'
            );
            $output->writeln('Please set the --force option to run this command');

            return;
        }

        $eventManager = $this->getContainer()
            ->get('doctrine')
            ->getManager()
            ->getEventManager();
        $elasticsearchListener = $this->getContainer()->get(ElasticsearchDoctrineListener::class);
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

        $this->loadFixtures($output);
        $this->loadToggles($output);

        $output->writeln('Load benchmark data completed');
    }

    protected function loadFixtures(OutputInterface $output)
    {
        $command = $this->getApplication()->find('hautelook_alice:doctrine:fixtures:load');
        $input = new ArrayInput([
            'command' => 'hautelook_alice:doctrine:fixtures:load',
            '--fixtures' => 'src/Capco/AppBundle/DataFixtures/ORM/Benchmark',
        ]);
        $input->setInteractive(false);
        $command->run($input, $output);
    }

    protected function loadToggles(OutputInterface $output)
    {
        $command = $this->getApplication()->find('capco:reset-feature-flags');
        $input = new ArrayInput([
            '--force' => true,
        ]);
        $input->setInteractive(false);
        $command->run($input, $output);
    }
}
