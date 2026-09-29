<?php

namespace Capco\Tests\Service;

use Capco\AppBundle\Entity\CustomCodeVersion;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Entity\SiteParameterTranslation;
use Capco\AppBundle\GraphQL\Mutation\UpdateSiteParameterMutation;
use Capco\AppBundle\Repository\CustomCodeVersionRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Service\CustomCodeVersioningService;
use Doctrine\DBAL\Logging\SQLLogger;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Validator\Validation;

/**
 * @internal
 * @coversNothing
 */
class CustomCodeVersioningServiceTest extends KernelTestCase
{
    private EntityManagerInterface $entityManager;
    private string $databaseName;
    private string $versionId;

    protected function setUp(): void
    {
        self::bootKernel();
        $original = self::getContainer()->get('doctrine')->getManager();
        $this->databaseName = 'custom_code_test_' . bin2hex(random_bytes(6));
        $original->getConnection()->getSchemaManager()->createDatabase($this->databaseName);
        $params = $original->getConnection()->getParams();
        unset($params['url']);
        $params['dbname'] = $this->databaseName;
        $this->entityManager = EntityManager::create($params, $original->getConfiguration(), $original->getEventManager());

        // Use an isolated MySQL schema so concurrent commits cannot touch application data.
        (new SchemaTool($this->entityManager))->createSchema(array_map(
            fn (string $class) => $this->entityManager->getClassMetadata($class),
            [SiteParameter::class, SiteParameterTranslation::class, CustomCodeVersion::class]
        ));
        $parameter = (new SiteParameter())->setKeyname('contact.customcode')->setValue(null);
        $version = (new CustomCodeVersion())
            ->setKeyname('contact.customcode')
            ->setTitle('Initial version')
            ->setAuthorName('Test')
            ->setContent('<script>initial</script>')
            ->setContentHash(CustomCodeVersioningService::hashContent('<script>initial</script>'))
            ->setType(CustomCodeVersion::TYPE_INITIAL)
        ;
        $this->entityManager->persist($parameter);
        $this->entityManager->persist($version);
        $this->entityManager->flush();
        $this->versionId = $version->getId();
        $this->entityManager->clear();
    }

    protected function tearDown(): void
    {
        if (isset($this->entityManager)) {
            $this->entityManager->getConnection()->close();
        }
        if (isset($this->databaseName)) {
            self::getContainer()->get('doctrine')->getConnection()->getSchemaManager()->dropDatabase($this->databaseName);
        }

        parent::tearDown();
    }

    /**
     * @dataProvider operations
     * @requires extension pcntl
     * @requires extension posix
     */
    public function testConcurrentWritesRejectAStalePreloadedParameter(string $operation): void
    {
        $sockets = stream_socket_pair(\STREAM_PF_UNIX, \STREAM_SOCK_STREAM, \STREAM_IPPROTO_IP);
        self::assertNotFalse($sockets);
        foreach ($sockets as $socket) {
            stream_set_timeout($socket, 15);
        }

        // No PDO socket may be shared across fork: each process reconnects independently.
        $this->entityManager->getConnection()->close();
        self::getContainer()->get('doctrine')->getConnection()->close();
        $pid = pcntl_fork();
        self::assertNotSame(-1, $pid);
        if (0 === $pid) {
            fclose($sockets[0]);
            $socket = $sockets[1];

            try {
                $this->entityManager->getRepository(SiteParameter::class)->findOneBy(['keyname' => 'contact.customcode']);
                fwrite($socket, "preloaded\n");
                if ("write\n" !== fgets($socket)) {
                    throw new \RuntimeException('Timed out waiting for the first writer.');
                }

                $this->entityManager->getConnection()->getConfiguration()->setSQLLogger(new class($socket) implements SQLLogger {
                    private bool $signaled = false;

                    /** @param resource $socket */
                    public function __construct(private $socket)
                    {
                    }

                    public function startQuery($sql, ?array $params = null, ?array $types = null): void
                    {
                        // The INSERT branch also makes the test reproduce the original unlocked implementation.
                        if (!$this->signaled && (str_contains($sql, 'FOR UPDATE') || str_starts_with($sql, 'INSERT INTO custom_code_version'))) {
                            fwrite($this->socket, "writing\n");
                            $this->signaled = true;
                        }
                    }

                    public function stopQuery(): void
                    {
                    }
                });
                $this->writeVersion($this->service(false), $operation, null, '<script>concurrent</script>');
                fwrite($socket, "SUCCESS\n");
            } catch (UserError $error) {
                fwrite($socket, $error->getMessage() . "\n");
            } catch (\Throwable $error) {
                fwrite($socket, $error::class . ': ' . $error->getMessage() . "\n");
            }
            fclose($socket);
            $this->entityManager->getConnection()->close();

            exit(0);
        }

        fclose($sockets[1]);
        $connection = $this->entityManager->getConnection();

        try {
            self::assertSame("preloaded\n", fgets($sockets[0]));
            // Hold the first service call's transaction open until the second writer reaches SQL.
            $connection->beginTransaction();
            $first = $this->writeVersion($this->service(true), 'commit');
            fwrite($sockets[0], "write\n");
            self::assertSame("writing\n", fgets($sockets[0]));
            $connection->commit();
            self::assertSame("CONFLICT\n", fgets($sockets[0]));
            pcntl_waitpid($pid, $status);
            self::assertSame(0, pcntl_wexitstatus($status));
            $pid = 0;

            self::assertSame(2, (int) $connection->fetchOne('SELECT COUNT(*) FROM custom_code_version'));
            self::assertSame('<script>committed</script>', $connection->fetchOne('SELECT value FROM site_parameter'));
            self::assertSame(CustomCodeVersioningService::hashContent(null), $first->getPreviousContentHash());
        } finally {
            if ($connection->isTransactionActive()) {
                $connection->rollBack();
            }
            if ($pid > 0) {
                posix_kill($pid, \SIGKILL);
                pcntl_waitpid($pid, $status);
            }
            fclose($sockets[0]);
        }
    }

    /**
     * @dataProvider operations
     */
    public function testReferenceUrlLengthIsCheckedBeforeWriting(string $operation): void
    {
        $url = str_pad('https://example.com/', 2048, 'a');

        try {
            $this->writeVersion($this->service(false), $operation, $url . 'a');
            self::fail('An oversized URL must be rejected.');
        } catch (UserError $error) {
            self::assertSame(CustomCodeVersioningService::INVALID_REFERENCE_URL, $error->getMessage());
        }

        self::assertSame(1, $this->entityManager->getRepository(CustomCodeVersion::class)->count([]));
        $version = $this->writeVersion($this->service(true), $operation, '  ' . $url . '  ');
        self::assertSame($url, $version->getReferenceUrl());
    }

    public function testAConflictLeavesTheEntityManagerUsable(): void
    {
        $first = $this->writeVersion($this->service(true), 'commit');

        try {
            $this->writeVersion($this->service(false), 'commit', null, '<script>concurrent</script>');
            self::fail('A stale hash must be rejected.');
        } catch (UserError $error) {
            self::assertSame(CustomCodeVersioningService::CONFLICT, $error->getMessage());
        }

        self::assertTrue($this->entityManager->isOpen());
        self::assertFalse($this->entityManager->getConnection()->isTransactionActive());
        $next = $this->service(true)->commit('contact.customcode', '<script>next</script>', 'Next', 'Test', null, null, $first->getContentHash());
        self::assertSame($first->getContentHash(), $next->getPreviousContentHash());
    }

    public static function operations(): \Generator
    {
        yield 'commit' => ['commit'];
        yield 'restore' => ['restore'];
    }

    private function service(bool $writes): CustomCodeVersioningService
    {
        $cache = $this->createMock(UpdateSiteParameterMutation::class);
        $transactionDepth = $this->entityManager->getConnection()->getTransactionNestingLevel();
        $cache->expects($writes ? $this->once() : $this->never())->method('invalidateCache')
            ->willReturnCallback(function () use ($transactionDepth): void {
                self::assertSame($transactionDepth, $this->entityManager->getConnection()->getTransactionNestingLevel());
            })
        ;

        return new CustomCodeVersioningService(
            $this->entityManager,
            new CustomCodeVersionRepository($this->entityManager, $this->entityManager->getClassMetadata(CustomCodeVersion::class)),
            new SiteParameterRepository($this->entityManager, $this->entityManager->getClassMetadata(SiteParameter::class)),
            $cache,
            Validation::createValidator()
        );
    }

    private function writeVersion(
        CustomCodeVersioningService $service,
        string $operation,
        ?string $url = null,
        string $content = '<script>committed</script>'
    ): CustomCodeVersion {
        if ('restore' === $operation) {
            return $service->restore($this->versionId, 'Restore', 'Test', null, $url, CustomCodeVersioningService::hashContent(null));
        }

        return $service->commit('contact.customcode', $content, 'Commit', 'Test', null, $url, CustomCodeVersioningService::hashContent(null));
    }
}
