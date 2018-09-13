<?php

namespace Capco\AppBundle\Command\FeatureToggle;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class EnableCommand extends ContainerAwareCommand
{
    public $force;

    protected function configure()
    {
        $this->setName('capco:toggle:enable')
            ->setDescription('Enable a given feature toggle')
            ->addArgument('toggle', InputArgument::REQUIRED, 'A feature toggle name to activate');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $style = new SymfonyStyle($input, $output);
        $inputToggle = $input->getArgument('toggle');
        $toggleManager = $this->getContainer()->get('Capco\AppBundle\Toggle\Manager');

        if (!$toggleManager->exists($inputToggle)) {
            $style->error($inputToggle . ' feature toggle doesn\'t exist...');

            return 1;
        }

        if (!$toggleManager->isActive($inputToggle)) {
            $toggleManager->activate($inputToggle);
            $style->success($inputToggle . ' feature toggle is now enabled!');

            return 0;
        }

        $style->warning($inputToggle . ' feature toggle is already active!');

        return 0;
    }
}
