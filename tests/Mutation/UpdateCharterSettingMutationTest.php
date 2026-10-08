<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\GraphQL\Mutation\CharterSettings\UpdateCharterSettingMutation;
use Capco\AppBundle\GraphQL\Mutation\UpdateSiteParameterMutation;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Toggle\Manager;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @covers \Capco\AppBundle\GraphQL\Mutation\CharterSettings\UpdateCharterSettingMutation
 */
class UpdateCharterSettingMutationTest extends TestCase
{
    public function testInvalidatesEveryEnabledLocaleWhenOnlyThePublishingStateChanges(): void
    {
        $siteParameter = (new SiteParameter())
            ->setCategory(UpdateCharterSettingMutation::CATEGORY)
            ->setIsEnabled(true)
        ;

        $repository = $this->createMock(SiteParameterRepository::class);
        $repository->expects($this->once())->method('find')->with('charter-setting-id')->willReturn($siteParameter);

        $localeRepository = $this->createMock(LocaleRepository::class);
        $localeRepository->expects($this->once())->method('findEnabledLocalesCodes')->willReturn(['EN_GB', 'FR_FR']);

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects($this->once())->method('flush');
        $entityManager->expects($this->once())->method('refresh')->with($siteParameter);

        $cacheInvalidator = $this->createMock(UpdateSiteParameterMutation::class);
        $cacheInvalidator
            ->expects($this->exactly(2))
            ->method('invalidateCache')
            ->withConsecutive([$siteParameter, 'EN_GB'], [$siteParameter, 'FR_FR'])
        ;

        $mutation = new UpdateCharterSettingMutation(
            $repository,
            $localeRepository,
            $entityManager,
            $cacheInvalidator,
            $this->createMock(Manager::class)
        );

        $payload = $mutation(new Argument(['input' => [
            'id' => 'charter-setting-id',
            'isEnabled' => false,
            'translations' => [],
        ]]));

        self::assertSame($siteParameter, $payload['siteParameter']);
        self::assertFalse($siteParameter->getIsEnabled());
    }
}
