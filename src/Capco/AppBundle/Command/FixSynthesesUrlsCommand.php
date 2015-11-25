<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class FixSynthesesUrlsCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:syntheses:fix-urls')
            ->setDescription('Set original contributions urls on syntheses elements')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();

        $em = $container->get('doctrine.orm.entity_manager');
        $elements = $em
            ->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')
            ->createQueryBuilder('se')
            ->where('se.linkedDataClass IS NOT NULL')
            ->andWhere('se.linkedDataId IS NOT NULL')
            ->getQuery()
            ->getResult()
        ;
        foreach ($elements as $el) {
            $contribution = $em->getRepository($el->getLinkedDataClass())->find($el->getLinkedDataId());
            $urlResolver = $container->get('capco.url.resolver');
            $el->setLinkedDataUrl($urlResolver->getObjectUrl($contribution, false));
        }
        $em->flush();

        $output->writeln('Urls successfully fixed');
    }
}
