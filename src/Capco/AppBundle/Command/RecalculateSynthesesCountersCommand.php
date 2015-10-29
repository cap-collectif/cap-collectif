<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class RecalculateSynthesesCountersCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:syntheses:recalculate-counters')
            ->setDescription('Recalculate the syntheses counters')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        $em = $container->get('doctrine.orm.entity_manager');

        $connection = $em->getConnection();

        $query = $em
            ->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')
            ->createQueryBuilder('se')
            ->select('se.id as id', 'se.path as path', 'p.id as parent', 'se.level as level', 'se.votes as votes')
            ->leftJoin('se.parent', 'p')
            ->orderBy('se.level', 'ASC')
            ->getQuery()
        ;

        $synthesisElements = $query->getArrayResult();

        $elements = [];

        foreach ($synthesisElements as $el) {
            $childCount = $em
                ->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')
                ->createQueryBuilder('se')
                ->select('COUNT(se.id)')
                ->where('se.published = 1 AND se.archived = 1')
                ->andWhere('se.displayType = :displayType')
                ->andWhere('se.path LIKE :path')
                ->setParameter('displayType', 'contribution')
                ->setParameter('path', $el['path'].'|%')
                ->getQuery()
                ->getSingleScalarResult()
            ;
            $elements[$el['id']] = [];
            $elements[$el['id']]['count'] = $childCount;
            if ($el['level'] > 0 && $el['parent'] && array_key_exists($el['parent'], $elements)) {
                $elements[$el['id']]['parentCount'] = $elements[$el['parent']]['count'];
                $em->getConnection()->executeUpdate('
                    UPDATE synthesis_element se
                    SET published_children_count = ?, published_parent_children_count = ?
                    WHERE id = ?
                ', [$childCount, $elements[$el['id']]['parentCount'], $el['id']]);
            } else {
                $em->getConnection()->executeUpdate('
                    UPDATE synthesis_element se
                    SET published_children_count = ?
                    WHERE id = ?
                ', [$childCount, $el['id']]);
            }
            if ($el['parent'] && !array_key_exists($el['parent'], $elements)) {
                $output->writeln('Element '.$el['id'].'\'s level should probably be fixed');
            }
        }

        $output->writeln('Calculation completed');
    }
}
