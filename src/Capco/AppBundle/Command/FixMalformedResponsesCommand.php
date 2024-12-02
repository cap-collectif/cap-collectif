<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Repository\AbstractResponseRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class FixMalformedResponsesCommand extends Command
{
    public function __construct(
        ?string $name,
        private readonly EntityManagerInterface $manager,
        private readonly AbstractResponseRepository $abstractResponseRepository
    ) {
        parent::__construct($name);
    }

    protected function configure()
    {
        $this->setDescription('Fix malformed questionnaire responses.');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $responses = $this->abstractResponseRepository
            ->createQueryBuilder('r')
            ->getQuery()
            ->getArrayResult()
        ;
        $count = 0;
        foreach ($responses as $response) {
            $value = $response['value'];
            if (!\is_array($value) && str_contains((string) $value, '\\\\')) {
                ++$count;
                $value = str_replace('\\\\', '\\', (string) $value);
                if (json_decode($value)) {
                    $value = json_encode(json_decode($value));
                }
                $this->manager
                    ->getConnection()
                    ->executeStatement('UPDATE response SET value = ? where id = ?', [
                        $value,
                        $response['id'],
                    ])
                ;
            }
        }

        $this->manager->flush();

        $output->writeln($count . ' responses successfully fixed.');

        return 0;
    }
}
