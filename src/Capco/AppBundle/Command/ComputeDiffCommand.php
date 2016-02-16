<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class ComputeDiffCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:compute:diff')
            ->setDescription('Recalculate diff')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getApplication()->getKernel()->getContainer();
        $em = $container->get('doctrine.orm.entity_manager');
        $repo = $em->getRepository('CapcoAppBundle:OpinionVersion');

        $versions = $repo->getAllIds();

        foreach ($versions as $versionId) {
            $version = $repo->find($versionId);
            $container->get('capco.diff.generator')->generate($version);
        }

        $modals = $em->getRepository('CapcoAppBundle:OpinionModal')->findAll();
        foreach ($modals as $modal) {
            $container->get('capco.diff.generator')->generate($modal);
        }

        $em->flush();
        $output->writeln('Computation completed');
    }
}
