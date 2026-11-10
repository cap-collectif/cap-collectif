<?php

namespace Capco\Tests\Elasticsearch;

use Capco\AppBundle\Elasticsearch\IndexableTypesRegistry;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\District\AbstractDistrict;
use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Entity\OpinionVersionVote;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\Persistence\Mapping\ClassMetadataFactory;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Cache\Adapter\FilesystemAdapter;
use Symfony\Component\Filesystem\Filesystem;

/**
 * @internal
 *
 * @coversNothing
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Verifies persistent type-map reuse without Doctrine availability and explicit warmup invalidation, using a disposable filesystem cache.
 */
final class IndexableTypesRegistryTest extends TestCase
{
    private string $cacheDirectory;

    protected function setUp(): void
    {
        $this->cacheDirectory = sys_get_temp_dir() . '/indexable_types_' . bin2hex(random_bytes(8));
    }

    protected function tearDown(): void
    {
        (new Filesystem())->remove($this->cacheDirectory);
    }

    public function testSharedTypesResolveToRootClasses(): void
    {
        $types = $this->registry([Proposal::class, ProposalComment::class, ValueResponse::class, OpinionVersionVote::class, GlobalDistrict::class])->getClasses();

        self::assertSame(Proposal::class, $types['proposal']);
        self::assertSame(Comment::class, $types['comment']);
        self::assertSame(AbstractResponse::class, $types['response']);
        self::assertSame(AbstractVote::class, $types['vote']);
        self::assertSame(AbstractDistrict::class, $types['district']);
    }

    public function testWarmMapCanBeReadByANewInstanceWithoutDoctrine(): void
    {
        $registry = $this->registry([Proposal::class]);
        $registry->warmUp($this->cacheDirectory);
        $expected = $registry->getClasses();
        unset($registry);
        $unavailableDoctrine = $this->createStub(ManagerRegistry::class);
        $unavailableDoctrine->method('getManager')->willThrowException(new \RuntimeException('Doctrine discovery is unavailable.'));
        $reader = new IndexableTypesRegistry($unavailableDoctrine, new FilesystemAdapter('types', 0, $this->cacheDirectory));

        self::assertSame($expected, $reader->getClasses());
    }

    public function testWarmupRebuildsTheMapAfterEntityChanges(): void
    {
        $original = $this->registry([Proposal::class]);
        $original->warmUp($this->cacheDirectory);
        $changed = $this->registry([User::class]);
        self::assertArrayHasKey('proposal', $changed->getClasses());

        $changed->warmUp($this->cacheDirectory);

        self::assertArrayNotHasKey('proposal', $changed->getClasses());
        self::assertSame(User::class, $changed->getClasses()['user']);
        self::assertSame($changed->getClasses(), $this->registry([])->getClasses());
    }

    /**
     * @param list<class-string> $classes
     */
    private function registry(array $classes): IndexableTypesRegistry
    {
        $metadata = array_map(static fn (string $class): ClassMetadata => new ClassMetadata($class), $classes);
        $factory = $this->createStub(ClassMetadataFactory::class);
        $factory->method('getAllMetadata')->willReturn($metadata);
        $manager = $this->createStub(EntityManagerInterface::class);
        $manager->method('getMetadataFactory')->willReturn($factory);
        $doctrine = $this->createStub(ManagerRegistry::class);
        $doctrine->method('getManager')->willReturn($manager);

        return new IndexableTypesRegistry($doctrine, new FilesystemAdapter('types', 0, $this->cacheDirectory));
    }
}
