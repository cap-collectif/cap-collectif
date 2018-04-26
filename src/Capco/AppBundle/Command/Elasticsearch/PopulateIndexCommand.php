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
        $container = $this->getContainer();
        if (!$container->get('capco.toggle.manager')->isActive('indexation')) {
            $output->writeln('<error>Please enable "indexation" feature to run this command</error>');

            return 1;
        }

        $indexer = $container->get('capco.elasticsearch.indexer');

        $output->writeln(['Start indexing Elasticsearch.']);

        try {
            $indexer->indexAll($output);
            $indexer->finishBulk();
        } catch (\RuntimeException $e) {
            $output->writeln('<error>' . $e->getMessage() . '</error>');

            return 1;
        }

        $output->writeln(['', '', 'All the documents are LIVE!']);

        return 0;
    }
}
