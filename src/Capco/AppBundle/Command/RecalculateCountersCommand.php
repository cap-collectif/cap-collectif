<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\GraphQL\Resolver\Questionnaire\QuestionnaireRepliesResolver;
use Capco\AppBundle\Repository\AbstractVoteRepository;
use Capco\AppBundle\Repository\ConsultationStepRepository;
use Capco\AppBundle\Repository\SelectionStepRepository;
use Capco\AppBundle\Resolver\ContributionResolver;
use Doctrine\ORM\EntityManager;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Command\LockableTrait;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class RecalculateCountersCommand extends Command
{
    use LockableTrait;

    public bool $force;
    private EntityManager $entityManager;
    private ContainerInterface $container;

    public function __construct(string $name, ContainerInterface $container)
    {
        $this->container = $container;
        parent::__construct($name);
    }

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
        if (!$this->lock()) {
            $output->writeln(
                'The command ' . __METHOD__ . ' is already running in another process.'
            );

            return 0;
        }
        $container = $this->getContainer();
        $this->entityManager = $container->get('doctrine')->getManager();
        $contributionResolver = $container->get(ContributionResolver::class);

        $this->force = $input->getOption('force');

        // ****************************** Opinion counters **********************************************

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

        // ************************ Consultation step counters ***********************************************

        $consultationSteps = $container->get(ConsultationStepRepository::class)->findAll();
        foreach ($consultationSteps as $cs) {
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
                    $repliesCount = $repliesResolver->calculatePublishedTotalCount(
                        $qs->getQuestionnaire()
                    );
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

        $output->writeln('<info>Counters calculation completed !</info>');

        return 0;
    }

    private function getContainer()
    {
        return $this->container;
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
