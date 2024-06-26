<?php

namespace Capco\Tests\UnitTests;

use Capco\AppBundle\Command\Service\CronTimeInterval;
use PHPUnit\Framework\TestCase;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @internal
 * @coversNothing
 */
class CronTimeIntervalTest extends TestCase
{
    /**
     * @dataProvider cronTriggerMinuteProvider
     */
    public function testGetRemainingCronExecutionTime(
        string $datetime,
        int $cronTriggerMinutes,
        string $expectedTimeRemaining,
        bool $isAfterTrigger
    ): void {
        $translator = $this->createMock(TranslatorInterface::class);

        if ($isAfterTrigger) {
            $translator
                ->expects($this->once())
                ->method('trans')
                ->with('cron_time_remaining_after_trigger')
                ->willReturn('less than a few minutes.')
            ;
        }

        if (!$isAfterTrigger) {
            $translator
                ->expects($this->once())
                ->method('trans')
                ->with('cron_time_remaining')
                ->willReturn($expectedTimeRemaining)
            ;
        }

        $cronTimeInterval = new CronTimeInterval($translator);

        $this->assertEquals($expectedTimeRemaining, $cronTimeInterval->getRemainingCronExecutionTime($cronTriggerMinutes, $datetime));
    }

    /**
     * @return array<int, array<int, bool|int|string>>
     */
    public function cronTriggerMinuteProvider(): array
    {
        return [
            ['14:30', 5, '35 minutes.', false],
            ['00:03', 10, '7 minutes.', false],
            ['18:48', 15, '27 minutes.', false],
            ['04:18', 20, '2 minutes.', false],
            ['12:25', 25, 'less than a few minutes.', true],
            ['17:55', 30, '35 minutes.', false],
            ['19:03', 35, '32 minutes.', false],
            ['16:44', 40, '56 minutes.', false],
        ];
    }
}
