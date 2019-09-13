<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\GraphQL\Resolver\Questionnaire\QuestionnaireRepliesResolver;
use Capco\AppBundle\Repository\AbstractVoteRepository;
use Capco\AppBundle\Repository\ConsultationStepRepository;
use Capco\AppBundle\Repository\SelectionStepRepository;
use Capco\AppBundle\Resolver\ContributionResolver;
use Doctrine\ORM\EntityManager;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class RecalculateCountersCommand extends ContainerAwareCommand
{
    public $force;

    /**
     * @var EntityManager
     */
    private $entityManager;

    protected function configure()
    {
        $this->setName('capco:compute:counters')
            ->setDescription('Recalculate the application counters')
            ->addOption(
                'force',
                false,
                InputOption::VALUE_NONE,
                'set this option to force complete recomputation'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        $this->entityManager = $container->get('doctrine')->getManager();
        $contributionResolver = $container->get(ContributionResolver::class);

        $this->force = $input->getOption('force');

        // ****************************** Opinion counters **********************************************

        $this->executeQuery(
            'UPDATE CapcoAppBundle:Opinion o set o.argumentsCount = (
          select count(DISTINCT a.id)
          from CapcoAppBundle:Argument a
          WHERE a.published = 1 AND a.trashedAt IS NULL AND a.opinion = o
        )'
        );

        $this->executeQuery(
            'UPDATE CapcoAppBundle:Opinion o set o.sourcesCount = (
          select count(DISTINCT s.id)
          from CapcoAppBundle:Source s
          WHERE s.published = 1 AND s.trashedAt IS NULL AND s.opinion = o
        )'
        );

        // Currently, you cannot UPDATE a table and select from the same table in a subquery.
        $this->executeQuery(
            'UPDATE opinion AS o
          JOIN
          ( SELECT p.id, COUNT(DISTINCT r.opinion_source) AS cnt
            FROM opinion p
            LEFT JOIN opinion_relation r
            ON r.opinion_source = p.id OR r.opinion_target = p.id
            WHERE p.published = 1 AND p.trashedAt IS NULL
            GROUP BY p.id
          ) AS g
          ON g.id = o.id
          SET o.connections_count = g.cnt',
            true
        );

        $this->executeQuery(
            'UPDATE CapcoAppBundle:Opinion a set a.votesCountOk = (
          select count(DISTINCT ov.id)
          from CapcoAppBundle:OpinionVote ov
          where ov.opinion = a AND ov.value = 1 group by ov.opinion
        )'
        );

        $this->executeQuery(
            'UPDATE CapcoAppBundle:Opinion a set a.votesCountMitige = (
          select count(DISTINCT ov.id)
          from CapcoAppBundle:OpinionVote ov
          where ov.opinion = a AND ov.value = 0 group by ov.opinion
        )'
        );

        $this->executeQuery(
            'UPDATE CapcoAppBundle:Opinion a set a.votesCountNok = (
          select count(DISTINCT ov.id)
          from CapcoAppBundle:OpinionVote ov
          where ov.opinion = a AND ov.value = -1 group by ov.opinion
        )'
        );

        // ******************************** Opinion version counters ****************************************

        $this->executeQuery(
            'UPDATE CapcoAppBundle:OpinionVersion ov set ov.argumentsCount = (
          select count(DISTINCT a.id)
          from CapcoAppBundle:Argument a
          WHERE a.published = 1 AND a.trashedAt IS NULL AND a.opinionVersion = ov
        )'
        );

        $this->executeQuery(
            'UPDATE CapcoAppBundle:OpinionVersion ov set ov.sourcesCount = (
          select count(DISTINCT s.id)
          from CapcoAppBundle:Source s
          WHERE s.published = 1 AND s.trashedAt IS NULL AND s.opinionVersion = ov
        )'
        );

        $this->executeQuery(
            'UPDATE CapcoAppBundle:OpinionVersion ov set ov.votesCountOk = (
          select count(DISTINCT ovv.id)
          from CapcoAppBundle:OpinionVersionVote ovv
          where ovv.opinionVersion = ov AND ovv.published = 1 AND ovv.value = 1 group by ovv.opinionVersion
        )'
        );

        $this->executeQuery(
            'UPDATE CapcoAppBundle:OpinionVersion ov set ov.votesCountMitige = (
          select count(DISTINCT ovv.id)
          from CapcoAppBundle:OpinionVersionVote ovv
          where ovv.opinionVersion = ov AND ovv.published = 1 AND ovv.value = 0 group by ovv.opinionVersion
        )'
        );

        $this->executeQuery(
            'UPDATE CapcoAppBundle:OpinionVersion ov set ov.votesCountNok = (
          select count(DISTINCT ovv.id)
          from CapcoAppBundle:OpinionVersionVote ovv
          where ovv.opinionVersion = ov AND ovv.published = 1 AND ovv.value = -1 group by ovv.opinionVersion
        )'
        );

        // ************************************ Votes counters **********************************************

        $this->executeQuery(
            'UPDATE CapcoAppBundle:Argument a set a.votesCount = (
          select count(DISTINCT av.id)
          from CapcoAppBundle:ArgumentVote av
          where av.argument = a AND av.published = 1 group by av.argument
        )'
        );

        $this->executeQuery(
            'UPDATE CapcoAppBundle:Source s set s.votesCount = (
          select count(DISTINCT sv.id)
          from CapcoAppBundle:SourceVote sv
          where sv.source = s AND sv.published = 1 group by sv.source
        )'
        );

        $this->executeQuery(
            'UPDATE CapcoAppBundle:Comment c set c.votesCount = (
          select count(DISTINCT cv.id)
          from CapcoAppBundle:CommentVote cv
          where cv.comment = c AND cv.published = 1 group by cv.comment
        )'
        );

        // ************************ Consultation step counters ***********************************************

        $this->executeQuery(
            'UPDATE CapcoAppBundle:Steps\ConsultationStep cs set cs.opinionCount = (
          select count(DISTINCT o.id)
          from CapcoAppBundle:Opinion o 
          INNER JOIN CapcoAppBundle:Consultation oc WITH o.consultation = oc
          WHERE oc.step = cs AND o.published = 1 AND o.trashedAt IS NULL group by oc.step
        )'
        );

        $this->executeQuery(
            'UPDATE CapcoAppBundle:Steps\ConsultationStep cs set cs.opinionVersionsCount = (
          select count(DISTINCT ov.id)
          from CapcoAppBundle:OpinionVersion ov 
          INNER JOIN CapcoAppBundle:Opinion o WITH ov.parent = o
          INNER JOIN CapcoAppBundle:Consultation oc WITH o.consultation = oc
          WHERE oc.step = cs AND ov.published = 1 AND ov.trashedAt IS NULL AND o.published = 1 AND o.trashedAt IS NULL group by oc.step
        )'
        );

        $this->executeQuery(
            'UPDATE CapcoAppBundle:Steps\ConsultationStep cs set cs.trashedOpinionCount = (
          select count(DISTINCT o.id)
          from CapcoAppBundle:Opinion o
          INNER JOIN CapcoAppBundle:Consultation oc WITH o.consultation = oc
          WHERE oc.step = cs AND o.published = 1 AND o.trashedAt IS NOT NULL group by oc.step
        )'
        );

        $this->executeQuery(
            'UPDATE CapcoAppBundle:Steps\ConsultationStep cs set cs.trashedOpinionVersionsCount = (
          select count(DISTINCT ov.id)
          from CapcoAppBundle:OpinionVersion ov 
          INNER JOIN CapcoAppBundle:Opinion o WITH ov.parent = o
          INNER JOIN CapcoAppBundle:Consultation oc WITH o.consultation = oc 
          WHERE oc.step = cs AND ov.published = 1 AND ov.trashedAt IS NOT NULL AND o.published = 1 group by oc.step
        )'
        );

        $consultationSteps = $container->get(ConsultationStepRepository::class)->findAll();
        foreach ($consultationSteps as $cs) {
            $first = <<<'DQL'
          select count(DISTINCT a.id)
          from CapcoAppBundle:Argument a
          LEFT JOIN CapcoAppBundle:Opinion o WITH a.opinion = o
          INNER JOIN CapcoAppBundle:Consultation oc WITH o.consultation = oc
          WHERE a.published = 1 AND a.trashedAt IS NULL AND a.opinion IS NOT NULL AND o.published = 1 AND oc.step = :cs
DQL;
            $second = <<<'DQL'
          select count(DISTINCT a.id)
          from CapcoAppBundle:Argument a
          LEFT JOIN CapcoAppBundle:Opinion o WITH a.opinion = o
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH a.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          INNER JOIN CapcoAppBundle:Consultation ovoc WITH ovo.consultation = ovoc
          WHERE a.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovoc.step = :cs
DQL;
            $this->updateCounterForConsultationStepWithOpinion(
                'argumentCount',
                $first,
                $second,
                $cs
            );

            $first = <<<'DQL'
          select count(DISTINCT a.id)
          from CapcoAppBundle:Argument a
          LEFT JOIN CapcoAppBundle:Opinion o WITH a.opinion = o
          INNER JOIN CapcoAppBundle:Consultation oc WITH o.consultation = oc
          WHERE a.published = 1 AND a.trashedAt IS NOT NULL AND a.opinion IS NOT NULL AND o.published = 1 AND oc.step = :cs
DQL;
            $second = <<<'DQL'
          select count(DISTINCT a.id)
          from CapcoAppBundle:Argument a
          LEFT JOIN CapcoAppBundle:Opinion o WITH a.opinion = o
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH a.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          INNER JOIN CapcoAppBundle:Consultation ovoc WITH ovo.consultation = ovoc
          WHERE a.published = 1 AND a.trashedAt IS NOT NULL AND a.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovoc.step = :cs
DQL;
            $this->updateCounterForConsultationStepWithOpinion(
                'trashedArgumentCount',
                $first,
                $second,
                $cs
            );

            $first = <<<'DQL'
          select count(DISTINCT s.id)
          from CapcoAppBundle:Source s
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH s.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH s.opinion = o
          INNER JOIN CapcoAppBundle:Consultation oc WITH o.consultation = oc
          WHERE s.published = 1 AND s.trashedAt IS NULL AND s.opinion IS NOT NULL AND o.published = 1 AND oc.step = :cs
DQL;
            $second = <<<'DQL'
          select count(DISTINCT s.id)
          from CapcoAppBundle:Source s
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH s.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH s.opinion = o
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          INNER JOIN CapcoAppBundle:Consultation ovoc WITH ovo.consultation = ovoc
          WHERE s.published = 1 AND s.trashedAt IS NULL AND s.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovoc.step = :cs
DQL;
            $this->updateCounterForConsultationStepWithOpinion(
                'sourcesCount',
                $first,
                $second,
                $cs
            );

            $first = <<<'DQL'
          select count(DISTINCT s.id)
          from CapcoAppBundle:Source s
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH s.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH s.opinion = o
          INNER JOIN CapcoAppBundle:Consultation oc WITH o.consultation = oc
          WHERE s.published = 1 AND s.trashedAt IS NOT NULL AND s.opinion IS NOT NULL AND o.published = 1 AND oc.step = :cs
DQL;
            $second = <<<'DQL'
          select count(DISTINCT s.id)
          from CapcoAppBundle:Source s
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH s.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH s.opinion = o
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          INNER JOIN CapcoAppBundle:Consultation ovoc WITH ovo.consultation = ovoc
          WHERE s.published = 1 AND s.trashedAt IS NOT NULL AND s.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovoc.step = :cs
DQL;
            $this->updateCounterForConsultationStepWithOpinion(
                'trashedSourceCount',
                $first,
                $second,
                $cs
            );

            if ($cs->isOpen() || $this->force) {
                $participants = $contributionResolver->countStepContributors($cs);
                $this->executeQuery(
                    'UPDATE CapcoAppBundle:Steps\ConsultationStep cs
                    set cs.contributorsCount = ' .
                        $participants .
                        '
                    where cs.id = \'' .
                        $cs->getId() .
                        '\''
                );

                $stepCount = $container
                    ->get(AbstractVoteRepository::class)
                    ->getVotesFromConsultationStep($cs);
                $this->executeQuery(
                    'UPDATE CapcoAppBundle:Steps\ConsultationStep cs
                    set cs.votesCount = ' .
                        $stepCount .
                        '
                    where cs.id = \'' .
                        $cs->getId() .
                        '\''
                );
                foreach ($cs->getConsultations() as $consultation) {
                    $consultationCount = $container
                        ->get(AbstractVoteRepository::class)
                        ->getVotesFromConsultation($consultation);

                    $this->executeQuery(
                        'UPDATE CapcoAppBundle:Consultation c
                    set c.votesCount = ' .
                        $consultationCount .
                        '
                    where c.id = \'' .
                        $consultation->getId() .
                        '\''
                    );
                }
            }
        }

        // ****************************** Questionnaire step counters **************************************

        $questionnaireSteps = $this->entityManager
            ->getRepository('CapcoAppBundle:Steps\QuestionnaireStep')
            ->findAll();
        $repliesResolver = $container->get(QuestionnaireRepliesResolver::class);

        foreach ($questionnaireSteps as $qs) {
            if ($qs->isOpen() || $this->force) {
                if ($qs->getQuestionnaire()) {
                    $repliesCount = $repliesResolver->calculateTotalCount($qs->getQuestionnaire());
                    $this->executeQuery(
                        'UPDATE CapcoAppBundle:Steps\QuestionnaireStep qs
                        set qs.repliesCount = ' .
                            $repliesCount .
                            '
                        where qs.id = \'' .
                            $qs->getId() .
                            '\''
                    );
                }
            }
        }

        // ****************************** Selection steps counters **************************************

        $selectionSteps = $container->get(SelectionStepRepository::class)->findAll();
        foreach ($selectionSteps as $selectionStep) {
            if ($selectionStep->isOpen() || $this->force) {
                $participants = $contributionResolver->countStepContributors($selectionStep);
                $this->executeQuery(
                    'UPDATE CapcoAppBundle:Steps\SelectionStep step
                    set step.contributorsCount = ' .
                        $participants .
                        '
                    where step.id = \'' .
                        $selectionStep->getId() .
                        '\''
                );
            }
        }

        $output->writeln('Calculation completed');
    }

    private function updateCounterForConsultationStepWithOpinion(
        string $fieldName,
        string $firstQuery,
        string $secondQuery,
        ConsultationStep $cs
    ): void {
        $count = $this->entityManager
            ->createQuery($firstQuery)
            ->setParameter('cs', $cs)
            ->getSingleScalarResult();
        $count += $this->entityManager
            ->createQuery($secondQuery)
            ->setParameter('cs', $cs)
            ->getSingleScalarResult();

        $this->executeQuery(
            "UPDATE CapcoAppBundle:Steps\\ConsultationStep cs set cs.${fieldName} = ${count} WHERE cs.id = '" .
                $cs->getId() .
                "'"
        );
    }

    private function executeQuery(string $sql, bool $executeUpdate = false): void
    {
        $retry = 0;
        $maxRetries = 3;

        try {
            $this->entityManager->beginTransaction();

            $executeUpdate
                ? $this->entityManager->getConnection()->executeUpdate($sql)
                : $this->entityManager->createQuery($sql)->execute();

            $this->entityManager->commit();
        } catch (\Exception $exception) {
            $this->entityManager->rollback();
            ++$retry;

            if ($retry === $maxRetries) {
                throw $exception;
            }
        }
    }
}
