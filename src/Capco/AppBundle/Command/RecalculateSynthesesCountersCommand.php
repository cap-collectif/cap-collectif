<?php

namespace Capco\AppBundle\Command;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class RecalculateSynthesesCountersCommand extends Command
{
    private $em;

    public function __construct(?string $name = null, EntityManagerInterface $entityManager)
    {
        $this->em = $entityManager;
        parent::__construct($name);
    }

    protected function configure()
    {
        $this->setName('capco:syntheses:counters')->setDescription(
            'Recalculate the syntheses counters'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $query = $this->em
            ->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')
            ->createQueryBuilder('se')
            ->select(
                'se.id as id',
                'se.path as path',
                'p.id as parent',
                'se.level as level',
                'se.votes as votes'
            )
            ->leftJoin('se.parent', 'p')
            ->orderBy('se.level', 'ASC')
            ->getQuery();
        $synthesisElements = $query->getArrayResult();

        $elements = [];

        foreach ($synthesisElements as $el) {
            $publishedChildren = $this->em
                ->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')
                ->createQueryBuilder('se')
                ->select('se.id', 'se.votes')
                ->where('se.published = 1 AND se.archived = 1')
                ->andWhere('se.displayType = :displayType')
                ->andWhere('se.path LIKE :path')
                ->setParameter('displayType', 'contribution')
                ->setParameter('path', $el['path'] . '|%')
                ->getQuery()
                ->getArrayResult();
            $childCount = \count($publishedChildren);
            $score = 0;

            foreach ($publishedChildren as $child) {
                $votes = $child['votes'];
                foreach ($votes as $nb) {
                    $score += $nb;
                }
            }

            $elements[$el['id']] = [];
            $elements[$el['id']]['count'] = $childCount;
            $elements[$el['id']]['votesScore'] = $score;
            if ($el['level'] > 0 && $el['parent'] && isset($elements[$el['parent']])) {
                $elements[$el['id']]['parentCount'] = $elements[$el['parent']]['count'];
                $elements[$el['id']]['parentVotesScore'] = $elements[$el['parent']]['votesScore'];
                $this->em->getConnection()->executeUpdate(
                    '
                    UPDATE synthesis_element se
                    SET published_children_count = ?, published_parent_children_count = ?, children_score = ?, parent_children_score = ?
                    WHERE id = ?
                ',
                    [
                        $childCount,
                        $elements[$el['id']]['parentCount'],
                        $score,
                        $elements[$el['id']]['parentVotesScore'],
                        $el['id']
                    ]
                );
            } else {
                $this->em->getConnection()->executeUpdate(
                    '
                    UPDATE synthesis_element se
                    SET published_children_count = ?, children_score = ?
                    WHERE id = ?
                ',
                    [$childCount, $score, $el['id']]
                );
            }
            if ($el['parent'] && !isset($elements[$el['parent']])) {
                $output->writeln('Element ' . $el['id'] . '\'s level should probably be fixed');
            }
        }

        $output->writeln('Calculation completed');
    }
}
