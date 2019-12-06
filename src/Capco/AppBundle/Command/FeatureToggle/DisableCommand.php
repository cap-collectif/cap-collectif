<?php

namespace Capco\AppBundle\Command\FeatureToggle;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\DependencyInjection\ContainerInterface;

class DisableCommand extends Command
{
    public $force;
    private $container;

    public function __construct(string $name = null, ContainerInterface $container)
    {
        $this->container = $container;
        parent::__construct($name);
    }

    protected function configure()
    {
        $this->setName('capco:toggle:disable')
            ->setDescription('Disable a given feature toggle')
            ->addArgument('toggle', InputArgument::REQUIRED, 'A feature toggle name to disable');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $style = new SymfonyStyle($input, $output);
        $inputToggle = $input->getArgument('toggle');
        $toggleManager = $this->getContainer()->get(Manager::class);

        if (!$toggleManager->exists($inputToggle)) {
            $style->error($inputToggle . ' feature toggle doesn\'t exist...');

            return 1;
        }

        if ($toggleManager->isActive($inputToggle)) {
            $toggleManager->deactivate($inputToggle);
            $style->success($inputToggle . ' feature toggle is now disabled!');

            return 0;
        }

        $style->warning($inputToggle . ' feature toggle is already disabled!');

        return 0;
    }

    private function getContainer()
    {
        return $this->container;
    }
}
