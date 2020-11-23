<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Client\TipsmeeeClient;
use Capco\AppBundle\DTO\cul;
use Capco\AppBundle\DTO\TipsMeee;
use Capco\AppBundle\Entity\Proposal;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;
use Overblog\GraphQLBundle\Definition\Argument;


class ProposalTipsMeeeResolver implements ResolverInterface
{
    private TipsmeeeClient $client;
    private LoggerInterface $logger;

    public function __construct(TipsmeeeClient $tipsmeeeClient, LoggerInterface $logger)
    {
        $this->client = $tipsmeeeClient;
        $this->logger = $logger;
    }

    public function __invoke(Proposal $proposal)
    {
        if (!($accountId = $proposal->getTipsmeeeId())) {
            return null;
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
