<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Sluggable\SluggableListener;
use Capco\AppBundle\Toggle\Manager;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Doctrine\UserListener;
use Gedmo\Timestampable\TimestampableListener;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class LoadBenchmarkDataCommand extends Command
{
    protected static $defaultName = 'capco:load-benchmark-data';
    private Manager $manger;
    private EntityManagerInterface $entityManger;

    public function __construct(Manager $manager, EntityManagerInterface $entityManager)
    {
        $this->manger = $manager;
        $this->entityManger = $entityManager;
        parent::__construct();
    }

    protected function configure()
    {
        $this->setDescription('A bunch of fixtures to benchmark the application')->addOption(
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

            return 0;
        }

        $this->disableListeners($output, [
            TimestampableListener::class,
            UserListener::class,
            SluggableListener::class,
        ]);

        $this->loadFixtures($output);

        $output->writeln('<info>Database loaded !</info>');

        return 0;
    }

    protected function loadFixtures(OutputInterface $output)
    {
        $command = $this->getApplication()->find('hautelook:fixtures:load');
        $input = new ArrayInput([
            '-e' => 'benchmark',
            '--append' => true,
            '--no-bundles' => true,
        ]);
        $input->setInteractive(false);
        $command->run($input, $output);
    }

    private function disableListeners(OutputInterface $output, array $whitelist): void
    {
        $eventManager = $this->entityManger->getEventManager();

        foreach ($eventManager->getListeners() as $event => $listeners) {
            foreach ($listeners as $key => $listener) {
                if (\is_string($listener) || \in_array(\get_class($listener), $whitelist, true)) {
                    continue;
                }
                if (method_exists($listener, 'getSubscribedEvents')) {
                    $eventManager->removeEventListener($listener->getSubscribedEvents(), $listener);
                    $output->writeln('Disabled <info>' . \get_class($listener) . '</info>');
                }
            }
        }
    }
}
