<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Box\Spout\Writer\Common\Creator\WriterEntityFactory;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Capco\AppBundle\GraphQL\ConnectionTraversor;
use Capco\AppBundle\Helper\GraphqlQueryAndCsvHeaderHelper;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Overblog\GraphQLBundle\Request\Executor;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateStepContributorsCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;
    protected static $defaultName = 'capco:export:step-contributors';

    private Manager $toggleManager;
    private ConnectionTraversor $connectionTraversor;
    private Executor $executor;
    private LoggerInterface $logger;
    private string $projectRootDir;
    private AbstractStepRepository $stepRepository;

    public function __construct(
        GraphQlAclListener $listener,
        ConnectionTraversor $connectionTraversor,
        ExportUtils $exportUtils,
        Executor $executor,
        LoggerInterface $logger,
        Manager $toggleManager,
        AbstractStepRepository $abstractStepRepository,
        string $projectRootDir
    ) {
        $listener->disableAcl();
        $this->toggleManager = $toggleManager;
        $this->connectionTraversor = $connectionTraversor;
        $this->executor = $executor;
        $this->logger = $logger;
        $this->projectRootDir = $projectRootDir;

        $this->stepRepository = $abstractStepRepository;
        parent::__construct($exportUtils);
    }

    /**
     * We have to make sure the string is unique for each step.
     */
    public static function getFilename(AbstractStep $step): string
    {
        $slug = '';
        if ($step->getProject()) {
            $slug .= $step->getProject()->getSlug() . '_';
        } else {
            $slug .= $step->getId() . '_';
        }
        $slug .= $step->getSlug();

        return self::getShortenedFilename('participants_' . $slug);
    }

    public function generateSheet(
        OutputInterface $output,
        AbstractStep $step,
        string $fileName,
        string $delimiter,
        bool $isVerbose
    ): void {
        $data = $this->executor
            ->execute('internal', [
                'query' => $this->getStepContributorsGraphQLQuery($step->getId()),
                'variables' => [],
            ])
            ->toArray()
        ;

        if (!isset($data['data'])) {
            $this->logger->error('GraphQL Query Error: ' . $data['error']);
            $this->logger->info('GraphQL query: ' . json_encode($data));
        }
        if (
            $isVerbose
            && isset($data['data']['node']['contributors']['totalCount'])
            && 0 === $data['data']['node']['contributors']['totalCount']
        ) {
            $output->writeln("\t<fg=magenta>Empty export: there is no contributor.</>");
        }
        $writer = WriterFactory::create(Type::CSV, $delimiter);
        if (!$writer) {
            throw new \RuntimeException('An exception occured while creating a writer.');
        }
        $writer->openToFile(sprintf('%s/public/export/%s', $this->projectRootDir, $fileName));
        $header = GraphqlQueryAndCsvHeaderHelper::USER_HEADERS;
        $isCollectOrSelectionStep = \in_array($step->getType(), ['collect', 'selection']);
        $isFranceConnectAccountCsvLine = 22;
        if (!$isCollectOrSelectionStep) {
            unset($header[$isFranceConnectAccountCsvLine]);
        }
        $writer->addRow(WriterEntityFactory::createRowFromArray($header));
        $this->connectionTraversor->traverse(
            $data,
            'contributors',
            function ($edge) use (
                $writer,
                $isCollectOrSelectionStep,
                $isFranceConnectAccountCsvLine
            ) {
                $contributor = $edge['node'];
                $row = [
                    $contributor['id'],
                    $contributor['email'],
                    $contributor['username'] ?? null,
                    ($contributor['userType'] ?? null) ? $contributor['userType']['name'] : null,
                    $contributor['createdAt'],
                    $contributor['updatedAt'] ?? null,
                    $contributor['lastLogin'] ?? null,
                    $contributor['rolesText'] ?? null,
                    $contributor['consentInternalCommunication'] ?? null,
                    $contributor['enabled'] ?? null,
                    $contributor['isEmailConfirmed'] ?? null,
                    $contributor['locked'] ?? null,
                    $contributor['phoneConfirmed'],
                    $contributor['gender'] ?? null,
                    $contributor['websiteUrl'] ?? null,
                    $contributor['biography'] ?? null,
                    $contributor['zipCode'] ?? null,
                    $contributor['city'] ?? null,
                    $contributor['firstname'],
                    $contributor['lastname'],
                    $contributor['dateOfBirth'],
                    $contributor['postalAddress']
                        ? $contributor['postalAddress']['formatted']
                        : null,
                    ($contributor['isFranceConnectAccount'] ?? null) ? filter_var($contributor['isFranceConnectAccount'], \FILTER_VALIDATE_BOOLEAN)
                        ? 'YES'
                        : 'NO' : 'NO',
                    $contributor['phone'],
                    $contributor['url'] ?? null,
                    $contributor['userIdentificationCode'],
                ];
                if (!$isCollectOrSelectionStep) {
                    unset($row[$isFranceConnectAccountCsvLine]);
                }
                $writer->addRow(WriterEntityFactory::createRowFromArray($row));
            },
            function ($pageInfo) use ($step) {
                return $this->getStepContributorsGraphQLQuery(
                    $step->getId(),
                    $pageInfo['endCursor']
                );
            }
        );
        $writer->close();
        $this->logger->info(
            sprintf('Done generating %s/public/export/%s', $this->projectRootDir, $fileName)
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$this->toggleManager->isActive('export')) {
            $output->writeln('Please enable "export" feature to run this command');

            return 1;
        }
        $delimiter = $input->getOption('delimiter');
        $isVerbose = $input->getOption('verbose');

        $steps = $this->stepRepository->findAll();
        foreach ($steps as $step) {
            $type = $step->getType();
            if ($isVerbose) {
                $stepSlug = $step->getSlug();
                $output->writeln("<fg=white>Examining step {$stepSlug} of type {$type}</>");
            }
            if ($step->isParticipative()) {
                $fileName = self::getFilename($step);
                $output->writeln("\t<info>Generating {$fileName} sheet as {$type}</info>");
                $this->generateSheet($output, $step, $fileName, $delimiter, $isVerbose);
                $this->executeSnapshot($input, $output, $fileName);
            }
        }

        return 0;
    }

    protected function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this->setDescription('Create a csv file for each step');
    }

    private function getStepContributorsGraphQLQuery(
        string $stepId,
        ?string $userCursor = null
    ): string {
        if ($userCursor) {
            $userCursor = sprintf(', after: "%s"', $userCursor);
        }
        $USER_FRAGMENT = GraphqlQueryAndCsvHeaderHelper::USER_FRAGMENT;
        $CONTRIBUTOR_FRAGMENT = GraphqlQueryAndCsvHeaderHelper::CONTRIBUTOR_FRAGMENT;

        return <<<EOF
                    query {
                      node(id: "{$stepId}") {
                       ... on Consultation {
                          contributors(first: 50 {$userCursor}) {
                            edges {
                              cursor
                              node {
                                {$CONTRIBUTOR_FRAGMENT}
                                ...on User {
                                    {$USER_FRAGMENT}
                                }
                              }
                            }
                            totalCount
                            pageInfo {
                              startCursor
                              endCursor
                              hasNextPage
                            }
                          }
                        }
                        ... on ConsultationStep {
                          contributors(first: 50 {$userCursor}) {
                            edges {
                              cursor
                              node {
                                {$CONTRIBUTOR_FRAGMENT}
                                ...on User {
                                    {$USER_FRAGMENT}
                                }
                              }
                            }
                            totalCount
                            pageInfo {
                              startCursor
                              endCursor
                              hasNextPage
                            }
                          }
                        }
                        ... on CollectStep {
                          contributors(first: 50 {$userCursor}) {
                            edges {
                              cursor
                              node {
                                {$CONTRIBUTOR_FRAGMENT}
                                ...on User {
                                    {$USER_FRAGMENT}
                                }
                              }
                            }
                            totalCount
                            pageInfo {
                              startCursor
                              endCursor
                              hasNextPage
                            }
                          }
                        }
                        ... on SelectionStep {
                          contributors(first: 50 {$userCursor}) {
                            edges {
                              cursor
                              node {
                                {$CONTRIBUTOR_FRAGMENT}
                                ...on User {
                                    {$USER_FRAGMENT}
                                }
                              }
                            }
                            totalCount
                            pageInfo {
                              startCursor
                              endCursor
                              hasNextPage
                            }
                          }
                        }
                        ... on QuestionnaireStep {
                          contributors(first: 50 {$userCursor}) {
                            edges {
                              cursor
                              node {
                                {$CONTRIBUTOR_FRAGMENT}
                                ...on User {
                                    {$USER_FRAGMENT}
                                }
                              }
                            }
                            totalCount
                            pageInfo {
                              startCursor
                              endCursor
                              hasNextPage
                            }
                          }
                        }
                        ... on DebateStep {
                          contributors(first: 50 {$userCursor}) {
                            edges {
                              cursor
                              node {
                                {$CONTRIBUTOR_FRAGMENT}
                                ...on User {
                                    {$USER_FRAGMENT}
                                }
                              }
                            }
                            totalCount
                            pageInfo {
                              startCursor
                              endCursor
                              hasNextPage
                            }
                          }
                        }
                      }
                    }
            EOF;
    }
}
