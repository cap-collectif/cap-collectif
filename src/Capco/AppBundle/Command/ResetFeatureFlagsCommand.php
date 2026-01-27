<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Toggle\EnvironmentPresets;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'capco:reset-feature-flags',
    description: 'Reset the feature flags to default values.',
)]
class ResetFeatureFlagsCommand extends Command
{
    public function __construct(
        private readonly Manager $featureFlagManager,
        private readonly string $env,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption(
                'force',
                null,
                InputOption::VALUE_NONE,
                'Set this option to force the reinit. Warning, this may de/activate some features.'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        if (!$input->getOption('force')) {
            $io->error('Please set the --force option to run this command');

            return Command::FAILURE;
        }

        $io->title(sprintf('Resetting the feature flags to the default <info>%s</info> configuration', $this->env));

        $io->info('Deactivating all feature flags...');
        $this->featureFlagManager->deactivateAll();

        $io->info(sprintf('Activating feature flags for the %s env...', $this->env));

        $flagsToActivate = match ($this->env) {
            'prod' => EnvironmentPresets::PROD,
            'test' => EnvironmentPresets::TEST,
            'dev' => EnvironmentPresets::DEV,
            default => EnvironmentPresets::COMMON,
        };

        foreach ($flagsToActivate as $flag) {
            $this->featureFlagManager->activate($flag);
        }

        $io->success('Done.');

        return Command::SUCCESS;
    }
}
