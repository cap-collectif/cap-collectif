<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class RecalculateSynthesisCountersCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:recalculate-syntheses-counters')
            ->setDescription('Recalculate the syntheses counters')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        $em = $container->get('doctrine.orm.entity_manager');

        $synthesisElements = $em
            ->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')
            ->findAll()
        ;

        foreach ($synthesisElements as $el) {
            $childCount = $em
                ->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')
                ->childCount($el)
            ;
            $el->setTotalChildrenCount($childCount);
        }

        $em->flush();

        $output->writeln('Calculation completed');
    }
}
