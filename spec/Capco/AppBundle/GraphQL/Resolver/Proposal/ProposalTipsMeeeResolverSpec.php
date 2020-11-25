<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Client\TipsmeeeClient;
use Capco\AppBundle\DTO\TipsMeee;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalTipsMeeeResolver;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Symfony\Component\Cache\CacheItem;

class ProposalTipsMeeeResolverSpec extends ObjectBehavior
{
    public function let(
        TipsmeeeClient $tipsmeeeClient,
        LoggerInterface $logger,
        RedisCache $cache
    ): void {
        $this->beConstructedWith($tipsmeeeClient, $logger, $cache);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(ProposalTipsMeeeResolver::class);
    }

    public function it_should_return_tipsmee_data_without_cache(
        RedisCache $cache,
        TipsmeeeClient $tipsmeeeClient,
        Proposal $proposal,
        TipsMeee $account,
        CacheItem $cacheItem
    ): void {
        $cache->getItem(\Prophecy\Argument::any())->willReturn($cacheItem);
        $account->getDonationTotalCount()->willReturn(1515);
        $account->getDonatorsCount()->willReturn(2);
        $account->getTopDonators(5)->willReturn([
            [
                'email' => 'joueur_francais@capco.com',
                'name' => 'joueur_francais',
                'amount' => 1500,
            ],
            [
                'email' => 'joueur_belge@capco.com',
                'name' => 'joueur_belge',
                'amount' => 15,
            ],
        ]);
        $proposal->getTipsmeeeId()->willReturn('XptDRL0l1');
        $tipsmeeeClient->getAccountById('XptDRL0l1')->willReturn([
            [
                'amount' => 1000,
                'date' => '2020-11-03T18:09:12',
                'name' => 'joueur_francais',
                'email' => 'joueur_francais@capco.com',
            ],
            [
                'amount' => 500,
                'date' => '2020-11-03T18:09:15',
                'name' => 'joueur_francais',
                'email' => 'joueur_francais@capco.com',
            ],
            [
                'amount' => 15,
                'date' => '2020-11-03T18:09:20',
                'name' => 'joueur_belge',
                'email' => 'joueur_belge@capco.com',
            ],
        ]);
        $this->__invoke($proposal)->shouldBeAnInstanceOf(TipsMeee::class);
    }

    public function it_should_return_tipsmee_data_with_cache(
        RedisCache $cache,
        Proposal $proposal,
        CacheItem $cacheItem
    ): void {
        $proposal->getTipsmeeeId()->willReturn('proposalTipsmeeeId');
        $cache->getItem('tipsMeeeProposalsData-proposalTipsmeeeId')->willReturn($cacheItem);
        $cacheItem->get('value')->willReturn([
            'tips' => [],
            'donationTotalCount' => 0,
            'donatorsCount' => 0,
            'donationCount' => 0,
        ]);
        $this->__invoke($proposal)->shouldBeAnInstanceOf(TipsMeee::class);
    }

    public function it_should_not_return_tipsmee_data_if_disabled(Proposal $proposal): void
    {
        $proposal->getTipsmeeeId()->willReturn(null);
        $this->__invoke($proposal)->shouldBe(null);
    }
}
