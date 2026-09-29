<?php

namespace CapcoTests\Mutation;

use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Entity\SiteParameterTranslation;
use Capco\AppBundle\GraphQL\Mutation\CookieSettings\UpdateCookieSettingMutation;
use Capco\AppBundle\GraphQL\Mutation\UpdateSiteParameterMutation;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Toggle\Manager;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ObjectRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @coversNothing
 */
class UpdateCookieSettingMutationTest extends TestCase
{
    private const DEFAULT_LOCALE = 'fr-FR';

    private SiteParameterRepository & MockObject $repository;
    private LocaleRepository & MockObject $localeRepository;
    private EntityManagerInterface & MockObject $entityManager;
    private ObjectRepository & MockObject $translationRepository;
    private UpdateSiteParameterMutation & MockObject $cacheInvalidator;
    private Manager & MockObject $toggleManager;

    protected function setUp(): void
    {
        $this->repository = $this->createMock(SiteParameterRepository::class);
        $this->localeRepository = $this->createMock(LocaleRepository::class);
        $this->localeRepository->method('getDefaultCode')->willReturn(self::DEFAULT_LOCALE);
        $this->translationRepository = $this->createMock(ObjectRepository::class);
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->entityManager
            ->method('getRepository')
            ->with(SiteParameterTranslation::class)
            ->willReturn($this->translationRepository)
        ;
        $this->cacheInvalidator = $this->createMock(UpdateSiteParameterMutation::class);
        $this->toggleManager = $this->createMock(Manager::class);
    }

    public function testSavesEveryReceivedLocaleAtOnceWhenMultilangueIsActive(): void
    {
        $siteParameter = $this->createSiteParameter('cookies-list');
        $frenchTranslation = $this->createTranslation($siteParameter, 'fr-FR', 'Ancienne liste');
        $this->repository->method('find')->with('cookie-list')->willReturn($siteParameter);
        $this->toggleManager->method('isActive')->with(Manager::multilangue)->willReturn(true);
        $this->translationRepository
            ->method('findOneBy')
            ->willReturnCallback(static fn (array $criteria) => 'fr-FR' === $criteria['locale'] ? $frenchTranslation : null)
        ;

        $this->entityManager
            ->expects(self::once())
            ->method('persist')
            ->with(self::callback(
                static fn (SiteParameterTranslation $translation) => 'en-GB' === $translation->getLocale()
                    && 'New cookie list' === $translation->getValue()
                    && $translation->getTranslatable() === $siteParameter
            ))
        ;
        $this->entityManager->expects(self::never())->method('remove');
        $this->entityManager->expects(self::once())->method('flush');
        $this->entityManager->expects(self::once())->method('refresh')->with($siteParameter);
        $this->cacheInvalidator
            ->expects(self::exactly(2))
            ->method('invalidateCache')
            ->withConsecutive([$siteParameter, 'fr-FR'], [$siteParameter, 'en-GB'])
        ;

        $payload = $this->invoke([
            'id' => 'cookie-list',
            'translations' => [
                ['locale' => 'fr-FR', 'value' => 'Nouvelle liste'],
                ['locale' => 'en-GB', 'value' => 'New cookie list'],
            ],
            'isEnabled' => true,
        ]);

        self::assertSame($siteParameter, $payload['siteParameter']);
        self::assertSame('Nouvelle liste', $frenchTranslation->getValue());
        self::assertTrue($siteParameter->getIsEnabled());
    }

    public function testStoresTheValueUnderTheDefaultLocaleWhenMultilangueIsInactive(): void
    {
        $siteParameter = $this->createSiteParameter('cookies-list');
        $frenchTranslation = $this->createTranslation($siteParameter, 'fr-FR', 'Ancienne liste');
        $this->repository->method('find')->willReturn($siteParameter);
        $this->toggleManager->method('isActive')->with(Manager::multilangue)->willReturn(false);
        $this->translationRepository
            ->expects(self::once())
            ->method('findOneBy')
            ->with(['translatable' => $siteParameter, 'locale' => self::DEFAULT_LOCALE])
            ->willReturn($frenchTranslation)
        ;

        $this->entityManager->expects(self::never())->method('persist');
        $this->entityManager->expects(self::once())->method('flush');
        $this->cacheInvalidator
            ->expects(self::once())
            ->method('invalidateCache')
            ->with($siteParameter, self::DEFAULT_LOCALE)
        ;

        // The admin browses in English, but without multilangue only the default locale exists.
        $this->invoke([
            'id' => 'cookie-list',
            'translations' => [['locale' => 'en-GB', 'value' => 'Single cookie list']],
            'isEnabled' => true,
        ]);

        self::assertSame('Single cookie list', $frenchTranslation->getValue());
    }

    public function testAnEmptiedValueRemovesTheTranslationOfThatLocale(): void
    {
        $siteParameter = $this->createSiteParameter('cookies-list');
        $englishTranslation = $this->createTranslation($siteParameter, 'en-GB', 'Old cookie list');
        $this->repository->method('find')->willReturn($siteParameter);
        $this->toggleManager->method('isActive')->willReturn(true);
        $this->translationRepository->method('findOneBy')->willReturn($englishTranslation);

        $this->entityManager->expects(self::once())->method('remove')->with($englishTranslation);
        $this->entityManager->expects(self::never())->method('persist');
        $this->entityManager->expects(self::once())->method('flush');
        $this->cacheInvalidator->expects(self::once())->method('invalidateCache')->with($siteParameter, 'en-GB');

        $this->invoke([
            'id' => 'cookie-list',
            'translations' => [['locale' => 'en-GB', 'value' => '   ']],
            'isEnabled' => true,
        ]);
    }

    public function testRejectsASocialNetworkDescriptionLongerThan160CharactersInAnyLocale(): void
    {
        $siteParameter = $this->createSiteParameter('cookies-list')->setIsSocialNetworkDescription(true);
        $this->repository->method('find')->willReturn($siteParameter);
        $this->toggleManager->method('isActive')->willReturn(true);

        $this->translationRepository->expects(self::never())->method('findOneBy');
        $this->entityManager->expects(self::never())->method('flush');
        $this->cacheInvalidator->expects(self::never())->method('invalidateCache');

        $payload = $this->invoke([
            'id' => 'cookie-list',
            'translations' => [
                ['locale' => 'fr-FR', 'value' => 'Liste courte'],
                ['locale' => 'en-GB', 'value' => str_repeat('a', 161)],
            ],
            'isEnabled' => true,
        ]);

        self::assertSame(['errorCode' => UpdateCookieSettingMutation::INVALID_VALUE], $payload);
    }

    public function testSavesIsEnabledAloneWhenNoValueChanged(): void
    {
        $siteParameter = $this->createSiteParameter('cookies-list');
        $this->repository->method('find')->willReturn($siteParameter);

        $this->toggleManager->expects(self::never())->method('isActive');
        $this->localeRepository->expects(self::never())->method('getDefaultCode');
        $this->translationRepository->expects(self::never())->method('findOneBy');
        $this->entityManager->expects(self::once())->method('flush');
        $this->entityManager->expects(self::once())->method('refresh')->with($siteParameter);
        // The Doctrine SiteParameterCacheSubscriber invalidates every published locale on postFlush.
        $this->cacheInvalidator->expects(self::never())->method('invalidateCache');

        $payload = $this->invoke(['id' => 'cookie-list', 'translations' => [], 'isEnabled' => false]);

        self::assertSame($siteParameter, $payload['siteParameter']);
        self::assertFalse($siteParameter->getIsEnabled());
    }

    public function testRejectsASettingOfAnotherCategory(): void
    {
        $siteParameter = $this->createSiteParameter('login.text.top')->setCategory('pages.login');
        $this->repository->method('find')->willReturn($siteParameter);

        $this->entityManager->expects(self::never())->method('flush');

        $payload = $this->invoke(['id' => 'login-title', 'translations' => [], 'isEnabled' => true]);

        self::assertSame(['errorCode' => UpdateCookieSettingMutation::COOKIE_PARAMETER_NOT_FOUND], $payload);
    }

    /**
     * @param array<string, mixed> $input
     *
     * @return array{siteParameter?: SiteParameter, errorCode?: string}
     */
    private function invoke(array $input): array
    {
        $mutation = new UpdateCookieSettingMutation(
            $this->repository,
            $this->localeRepository,
            $this->entityManager,
            $this->cacheInvalidator,
            $this->toggleManager
        );

        return $mutation(new Argument(['input' => $input]));
    }

    private function createSiteParameter(string $keyname): SiteParameter
    {
        return (new SiteParameter())
            ->setId('cookie-' . $keyname)
            ->setKeyname($keyname)
            ->setCategory('pages.cookies')
            ->setType((string) SiteParameter::TYPE_RICH_TEXT)
        ;
    }

    private function createTranslation(
        SiteParameter $siteParameter,
        string $locale,
        string $value
    ): SiteParameterTranslation {
        $translation = (new SiteParameterTranslation())
            ->setTranslatable($siteParameter)
            ->setLocale($locale)
            ->setValue($value)
        ;
        $siteParameter->addTranslation($translation);

        return $translation;
    }
}
