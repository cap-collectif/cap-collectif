<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class RecalculateSynthesesCountersCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:syntheses:recalculate-counters')
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
                ->createQueryBuilder('se')
                ->select('COUNT(se.id)')
                ->where('se.published = 1 AND se.archived = 1')
                ->andWhere('se.path LIKE :path')
                ->setParameter('path', $el->getPath().'%')
                ->getQuery()
                ->getSingleScalarResult()
            ;
            $el->setPublishedChildrenCount($childCount);
        }

        $em->flush();

        $output->writeln('Calculation completed');
    }
}
