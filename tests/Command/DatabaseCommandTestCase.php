<?php

namespace Capco\Tests\Command;

use Capco\AppBundle\Elasticsearch\ElasticsearchDoctrineListener;
use Capco\AppBundle\Elasticsearch\Indexer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Console\Tester\CommandTester;
use Symfony\Component\Filesystem\Filesystem;

abstract class DatabaseCommandTestCase extends KernelTestCase
{
    protected EntityManagerInterface $entityManager;
    private string $temporaryDirectory;

    protected function setUp(): void
    {
        self::bootKernel();

        $entityManager = self::getContainer()->get('doctrine')->getManager();
        \assert($entityManager instanceof EntityManagerInterface);
        $this->entityManager = $entityManager;
        $this->entityManager->getConnection()->beginTransaction();

        $elasticsearchListener = self::getContainer()->get(ElasticsearchDoctrineListener::class);
        \assert($elasticsearchListener instanceof ElasticsearchDoctrineListener);
        $this->entityManager
            ->getEventManager()
            ->removeEventListener(
                $elasticsearchListener->getSubscribedEvents(),
                $elasticsearchListener
            )
        ;
        self::getContainer()->set(Indexer::class, $this->createMock(Indexer::class));

        $this->temporaryDirectory =
            sys_get_temp_dir() . '/capco-command-tests-' . bin2hex(random_bytes(8));
        (new Filesystem())->mkdir($this->temporaryDirectory);
    }

    protected function tearDown(): void
    {
        $connection = $this->entityManager->getConnection();
        if ($connection->isTransactionActive()) {
            $connection->rollBack();
        }
        $this->entityManager->clear();

        (new Filesystem())->remove($this->temporaryDirectory);

        parent::tearDown();
    }

    protected function createCommandTester(string $commandName): CommandTester
    {
        $application = new Application(self::$kernel);

        return new CommandTester($application->find($commandName));
    }

    protected function writeTemporaryFile(string $filename, string $contents): string
    {
        $path = $this->temporaryDirectory . '/' . $filename;
        file_put_contents($path, $contents);

        return $path;
    }

    protected function temporaryFilePath(string $filename): string
    {
        return $this->temporaryDirectory . '/' . $filename;
    }
}
