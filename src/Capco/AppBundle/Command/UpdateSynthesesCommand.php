<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Synthesis\Handler\SynthesisHandler;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class UpdateSynthesesCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this->setName('capco:syntheses:update')->setDescription(
            'Update the syntheses from their source data'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();

        $output->writeln('Updating all syntheses from their source data.');

        $syntheses = $container
            ->get('doctrine')
            ->getManager()
            ->getRepository('CapcoAppBundle:Synthesis\Synthesis')
            ->findAll();

        $synthesisHandler = $container->get(SynthesisHandler::class);

        foreach ($syntheses as $synthesis) {
            $output->write('.');
            $synthesisHandler->createOrUpdateElementsFromSource($synthesis);
        }

        $output->writeln('');

        $output->writeln(\count($syntheses) . ' syntheses updated');
    }
}
