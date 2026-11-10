<?php

namespace Capco\Tests\GraphQL\Resolver;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Questionnaire\QuestionnaireResultsAccessResolver;
use Capco\AppBundle\Repository\Debate\DebateAnonymousArgumentRepository;
use Capco\AppBundle\Repository\DebateArgumentRepository;
use Capco\AppBundle\Repository\GlobalDistrictRepository;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Repository\ProposalDistrictRepository;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\Manager\RepositoryManager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\FilterCollection;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;
use Symfony\Component\DependencyInjection\Container;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * @internal
 *
 * @coversNothing
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Checks public ID resolution rules with real entities and repository stubs, without asserting database persistence or internal call order.
 */
final class GlobalIdResolverTest extends TestCase
{
    private const ID = 'shared-node-id';

    /**
     * @dataProvider multiRepositoryTypes
     *
     * @param class-string<EntityRepository> $primaryRepository
     * @param class-string<EntityRepository> $fallbackRepository
     */
    public function testResolvesThePrimaryNode(string $type, string $primaryRepository, string $fallbackRepository): void
    {
        [$primary] = $this->nodes($type);
        $resolver = $this->resolver([$primaryRepository => $primary, $fallbackRepository => null]);

        self::assertSame($primary, $resolver->resolve(GlobalId::toGlobalId($type, self::ID)));
    }

    /**
     * @dataProvider multiRepositoryTypes
     *
     * @param class-string<EntityRepository> $primaryRepository
     * @param class-string<EntityRepository> $fallbackRepository
     */
    public function testResolvesTheFallbackNodeWhenThePrimaryNodeIsMissing(string $type, string $primaryRepository, string $fallbackRepository): void
    {
        [, $fallback] = $this->nodes($type);
        $resolver = $this->resolver([$primaryRepository => null, $fallbackRepository => $fallback]);

        self::assertSame($fallback, $resolver->resolve(GlobalId::toGlobalId($type, self::ID)));
    }

    /**
     * @dataProvider multiRepositoryTypes
     *
     * @param class-string<EntityRepository> $primaryRepository
     * @param class-string<EntityRepository> $fallbackRepository
     */
    public function testReturnsNullWhenNeitherRepositoryContainsTheNode(string $type, string $primaryRepository, string $fallbackRepository): void
    {
        $resolver = $this->resolver([$primaryRepository => null, $fallbackRepository => null]);

        self::assertNull($resolver->resolve(GlobalId::toGlobalId($type, self::ID)));
    }

    /**
     * @dataProvider multiRepositoryTypes
     *
     * @param class-string<EntityRepository> $primaryRepository
     * @param class-string<EntityRepository> $fallbackRepository
     */
    public function testPrefersThePrimaryNodeWhenBothRepositoriesContainTheSameId(string $type, string $primaryRepository, string $fallbackRepository): void
    {
        [$primary, $fallback] = $this->nodes($type);
        $resolver = $this->resolver([$primaryRepository => $primary, $fallbackRepository => $fallback]);

        self::assertSame($primary, $resolver->resolve(GlobalId::toGlobalId($type, self::ID)));
    }

    /**
     * @dataProvider multiRepositoryTypes
     *
     * @param class-string<EntityRepository> $primaryRepository
     * @param class-string<EntityRepository> $fallbackRepository
     */
    public function testResolvesThePrimaryNodeForItsClass(string $type, string $primaryRepository, string $fallbackRepository): void
    {
        [$primary] = $this->nodes($type);
        $resolver = $this->resolver([$primaryRepository => $primary, $fallbackRepository => null]);

        self::assertSame($primary, $resolver->resolveGlobalIdForClass(['type' => $type, 'id' => self::ID], $primary::class));
    }

    /**
     * @dataProvider multiRepositoryTypes
     *
     * @param class-string<EntityRepository> $primaryRepository
     * @param class-string<EntityRepository> $fallbackRepository
     */
    public function testResolvesTheFallbackNodeForItsClass(string $type, string $primaryRepository, string $fallbackRepository): void
    {
        [, $fallback] = $this->nodes($type);
        $resolver = $this->resolver([$primaryRepository => null, $fallbackRepository => $fallback]);

        self::assertSame($fallback, $resolver->resolveGlobalIdForClass(['type' => $type, 'id' => self::ID], $fallback::class));
    }

    /**
     * @dataProvider multiRepositoryTypes
     *
     * @param class-string<EntityRepository> $primaryRepository
     * @param class-string<EntityRepository> $fallbackRepository
     */
    public function testAcceptsEitherCompatibleClassWhenTheNodeNoLongerExists(string $type, string $primaryRepository, string $fallbackRepository): void
    {
        [$primary, $fallback] = $this->nodes($type);
        $resolver = $this->resolver([$primaryRepository => null, $fallbackRepository => null]);
        $decodedId = ['type' => $type, 'id' => self::ID];

        self::assertNull($resolver->resolveGlobalIdForClass($decodedId, $primary::class));
        self::assertNull($resolver->resolveGlobalIdForClass($decodedId, $fallback::class));
    }

    /**
     * @dataProvider multiRepositoryTypes
     *
     * @param class-string<EntityRepository> $primaryRepository
     * @param class-string<EntityRepository> $fallbackRepository
     */
    public function testRejectsTheFallbackTargetWhenTheGlobalIdResolvesToThePrimaryNode(string $type, string $primaryRepository, string $fallbackRepository): void
    {
        [$primary, $fallback] = $this->nodes($type);
        $resolver = $this->resolver([$primaryRepository => $primary, $fallbackRepository => $fallback]);
        $decodedId = ['type' => $type, 'id' => self::ID];
        $resolver->assertGlobalIdMatchesClass($decodedId, $primary::class);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('does not match');

        $resolver->assertGlobalIdMatchesClass($decodedId, $fallback::class);
    }

    /**
     * @dataProvider multiRepositoryTypes
     *
     * @param class-string<EntityRepository> $primaryRepository
     * @param class-string<EntityRepository> $fallbackRepository
     */
    public function testRejectsAnUnrelatedClassEvenWhenTheNodeNoLongerExists(string $type, string $primaryRepository, string $fallbackRepository): void
    {
        $resolver = $this->resolver([$primaryRepository => null, $fallbackRepository => null]);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('does not match');

        $resolver->assertGlobalIdMatchesClass(['type' => $type, 'id' => self::ID], Proposal::class);
    }

    /**
     * @return iterable<string, array{string, class-string<EntityRepository>, class-string<EntityRepository>}>
     */
    public function multiRepositoryTypes(): iterable
    {
        yield 'contributor: user before participant' => ['Contributor', UserRepository::class, ParticipantRepository::class];

        yield 'district: proposal district before global district' => ['District', ProposalDistrictRepository::class, GlobalDistrictRepository::class];

        yield 'debate argument: registered before anonymous' => ['DebateArgument', DebateArgumentRepository::class, DebateAnonymousArgumentRepository::class];
    }

    public function testRejectsAnUnknownGlobalIdType(): void
    {
        $resolver = $this->resolver([]);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('does not match');

        $resolver->assertGlobalIdMatchesClass(['type' => 'UnknownType', 'id' => self::ID], User::class);
    }

    /**
     * @return array{DebateArgument|ProposalDistrict|User, DebateAnonymousArgument|GlobalDistrict|Participant}
     */
    private function nodes(string $type): array
    {
        $nodes = match ($type) {
            'Contributor' => [new User(), new Participant()],
            'District' => [new ProposalDistrict(), new GlobalDistrict()],
            'DebateArgument' => [new DebateArgument(new Debate()), new DebateAnonymousArgument(new Debate())],
            default => throw new \InvalidArgumentException('Unsupported test type: ' . $type),
        };
        foreach ($nodes as $node) {
            $node->setId(self::ID);
        }

        return $nodes;
    }

    /**
     * @param array<class-string<EntityRepository>, null|object> $nodesByRepository
     */
    private function resolver(array $nodesByRepository): GlobalIdResolver
    {
        $container = new Container();
        $entityClasses = [
            UserRepository::class => User::class,
            ParticipantRepository::class => Participant::class,
            ProposalDistrictRepository::class => ProposalDistrict::class,
            GlobalDistrictRepository::class => GlobalDistrict::class,
            DebateArgumentRepository::class => DebateArgument::class,
            DebateAnonymousArgumentRepository::class => DebateAnonymousArgument::class,
        ];
        $repositoriesByEntity = [];
        foreach ($nodesByRepository as $class => $node) {
            $repository = $this->createStub($class);
            $repository->method('find')->willReturnCallback(static fn ($id): ?object => self::ID === $id ? $node : null);
            $repository->method('getClassName')->willReturn($entityClasses[$class]);
            $container->set($class, $repository);
            $repositoriesByEntity[$entityClasses[$class]] = $repository;
        }
        $filters = $this->createStub(FilterCollection::class);
        $filters->method('isEnabled')->willReturn(false);
        $manager = $this->createStub(EntityManagerInterface::class);
        $manager->method('getFilters')->willReturn($filters);
        $manager->method('getRepository')->willReturnCallback(static fn (string $class): EntityRepository => $repositoriesByEntity[$class]);

        return new GlobalIdResolver(
            $container,
            new NullLogger(),
            $manager,
            new RepositoryManager(),
            new RequestStack(),
            $this->createStub(ParticipantHelper::class),
            $this->createStub(QuestionnaireResultsAccessResolver::class)
        );
    }
}
