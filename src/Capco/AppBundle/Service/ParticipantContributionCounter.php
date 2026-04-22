<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\Participant;
use Doctrine\ORM\EntityManagerInterface;

class ParticipantContributionCounter
{
    public function __construct(
        private readonly EntityManagerInterface $em
    ) {
    }

    /**
     * @return array{byProject: array<array{count: int, project: array{id: string}}>, byStep: array<array{count: int, step: array{id: string}}>, total: int}
     */
    public function getCountsForParticipant(Participant $participant): array
    {
        $byProject = [];
        $byStep = [];
        $total = 0;

        $voteCounts = $this->getVoteCountsByParticipant($participant);
        foreach ($voteCounts as $count) {
            $projectId = $count['projectId'];
            $stepId = $count['stepId'];
            $cnt = (int) $count['cnt'];

            if (!isset($byProject[$projectId])) {
                $byProject[$projectId] = ['count' => 0, 'project' => ['id' => $projectId]];
            }
            $byProject[$projectId]['count'] += $cnt;

            if ($stepId && !isset($byStep[$stepId])) {
                $byStep[$stepId] = ['count' => 0, 'step' => ['id' => $stepId]];
            }
            if ($stepId) {
                $byStep[$stepId]['count'] += $cnt;
            }

            $total += $cnt;
        }

        $replyCounts = $this->getReplyCountsByParticipant($participant);
        foreach ($replyCounts as $count) {
            $projectId = $count['projectId'];
            $stepId = $count['stepId'];
            $cnt = (int) $count['cnt'];

            if (!isset($byProject[$projectId])) {
                $byProject[$projectId] = ['count' => 0, 'project' => ['id' => $projectId]];
            }
            $byProject[$projectId]['count'] += $cnt;

            if ($stepId && !isset($byStep[$stepId])) {
                $byStep[$stepId] = ['count' => 0, 'step' => ['id' => $stepId]];
            }
            if ($stepId) {
                $byStep[$stepId]['count'] += $cnt;
            }

            $total += $cnt;
        }

        return [
            'byProject' => array_values($byProject),
            'byStep' => array_values($byStep),
            'total' => $total,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function getVoteCountsByParticipant(Participant $participant): array
    {
        $sql = <<<'SQL'
                SELECT
                    pas.project_id as projectId,
                    COALESCE(v.selection_step_id, v.collect_step_id) as stepId,
                    COUNT(v.id) as cnt
                FROM votes v
                JOIN step s ON s.id = COALESCE(v.selection_step_id, v.collect_step_id)
                JOIN project_abstractstep pas ON pas.step_id = s.id
                WHERE v.participant_id = :participantId
                  AND v.is_accounted = 1
                  AND v.completion_status = 'COMPLETED'
                GROUP BY pas.project_id, COALESCE(v.selection_step_id, v.collect_step_id)
            SQL;

        return $this->em
            ->getConnection()
            ->executeQuery($sql, ['participantId' => $participant->getId()])
            ->fetchAllAssociative()
        ;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function getReplyCountsByParticipant(Participant $participant): array
    {
        $sql = <<<'SQL'
                SELECT
                    pas.project_id as projectId,
                    q.step_id as stepId,
                    COUNT(r.id) as cnt
                FROM reply r
                JOIN questionnaire q ON q.id = r.questionnaire_id
                JOIN step s ON s.id = q.step_id
                JOIN project_abstractstep pas ON pas.step_id = s.id
                WHERE r.participant_id = :participantId
                  AND r.completion_status = 'COMPLETED'
                  AND r.is_draft = 0
                  AND r.published = 1
                GROUP BY pas.project_id, q.step_id
            SQL;

        return $this->em
            ->getConnection()
            ->executeQuery($sql, ['participantId' => $participant->getId()])
            ->fetchAllAssociative()
        ;
    }
}
