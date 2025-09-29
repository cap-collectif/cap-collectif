<?php

namespace Capco\AppBundle\Command\Elasticsearch;

use Capco\AppBundle\Elasticsearch\Indexer;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Yaml\Yaml;

class CheckMappingCommand extends Command
{
    public function __construct(
        private readonly Indexer $indexer,
        private readonly string $kernelProjectDir
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setName('capco:es:mapping')->setDescription('Check if the mapping is up to date.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Elasticsearch Mapping Comparator');
        $io->text("<info>Let's see if an index already exists...</info>");
        if (!$this->indexer->getIndex()->exists()) {
            $io->caution('There is no indexes to check.');

            return 0;
        }
        $io->success('It does ! Index name: ' . $this->indexer->getIndex()->getName());
        $io->section('Compare ES mapping with locale one :');
        $mapping = Yaml::parse(
            file_get_contents($this->kernelProjectDir . '/Capco/AppBundle/Elasticsearch/mapping.yaml')
        );
        $mappingProperties = $mapping['mappings']['properties'];
        $indexMapping = $this->indexer->getIndex()->getMapping()['properties'];

        if ($this->compareMappings($mappingProperties, $indexMapping)) {
            $io->text('<comment>Changes detected !</comment>');

            return 1;
        }

        $io->success('No changes detected. Bye !');

        return -1;
    }

    private function compareMappings(array $firstMapping, array $secondMapping): bool
    {
        // We sort alphabetically both mappings array.
        $this->ksort_recursive($firstMapping);
        $this->ksort_recursive($secondMapping);
        // Encode arrays to strings and hash them.
        $firstMappingHash = hash('md5', json_encode($firstMapping));
        $secondMappingHash = hash('md5', json_encode($secondMapping));

        return $firstMappingHash !== $secondMappingHash;
    }

    private function ksort_recursive(array &$array): void
    {
        ksort($array);
        foreach ($array as &$a) {
            \is_array($a) && $this->ksort_recursive($a);
        }
    }
}
