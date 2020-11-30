<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Box\Spout\Writer\Common\Creator\WriterEntityFactory;
use Box\Spout\Writer\WriterInterface;
use Capco\AppBundle\DTO\TipsMeee;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Client\TipsmeeeClient;
use Symfony\Component\Console\Command\LockableTrait;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Capco\AppBundle\Command\Utils\ExportUtils;

class ComputeTipsMeeeDataCommand extends BaseExportCommand
{
    use LockableTrait;
    use SnapshotCommandTrait;

    public const TIPSMEEE_CACHE_KEY = 'tipsMeeeProposalsData';

    protected static $defaultName = 'capco:compute:tipsmeee-data';

    private RedisCache $cache;
    private TipsmeeeClient $tipsmeeeClient;
    private ProposalRepository $proposalRepository;
    private Manager $featureToggleManager;
    private LoggerInterface $logger;
    private WriterInterface $writer;
    private string $projectRootDir;

    public function __construct(
        RedisCache $cache,
        TipsmeeeClient $tipsmeeeClient,
        ProposalRepository $proposalRepository,
        Manager $featureToggleManager,
        ExportUtils $exportUtils,
        LoggerInterface $logger,
        string $projectRootDir
    ) {
        $this->cache = $cache;
        $this->tipsmeeeClient = $tipsmeeeClient;
        $this->proposalRepository = $proposalRepository;
        $this->featureToggleManager = $featureToggleManager;
        $this->logger = $logger;
        $this->projectRootDir = $projectRootDir;
        parent::__construct($exportUtils);
    }

    public function execute(InputInterface $input, OutputInterface $output): int
    {
        $start = microtime(true);
        $generateCsv = $input->getOption('generate-csv');
        $selectionStepId = $input->getOption('selected-in-step') ?: null;

        if (!$this->lock()) {
            $output->writeln('<error>The command is already running in another process.</error>');

            return 0;
        }

        if (!$this->featureToggleManager->isActive('unstable__tipsmeee')) {
            $output->writeln('<error>The feature unstable_tipsmeee is not enabled.</error>');

            return 0;
        }

        $output->writeln('<comment>Starting fetching datas from TipsMeee API.</comment>');
        $accounts = $this->tipsmeeeClient->getAllAccounts();
        $formattedAccounts = [];
        foreach ($accounts as $account) {
            $formattedAccounts[$account['account']] = $account['tips'];
        }
        $accountIds = array_keys($formattedAccounts);
        if (!$generateCsv) {
            // Delete all TipsMeee related items, prevent orphans keys after a proposal has been removed.
            $this->resetRedisTipsMeeeItems($accountIds, $output);
        }
        $output->writeln('<comment>Fetching matching proposals from database.</comment>');
        // If selectionStep id is specified, filter the selected proposals, otherwise return all submitted proposals.
        $proposals = $this->filterSelectedProposals(
            $this->proposalRepository->findBy([
                'tipsmeeeId' => $accountIds,
            ]),
            $selectionStepId
        );

        if (empty($proposals)) {
            $output->writeln('<info>Found 0 proposals ... Bye !</info>');

            return 0;
        }

        $output->writeln(
            '<comment>Found ' .
                \count($proposals) .
                ' proposals ... ' .
                ($generateCsv
                    ? 'Generating CSV' .
                        ($selectionStepId ? " for selection step with ID: ${selectionStepId}" : '.')
                    : 'Starting caching datas.') .
                '</comment>'
        );

        if ($generateCsv) {
            $filename = $selectionStepId
                ? $proposals[0]->getProject()->getSlug() . '-tipsmeee-proposals-donations-data.csv'
                : 'tipsmeee-proposals-donations-data.csv';
            $this->writer = WriterFactory::create(Type::CSV, $input->getOption('delimiter'));
            $this->writer->openToFile(
                sprintf('%s/public/export/%s', $this->projectRootDir, $filename)
            );
            $this->writer->addRow(
                WriterEntityFactory::createRowFromArray([
                    'proposal_id',
                    'tipsmeee_id',
                    'donationTotalCount',
                    'donatorsCount',
                    'donationCount',
                    'topDonators',
                ])
            );
        }

        /** @var Proposal $proposal */
        foreach ($proposals as $proposal) {
            $proposalTipsmeeeId = $proposal->getTipsmeeeId();
            $output->writeln(
                "<comment>Processing proposal with ID : ${proposalTipsmeeeId}.</comment>"
            );
            if (!$proposal->isSelected()) {
                $output->writeln(
                    '<comment>This proposal is not selected in any selection step.</comment>'
                );
            }
            if (empty($formattedAccounts[$proposal->getTipsmeeeId()])) {
                $output->writeln('<info>No tips found for this proposal.</info>');

                continue;
            }
            $tipsMeeeDTO = new TipsMeee($formattedAccounts[$proposalTipsmeeeId]);
            if ($generateCsv) {
                $this->writer->addRow(
                    WriterEntityFactory::createRowFromArray([
                        $proposal->getId(),
                        $proposal->getTipsmeeeId(),
                        $tipsMeeeDTO->getDonationTotalCount(),
                        $tipsMeeeDTO->getDonatorsCount(),
                        $tipsMeeeDTO->getDonationCount(),
                        implode(
                            '|',
                            array_map(static function (array $topDonator) {
                                return $topDonator['email'];
                            }, $tipsMeeeDTO->getTopDonators(5))
                        ),
                    ])
                );
            } else {
                $cachedItem = $this->cache->getItem(
                    self::TIPSMEEE_CACHE_KEY . '-' . $proposalTipsmeeeId
                );
                $cachedResults = [
                    'tips' => $tipsMeeeDTO->getAccountData(),
                    'donationTotalCount' => $tipsMeeeDTO->getDonationTotalCount(),
                    'donatorsCount' => $tipsMeeeDTO->getDonatorsCount(),
                    'donationCount' => $tipsMeeeDTO->getDonationCount(),
                ];
                $cachedItem->set($cachedResults);
                $this->cache->save($cachedItem);
            }
        }
        $output->writeln('<info>Saved.</info>');
        $execTime = microtime(true) - $start;
        $output->writeln("<info>Done in ${execTime} s.</info>");

        return 0;
    }

    protected function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this->setName('capco:compute:tipsmeee-data')
            ->setDescription('Compute TipsMeee donations data.')
            ->addOption(
                'generate-csv',
                null,
                InputOption::VALUE_NONE,
                'Generate a CSV containing submitted proposals with their donations related datas.'
            )
            ->addOption(
                'selected-in-step',
                null,
                InputOption::VALUE_REQUIRED,
                'If this value is specified and generate-csv option enabled, generate a CSV containing selected proposals with their donations related datas.'
            )
            ->addOption(
                'delimiter',
                'd',
                InputOption::VALUE_OPTIONAL,
                'Delimiter used in csv',
                ';'
            );
    }

    private function filterSelectedProposals(array $proposals, ?string $selectionStepId): array
    {
        if ($selectionStepId) {
            $proposals = array_filter($proposals, static function (Proposal $proposal) use (
                $selectionStepId
            ) {
                $selectionStepsIds = array_map(static function (Selection $selection) {
                    return $selection->getStep()->getId();
                }, $proposal->getSelections()->getValues() ?? []);

                return isset($selectionStepsIds[$selectionStepId]);
            });

            return $proposals;
        }

        return $proposals;
    }

    private function resetRedisTipsMeeeItems(array $accountIds, OutputInterface $output): void
    {
        if (empty($accountIds)) {
            $output->writeln('<info>No account ids specified ... Skipping reset.</info>');

            return;
        }
        $output->writeln('<info>Resetting Redis TipsMeee items...</info>');
        $keysToDelete = array_map(function (string $id) {
            $keyString = self::TIPSMEEE_CACHE_KEY . '-' . $id;
            $this->logger->info(
                "[REDIS] Deleting cache item of redis key 'tipsMeeeProposalsData' with id : ${keyString}"
            );

            return $keyString;
        }, $accountIds);
        $this->cache->deleteItems($keysToDelete);
        $output->writeln('<info>Done.</info>');
    }
}
