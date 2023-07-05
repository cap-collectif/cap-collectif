<?php

namespace Capco\AppBundle\Command\FeatureToggle;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\HttpKernel\KernelInterface;

class EnableCommand extends Command
{
    private Manager $toggleManager;
    private KernelInterface $kernel;

    public function __construct(?string $name = null, Manager $toggleManager, KernelInterface $kernel)
    {
        parent::__construct($name);
        $this->toggleManager = $toggleManager;
        $this->kernel = $kernel;
    }

    protected function configure()
    {
        $this->setName('capco:toggle:enable')
            ->setDescription('Enable a given feature toggle')
            ->addArgument('toggle', InputArgument::OPTIONAL, 'A feature toggle name to activate')
            ->addOption('all')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $style = new SymfonyStyle($input, $output);
        $inputToggle = $input->getArgument('toggle');
        $all = $input->getOption('all');

        if ($all && 'dev' === $this->kernel->getEnvironment()) {
            $this->toggleManager->activateAll();
            $this->toggleManager->deactivate(Manager::shield_mode);
            $this->toggleManager->deactivate(Manager::graphql_introspection);
            $this->toggleManager->deactivate(Manager::graphql_query_analytics);
            $this->toggleManager->deactivate(Manager::developer_documentation);
            $this->toggleManager->deactivate(Manager::sso_by_pass_auth);

            return 0;
        }

        if (!$this->toggleManager->exists($inputToggle)) {
            $style->error($inputToggle . ' feature toggle doesn\'t exist...');

            return 1;
        }

        if (!$this->toggleManager->isActive($inputToggle)) {
            $this->toggleManager->activate($inputToggle);
            $style->success($inputToggle . ' feature toggle is now enabled!');

            return 0;
        }

        $style->warning($inputToggle . ' feature toggle is already active!');

        return 0;
    }
}
