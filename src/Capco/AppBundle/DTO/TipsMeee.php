<?php

namespace Capco\AppBundle\DTO;

class TipsMeee
{
    public const NOT_PROVIDED = 'NOT_PROVIDED';
    public const NOT_FOR_SHARE = 'NOT_FOR_SHARE';
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
            $donators[] =
                self::NOT_PROVIDED === $tips['email'] || self::NOT_FOR_SHARE === $tips['email']
                    ? $key . '-' . $tips['email']
                    : $tips['email'];
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
            if (
                isset($donators[$tips['email']]) &&
                self::NOT_PROVIDED !== $tips['email'] &&
                self::NOT_FOR_SHARE !== $tips['email']
            ) {
                $donators[$tips['email']]['amount'] += $this->formatDonationAmount($tips['amount']);
            } elseif (
                self::NOT_PROVIDED === $tips['email'] ||
                self::NOT_FOR_SHARE === $tips['email']
            ) {
                // If the tips was made with ApplePay or is anonymous, we just create different donators.
                $donators[$key . '-' . $tips['email']] = [
                    'amount' => $this->formatDonationAmount($tips['amount']),
                    'name' => $tips['name'],
                    'date' => $tips['date'],
                ];
            } else {
                $donators[$tips['email']] = [
                    'amount' => $this->formatDonationAmount($tips['amount']),
                    'name' => $tips['name'],
                    'date' => $tips['date'],
                ];
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
            // We rewrite the donator email with the simple string 'NOT_PROVIDED',
            // instead of '1-NOT_PROVIDED' or '2-NOT_PROVIDED' etc...
            if (
                false === strpos($key, self::NOT_PROVIDED) &&
                false === strpos($key, self::NOT_FOR_SHARE)
            ) {
                $topDonators[] = [
                    'email' => $key,
                    'name' => $topDonator['name'],
                    'amount' => $topDonator['amount'],
                    'date' => new \DateTime($topDonator['date']),
                ];
            } else {
                $topDonators[] = [
                    'email' => explode('-', $key)[1],
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
        // The donation amout will never exceed 10.
        $stringValue = (string) $amount;
        if (\strlen($stringValue) >= 3) {
            $decimals = substr($stringValue, -2);

            return (float) substr($stringValue, 0, -2) . '.' . $decimals;
        }

        return $amount;
    }
}
