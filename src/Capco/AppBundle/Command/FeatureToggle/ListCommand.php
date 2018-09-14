<?php

namespace Capco\AppBundle\Command\FeatureToggle;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class ListCommand extends ContainerAwareCommand
{
    public $force;

    protected function configure()
    {
        $this->setName('capco:toggle:list')->setDescription('Show a list of all feature toggles');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $style = new SymfonyStyle($input, $output);
        $toggleManager = $this->getContainer()->get(Manager::class);
        $list = $toggleManager->all();
        array_walk($list, function (&$value, $name) {
            $value = [$name, $value ? 'Yes' : 'No'];
        });

        $style->table(['Name', 'Is Active?'], $list);
    }
}
