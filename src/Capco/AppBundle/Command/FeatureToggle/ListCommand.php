<?php

namespace Capco\AppBundle\Command\FeatureToggle;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\DependencyInjection\ContainerInterface;

class ListCommand extends Command
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

    private function getContainer()
    {
        return $this->container;
    }
}
