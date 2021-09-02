<?php

namespace Capco\AppBundle;

use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\HttpKernel\KernelInterface;

class CapcoApplication extends Application
{
    public function __construct(KernelInterface $kernel)
    {
        parent::__construct($kernel);

        $inputDefinition = $this->getDefinition();
        $inputDefinition->addOption(
            new InputOption('--instance', '-i', InputOption::VALUE_REQUIRED, 'The instance name.')
        );
    }
}
