<?php

namespace Capco\Tests\Elasticsearch;

use Capco\AppBundle\Elasticsearch\IndexationProcessor;
use Capco\AppBundle\Elasticsearch\Indexer;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;

/**
 * @internal
 * @coversNothing
 */
class IndexationProcessorTest extends TestCase
{
    /**
     * @dataProvider validMessages
     */
    public function testIndexesMessage(string $class, string $id): void
    {
        $indexer = $this->createMock(Indexer::class);
        $indexer->expects(self::once())->method('index')->with($class, $id);
        $indexer->expects(self::once())->method('finishBulk');

        $processor = new IndexationProcessor($indexer, $this->createStub(LoggerInterface::class));

        self::assertTrue(
            $processor->process(new Message(json_encode(compact('class', 'id'), \JSON_THROW_ON_ERROR)), [])
        );
    }

    public static function validMessages(): \Generator
    {
        yield 'proposal' => [\Capco\AppBundle\Entity\Proposal::class, 'proposal1'];
        yield 'opinion' => [\Capco\AppBundle\Entity\Opinion::class, 'opinion1'];
    }
}
