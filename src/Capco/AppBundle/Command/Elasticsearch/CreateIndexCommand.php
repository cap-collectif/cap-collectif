<?php

namespace Capco\AppBundle\Command\Elasticsearch;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateIndexCommand extends ContainerAwareCommand
{
    /**
     * {@inheritdoc}
     */
    protected function configure()
    {
        $this
            ->setName('capco:es:create')
            ->setDescription('Create the Elasticsearch Indexes.')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $indexManager = $this->getContainer()->get('capco.elasticsearch.index_builder');

        $newIndex = $indexManager->createIndex();
        $indexManager->slowDownRefresh($newIndex);

        $output->writeln([sprintf('Index %s created.', $newIndex->getName()), '']);

        $indexManager->speedUpRefresh($newIndex);
        $indexManager->markAsLive($newIndex);

        $output->writeln(['', '', 'New Index is now LIVE!']);

        return 0;
    }
}
