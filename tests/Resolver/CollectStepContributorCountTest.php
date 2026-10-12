<?php

namespace Capco\Tests\Resolver;

use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\GraphQL\DataLoader\Step\CollectStep\CollectStepContributorCountDataLoader;
use Capco\AppBundle\GraphQL\Resolver\Step\CollectStepContributorCountResolver;
use Capco\AppBundle\Search\UserSearch;
use Capco\UserBundle\Entity\User;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\NullLogger;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Stopwatch\Stopwatch;

/**
 * @internal
 * @coversNothing
 * @phpunit-status compliant
 * @phpunit-reason Exercises the count helper and shared cache with real visibility rules; stubs only Elasticsearch.
 */
class CollectStepContributorCountTest extends KernelTestCase
{
    public function testRestrictedCountsCheckAccessBeforeReadingTheSharedCache(): void
    {
        self::bootKernel();
        $container = self::getContainer();
        $search = $this->createMock(UserSearch::class);
        $search->expects(self::once())->method('getContributorByStep')->willReturn(new ElasticsearchPaginatedResult([], [], 37));
        $adapter = $container->get(PromiseAdapterInterface::class);
        self::assertInstanceOf(PromiseAdapterInterface::class, $adapter);
        $tokenStorage = $container->get('security.token_storage');
        self::assertInstanceOf(TokenStorageInterface::class, $tokenStorage);
        $cache = $container->get(RedisTagCache::class);
        self::assertInstanceOf(RedisTagCache::class, $cache);
        $loader = new CollectStepContributorCountDataLoader(
            $adapter,
            $cache,
            new NullLogger(),
            $search,
            'CollectStepContributorCountTest-' . bin2hex(random_bytes(8)),
            120,
            true,
            new GraphQLCollector(),
            new Stopwatch(),
            true
        );
        $resolver = new CollectStepContributorCountResolver(new NullLogger(), $loader, $tokenStorage, $adapter);
        $project = (new Project())->setVisibility(ProjectVisibilityMode::VISIBILITY_ADMIN);
        $step = (new CollectStep())->setId('restricted-count-test');
        $step->setProjectAbstractStep((new ProjectAbstractStep())->setProject($project)->setStep($step));
        $admin = (new User())->setRoles(['ROLE_ADMIN']);

        try {
            $tokenStorage->setToken(null);
            self::assertSame(0, $adapter->await($resolver($step)));
            $tokenStorage->setToken(new UsernamePasswordToken($admin, 'main', $admin->getRoles()));
            self::assertSame(37, $adapter->await($resolver($step)));
            $loader->clearAll();
            $tokenStorage->setToken(new UsernamePasswordToken(new User(), 'main', ['ROLE_USER']));
            self::assertSame(0, $adapter->await($resolver($step)));
            $tokenStorage->setToken(new UsernamePasswordToken($admin, 'main', $admin->getRoles()));
            self::assertSame(37, $adapter->await($resolver($step)));
            $project->setVisibility(ProjectVisibilityMode::VISIBILITY_PUBLIC);
            $tokenStorage->setToken(null);
            self::assertSame(37, $adapter->await($resolver($step)));
        } finally {
            $loader->invalidateAll();
            $tokenStorage->setToken(null);
        }
    }
}
