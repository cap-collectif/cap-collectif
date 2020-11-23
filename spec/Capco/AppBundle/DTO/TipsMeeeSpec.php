<?php

namespace spec\Capco\AppBundle\DTO;

use Capco\AppBundle\DTO\TipsMeee;
use PhpSpec\ObjectBehavior;

class TipsMeeeSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->beConstructedWith([]);
        $this->shouldHaveType(TipsMeee::class);
    }

    public function it_should_return_correct_tipsmeee_object_with_computed_data(): void
    {
        $this->beConstructedWith([
            [
                'email' => 'joueur_francais@capco.com',
                'name' => 'joueur_francais',
                'amount' => 1500,
                'date' => '2020-11-04T18:09:12',
            ],
            [
                'email' => 'joueur_belge@capco.com',
                'name' => 'joueur_belge',
                'amount' => 15,
                'date' => '2020-11-04T18:09:12',
            ],
        ]);
        $this->getDonatorsCount()->shouldBe(2);
        $this->getDonationTotalCount()->shouldBe(30.0);
        $this->getTopDonators(5)->shouldBeLike([
            [
                'email' => 'joueur_francais@capco.com',
                'name' => 'joueur_francais',
                'amount' => 15.0,
                'date' => new \DateTime('2020-11-04T18:09:12'),
            ],
            [
                'email' => 'joueur_belge@capco.com',
                'name' => 'joueur_belge',
                'amount' => 15,
                'date' => new \DateTime('2020-11-04T18:09:12'),
            ],
        ]);
    }

    public function it_should_return_correct_tipsmeee_object_with_computed_data_applepay(): void
    {
        $this->beConstructedWith([
            [
                'email' => 'ApplePay',
                'name' => 'ApplePay',
                'amount' => 1000,
                'date' => '2020-11-04T18:09:12',
            ],
            [
                'email' => 'ApplePay',
                'name' => 'ApplePay',
                'amount' => 500,
                'date' => '2020-11-04T18:09:12',
            ],
            [
                'email' => 'joueur_francais@capco.com',
                'name' => 'joueur_francais',
                'amount' => 1500,
                'date' => '2020-11-04T18:09:12',
            ],
            [
                'email' => 'joueur_belge@capco.com',
                'name' => 'joueur_belge',
                'amount' => 15,
                'date' => '2020-11-04T18:09:12',
            ],
            [
                'email' => 'joueur_suisse@capco.com',
                'name' => 'joueur_suisse',
                'amount' => 2000,
                'date' => '2020-11-04T18:09:12',
            ],
            [
                'email' => 'joueur_belge@capco.com',
                'name' => 'joueur_belge',
                'amount' => 40,
                'date' => '2020-11-04T18:09:12',
            ],
            [
                'email' => 'joueur_portos@capco.com',
                'name' => 'joueur_portos',
                'amount' => 1,
                'date' => '2020-11-04T18:09:12',
            ],
        ]);

        $this->getDonatorsCount()->shouldBe(6);
        $this->getDonationTotalCount()->shouldBe(601.0);
        $this->getTopDonators(1)->shouldBeLike([
            [
                'email' => 'ApplePay',
                'name' => 'ApplePay',
                'amount' => 500,
                'date' => new \DateTime('2020-11-04T18:09:12'),
            ],
        ]);
    }

    public function it_should_format_donation_amount(): void
    {
        $this->beConstructedWith([]);
        $this->formatDonationAmount(1530)->shouldBe(15.3);
        $this->formatDonationAmount(15)->shouldBe(15.0);
        $this->formatDonationAmount(3150)->shouldBe(31.5);
        $this->formatDonationAmount(25620)->shouldBe(256.2);
    }
}
