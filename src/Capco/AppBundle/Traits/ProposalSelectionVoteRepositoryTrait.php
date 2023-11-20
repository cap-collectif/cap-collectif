<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalSelectionVote;

trait ProposalSelectionVoteRepositoryTrait
{
    public function getCountsByProposalGroupedBySteps(Proposal $proposal, $asTitle = false): array
    {
        $items = array_map(fn ($value) => $asTitle ? $value->getTitle() : $value->getId(), $proposal->getSelectionSteps());

        $qb = $this->createQueryBuilder('pv');

        if ($asTitle) {
            $qb->select(
                'pv.position as position',
                'ss.votesLimit as max',
                'ss.title as stepId',
                'ss.votesRanking as votesRanking'
            );
        } else {
            $qb->select(
                'pv.position as position',
                'ss.votesLimit as max',
                'ss.id as stepId',
                'ss.votesRanking as votesRanking'
            );
        }

        $qb->leftJoin('pv.selectionStep', 'ss')
            ->andWhere('pv.proposal = :proposal')
            ->andWhere('pv.published = true')
            ->andWhere('pv.isAccounted = 1')
            ->setParameter('proposal', $proposal)
        ;

        $results = $qb
            ->getQuery()
            ->useQueryCache(true)
            ->getResult()
        ;

        $data = [];
        $data['votesBySteps'] = [];
        $data['pointsBySteps'] = [];
        /** @var ProposalSelectionVote $result */
        foreach ($results as $result) {
            $pointsAvailable = [];
            for ($i = $result['max']; $i > 0; --$i) {
                $pointsAvailable[] = $i;
            }
            $data['votesBySteps'][$result['stepId']] = \count($results);

            if (true === $result['votesRanking'] && null !== $result['position']) {
                if (
                    isset(
                        $data['pointsBySteps'][$result['stepId']],
                        $pointsAvailable[$result['position']]
                    )
                ) {
                    $data['pointsBySteps'][$result['stepId']] +=
                        $pointsAvailable[$result['position']];
                } elseif (isset($pointsAvailable[$result['position']])) {
                    $data['pointsBySteps'][$result['stepId']] =
                        $pointsAvailable[$result['position']];
                }
            }
        }

        foreach ($items as $item) {
            if (!isset($data['votesBySteps'][$item])) {
                $data['votesBySteps'][$item] = 0;
            }
            if (!isset($data['pointsBySteps'][$item])) {
                $data['pointsBySteps'][$item] = 0;
            }
        }

        return $data;
    }
}
