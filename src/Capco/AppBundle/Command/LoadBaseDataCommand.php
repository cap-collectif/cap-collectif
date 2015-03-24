<?php
namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\ArrayInput;

class LoadBaseDataCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:load-base-data')
            ->setDescription('A bunch of fixtures to start using the application')
            ->addOption("force", false, InputOption::VALUE_NONE, "set this option to force the rebuild")
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$input->getOption('force')) {
            $output->writeln('This command will add some demo data in your project, if you\'re sure that you want those data, go ahead and add --force');
            $output->writeln('Please set the --force option to run this command');

            return;
        }

        $this->loadFixtures($output);
        $this->loadToggles($output);

        $output->writeln('Load base data completed');
    }

    protected function loadFixtures(OutputInterface $output)
    {
        $command = $this->getApplication()->find('doctrine:fixtures:load');
        $input = new ArrayInput(array(
            'command' => 'doctrine:fixtures:load',
            '--fixtures' => 'src/Capco/AppBundle/DataDemo/ORM',
        ));
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
}
