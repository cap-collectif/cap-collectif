<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Repository\AbstractResponseRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class FixMalformedResponsesCommand extends Command
{
    private $manager;
    private $abstractResponseRepository;

    public function __construct(
        string $name = null,
        EntityManagerInterface $manager,
        AbstractResponseRepository $abstractResponseRepository
    ) {
        $this->manager = $manager;
        $this->abstractResponseRepository = $abstractResponseRepository;

        parent::__construct($name);
    }

    protected function configure()
    {
        $this->setName('capco:fix:malformed-responses')->setDescription(
            'Fix malformed questionnaire responses.'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $responses = $this->abstractResponseRepository
            ->createQueryBuilder('r')
            ->getQuery()
            ->getArrayResult();
        $count = 0;
        foreach ($responses as $response) {
            $value = $response['value'];
            if (!\is_array($value) && false !== strpos($value, '\\\\')) {
                ++$count;
                $value = str_replace('\\\\', '\\', $value);
                if (json_decode($value)) {
                    $value = json_encode(json_decode($value));
                }
                $this->manager
                    ->getConnection()
                    ->executeUpdate('UPDATE response SET value = ? where id = ?', [
                        $value,
                        $response['id']
                    ]);
            }
        }

        $this->manager->flush();

        $output->writeln($count . ' responses successfully fixed.');
    }
}
