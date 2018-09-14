<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class FixOpinionTypesTreeCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this->setName('capco:fix:opinion-types')->setDescription('Fix opinion types hierarchy');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $em = $this->getContainer()->get('doctrine.orm.entity_manager');
        $repo = $this->getContainer()->get('capco.opinion_type.repository');

        $repo->verify();
        $repo->recover();

        $ots = $repo->findAll();
        foreach ($ots as $ot) {
            $repo->reorder($ot, 'position');
        }

        $em->flush();
        $em->clear();
    }
}
