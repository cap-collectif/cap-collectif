<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class LoadProdDataCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this->setName('capco:load-prod-data')
            ->setDescription('A bunch of fixtures to start using the application')
            ->addOption(
                'force',
                false,
                InputOption::VALUE_NONE,
                'set this option to force the rebuild'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$input->getOption('force')) {
            $output->writeln(
                'This command will add some demo data in your project, if you\'re sure that you want those data, go ahead and add --force'
            );
            $output->writeln('Please set the --force option to run this command');

            return;
        }

        $this->loadFixtures($output);
        $this->loadToggles($output);

        $output->writeln('Load prod data completed');
    }

    protected function loadFixtures(OutputInterface $output)
    {
        $command = $this->getApplication()->find('hautelook_alice:doctrine:fixtures:load');
        $input = new ArrayInput([
            '-e' => 'prod',
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
