<?php

namespace Capco\AppBundle\DTO;

class TipsMeee
{
    private array $account;

    public function __construct(array $account)
    {
        $this->account = $account;
    }

    public function getDonationTotalCount(): float
    {
        $donationTotalCount = 0;
        foreach ($this->account as $tips) {
            $donationTotalCount += $this->formatDonationAmount($tips['amount']);
        }

        return $donationTotalCount;
    }

    public function getDonatorsCount(): int
    {
        $donators = [];
        foreach ($this->account as $key => $tips) {
            $donators[] = 'ApplePay' === $tips['email'] ? $tips['email'] . $key : $tips['email'];
        }
        $donators = array_unique($donators);

        return \count($donators);
    }

    public function getDonationCount(): int
    {
        return \count($this->account);
    }

    public function getTopDonators(?int $first): array
    {
        $donators = [];
        $topDonators = [];
        foreach ($this->account as $key => $tips) {
            if (isset($donators[$tips['email']]) && 'ApplePay' !== $tips['email']) {
                $donators[$tips['email']]['amount'] += $this->formatDonationAmount($tips['amount']);
            } elseif ('ApplePay' === $tips['email']) {
                // If the tips was made with ApplePay, we just create different donators.
                $donators[$tips['email'] . $key]['amount'] = $this->formatDonationAmount(
                    $tips['amount']
                );
                $donators[$tips['email'] . $key]['name'] = $tips['name'];
                $donators[$tips['email'] . $key]['date'] = $tips['date'];
            } else {
                $donators[$tips['email']]['amount'] = $this->formatDonationAmount($tips['amount']);
                $donators[$tips['email']]['name'] = $tips['name'];
                $donators[$tips['email']]['date'] = $tips['date'];
            }
        }
        uasort($donators, static function (array $a, array $b) {
            if ($a['amount'] > $b['amount']) {
                return -1;
            }
            if ($a['amount'] < $b['amount']) {
                return 1;
            }

            return 0;
        });
        if (null !== $first && \count($donators) > 5) {
            $donators = \array_slice($donators, 0, $first, true);
        }
        foreach ($donators as $key => $topDonator) {
            // We rewrite the donator email with the simple string 'ApplePay',
            // instead of 'ApplePay1' or 'ApplePay2' etc...
            if (false === strpos($key, 'ApplePay')) {
                $topDonators[] = [
                    'email' => $key,
                    'name' => $topDonator['name'],
                    'amount' => $topDonator['amount'],
                    'date' => new \DateTime($topDonator['date']),
                ];
            } else {
                $topDonators[] = [
                    'email' => 'ApplePay',
                    'name' => $topDonator['name'],
                    'amount' => $topDonator['amount'],
                    'date' => new \DateTime($topDonator['date']),
                ];
            }
        }

        return $topDonators;
    }

    public function formatDonationAmount(int $amount): float
    {
        $stringValue = (string) $amount;
        if (\strlen($stringValue) >= 4) {
            $decimals = substr($stringValue, -2);

            return (float) substr($stringValue, 0, -2) . '.' . $decimals;
        }

        return $amount;
    }
}
