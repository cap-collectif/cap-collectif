<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Repository\AbstractResponseRepository;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class FixMalformedResponsesCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this->setName('capco:fix:malformed-responses')->setDescription(
            'Fix malformed questionnaire responses.'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();

        $em = $container->get('doctrine.orm.entity_manager');
        $responses = $this->getContainer()
            ->get(AbstractResponseRepository::class)
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
                $em
                    ->getConnection()
                    ->executeUpdate('UPDATE response SET value = ? where id = ?', [
                        $value,
                        $response['id'],
                    ]);
            }
        }
        $em->flush();

        $output->writeln($count . ' responses successfully fixed.');
    }
}
