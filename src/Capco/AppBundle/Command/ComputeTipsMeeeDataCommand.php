<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\DTO\TipsMeee;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Toggle\Manager;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Client\TipsmeeeClient;
use Symfony\Component\Console\Command\LockableTrait;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class ComputeTipsMeeeDataCommand extends Command
{
    use LockableTrait;

    public const TIPSMEEE_CACHE_KEY = 'tipsMeeeProposalsData';
    protected static $defaultName = 'capco:compute:tipsmeee-data';
    private RedisCache $cache;
    private TipsmeeeClient $tipsmeeeClient;
    private ProposalRepository $proposalRepository;
    private Manager $featureToggleManager;
    private LoggerInterface $logger;

    public function __construct(
        string $name,
        RedisCache $cache,
        TipsmeeeClient $tipsmeeeClient,
        ProposalRepository $proposalRepository,
        Manager $featureToggleManager,
        LoggerInterface $logger
    ) {
        $this->cache = $cache;
        $this->tipsmeeeClient = $tipsmeeeClient;
        $this->proposalRepository = $proposalRepository;
        $this->featureToggleManager = $featureToggleManager;
        $this->logger = $logger;
        parent::__construct($name);
    }

    public function execute(InputInterface $input, OutputInterface $output): int
    {
        $start = microtime(true);
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
        // Delete all TipsMeee related items, prevent orphans keys after a proposal has been removed.
        $this->resetRedisTipsMeeeItems($accountIds, $output);
        $output->writeln('<comment>Fetching matching proposals from database.</comment>');
        $proposals = $this->proposalRepository->findBy([
            'tipsmeeeId' => $accountIds,
        ]);
        if (empty($proposals)) {
            $output->writeln('<info>Found 0 proposals ... Bye !</info>');

            return 0;
        }
        $output->writeln(
            '<commment>Found ' .
                \count($proposals) .
                ' proposals ... Starting caching datas.</commment>'
        );
        foreach ($proposals as $proposal) {
            $proposalTipsmeeeId = $proposal->getTipsmeeeId();
            $output->writeln(
                "<comment>Processing proposal with ID : ${proposalTipsmeeeId}.</comment>"
            );
            if (empty($formattedAccounts[$proposal->getTipsmeeeId()])) {
                $output->writeln('<info>No tips found for this proposal.</info>');

                continue;
            }
            $cachedItem = $this->cache->getItem(
                self::TIPSMEEE_CACHE_KEY . '-' . $proposalTipsmeeeId
            );
            $tipsMeeeDTO = new TipsMeee($formattedAccounts[$proposalTipsmeeeId]);
            $cachedResults = [
                'tips' => $tipsMeeeDTO->getAccountData(),
                'donationTotalCount' => $tipsMeeeDTO->getDonationTotalCount(),
                'donatorsCount' => $tipsMeeeDTO->getDonatorsCount(),
                'donationCount' => $tipsMeeeDTO->getDonationCount(),
            ];
            $cachedItem->set($cachedResults);
            $this->cache->save($cachedItem);
        }
        $output->writeln('<info>Saved.</info>');
        $execTime = microtime(true) - $start;
        $output->writeln("<info>Done in ${execTime} s.</info>");

        return 0;
    }

    protected function configure(): void
    {
        $this->setName('capco:compute:tipsmeee-data')->setDescription(
            'Compute TipsMeee donations data.'
        );
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
