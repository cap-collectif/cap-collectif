<?php

namespace Capco\AppBundle\Command\Elasticsearch;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class PopulateIndexCommand extends ContainerAwareCommand
{
    /**
     * {@inheritdoc}
     */
    protected function configure()
    {
        $this
            ->setName('capco:es:populate')
            ->setDescription('Populate the current Elasticsearch Indexes.')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $indexer = $this->getContainer()->get('capco.elasticsearch.indexer');

        $output->writeln(['Start indexing.', '']);

        try {
            $indexer->indexAll();
            $indexer->finishBulk();
        } catch (\Exception $e) {
            $output->writeln('<error>'. $e->getMessage() .'</error>');

            return 1;
        }

        $output->writeln(['', '', 'All the documents are LIVE!']);

        return 0;
    }
}
