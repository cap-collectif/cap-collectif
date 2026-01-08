<?php

declare(strict_types=1);

namespace Capco\AppBundle\Command\FeatureToggle;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class IsActiveCommand extends Command
{
    public function __construct(
        private readonly Manager $manager
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->setName('capco:toggle:isActive')
            ->setDescription('Check if a feature toggle is active (outputs "true" or "false")')
            ->addArgument('toggle', InputArgument::REQUIRED, 'The name of the feature toggle to check')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $toggleName = $input->getArgument('toggle');

        if (!$this->manager->exists($toggleName)) {
            $output->writeln('unknown');

            return Command::FAILURE;
        }

        $output->writeln($this->manager->isActive($toggleName) ? 'true' : 'false');

        return Command::SUCCESS;
    }
}
