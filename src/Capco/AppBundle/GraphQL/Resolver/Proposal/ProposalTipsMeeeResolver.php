<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Client\TipsmeeeClient;
use Capco\AppBundle\Command\ComputeTipsMeeeDataCommand;
use Capco\AppBundle\DTO\TipsMeee;
use Capco\AppBundle\Entity\Proposal;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;

class ProposalTipsMeeeResolver implements ResolverInterface
{
    private TipsmeeeClient $client;
    private LoggerInterface $logger;
    private RedisCache $cache;

    public function __construct(
        TipsmeeeClient $tipsmeeeClient,
        LoggerInterface $logger,
        RedisCache $cache
    ) {
        $this->client = $tipsmeeeClient;
        $this->logger = $logger;
        $this->cache = $cache;
    }

    public function __invoke(Proposal $proposal)
    {
        if (!($accountId = $proposal->getTipsmeeeId())) {
            return null;
        }

        if (
            $cachedTipsMeeeData = $this->cache
                ->getItem(
                    ComputeTipsMeeeDataCommand::TIPSMEEE_CACHE_KEY .
                        '-' .
                        $proposal->getTipsmeeeId()
                )
                ->get('value')
        ) {
            return new TipsMeee(
                $cachedTipsMeeeData['tips'],
                $cachedTipsMeeeData['donationTotalCount'],
                $cachedTipsMeeeData['donatorsCount'],
                $cachedTipsMeeeData['donationCount']
            );
        }

        try {
            $tipsmeeeAccount = $this->client->getAccountById($accountId);
            if (empty($tipsmeeeAccount)) {
                return null;
            }
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . $exception->getMessage());

            throw new \RuntimeException('Something went wrong.');
        }

        return new TipsMeee($tipsmeeeAccount);
    }
}
