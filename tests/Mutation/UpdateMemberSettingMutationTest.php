<?php

namespace CapcoTests\Mutation;

use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Entity\SiteParameterTranslation;
use Capco\AppBundle\GraphQL\Mutation\MemberSettings\UpdateMemberSettingMutation;
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
class UpdateMemberSettingMutationTest extends TestCase
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
        $siteParameter = $this->createSiteParameter('members.jumbotron.title');
        $frenchTranslation = $this->createTranslation($siteParameter, 'fr-FR', 'Ancien titre');
        $this->repository->method('find')->with('member-title')->willReturn($siteParameter);
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
                    && 'New title' === $translation->getValue()
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
            'id' => 'member-title',
            'translations' => [
                ['locale' => 'fr-FR', 'value' => 'Nouveau titre'],
                ['locale' => 'en-GB', 'value' => 'New title'],
            ],
            'isEnabled' => true,
        ]);

        self::assertSame($siteParameter, $payload['siteParameter']);
        self::assertSame('Nouveau titre', $frenchTranslation->getValue());
        self::assertTrue($siteParameter->getIsEnabled());
    }

    public function testStoresTheValueUnderTheDefaultLocaleWhenMultilangueIsInactive(): void
    {
        $siteParameter = $this->createSiteParameter('members.jumbotron.title');
        $frenchTranslation = $this->createTranslation($siteParameter, 'fr-FR', 'Ancien titre');
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
            'id' => 'member-title',
            'translations' => [['locale' => 'en-GB', 'value' => 'Titre unique']],
            'isEnabled' => true,
        ]);

        self::assertSame('Titre unique', $frenchTranslation->getValue());
    }

    public function testStoresANonTranslatableSettingInItsValueColumn(): void
    {
        $siteParameter = $this->createSiteParameter('members.customcode');
        $this->repository->method('find')->willReturn($siteParameter);

        $this->toggleManager->expects(self::never())->method('isActive');
        $this->translationRepository->expects(self::never())->method('findOneBy');
        $this->entityManager->expects(self::once())->method('flush');
        $this->cacheInvalidator
            ->expects(self::once())
            ->method('invalidateCache')
            ->with($siteParameter, self::DEFAULT_LOCALE)
        ;

        $this->invoke([
            'id' => 'member-customcode',
            'translations' => [['locale' => 'en-GB', 'value' => '<script></script>']],
            'isEnabled' => false,
        ]);

        self::assertSame('<script></script>', $siteParameter->getValue());
        self::assertFalse($siteParameter->getIsEnabled());
    }

    public function testAnEmptiedValueRemovesTheTranslationOfThatLocale(): void
    {
        $siteParameter = $this->createSiteParameter('members.jumbotron.title');
        $englishTranslation = $this->createTranslation($siteParameter, 'en-GB', 'Old title');
        $this->repository->method('find')->willReturn($siteParameter);
        $this->toggleManager->method('isActive')->willReturn(true);
        $this->translationRepository->method('findOneBy')->willReturn($englishTranslation);

        $this->entityManager->expects(self::once())->method('remove')->with($englishTranslation);
        $this->entityManager->expects(self::never())->method('persist');
        $this->entityManager->expects(self::once())->method('flush');
        $this->cacheInvalidator->expects(self::once())->method('invalidateCache')->with($siteParameter, 'en-GB');

        $this->invoke([
            'id' => 'member-title',
            'translations' => [['locale' => 'en-GB', 'value' => '   ']],
            'isEnabled' => true,
        ]);
    }

    public function testRejectsASocialNetworkDescriptionLongerThan160CharactersInAnyLocale(): void
    {
        $siteParameter = $this->createSiteParameter('members.metadescription')->setIsSocialNetworkDescription(true);
        $this->repository->method('find')->willReturn($siteParameter);
        $this->toggleManager->method('isActive')->willReturn(true);

        $this->translationRepository->expects(self::never())->method('findOneBy');
        $this->entityManager->expects(self::never())->method('flush');
        $this->cacheInvalidator->expects(self::never())->method('invalidateCache');

        $payload = $this->invoke([
            'id' => 'member-metadescription',
            'translations' => [
                ['locale' => 'fr-FR', 'value' => 'Description courte'],
                ['locale' => 'en-GB', 'value' => str_repeat('a', 161)],
            ],
            'isEnabled' => true,
        ]);

        self::assertSame(['errorCode' => UpdateMemberSettingMutation::INVALID_VALUE], $payload);
    }

    public function testSavesIsEnabledAloneWhenNoValueChanged(): void
    {
        $siteParameter = $this->createSiteParameter('members.jumbotron.title');
        $this->repository->method('find')->willReturn($siteParameter);

        $this->toggleManager->expects(self::never())->method('isActive');
        $this->localeRepository->expects(self::never())->method('getDefaultCode');
        $this->translationRepository->expects(self::never())->method('findOneBy');
        $this->entityManager->expects(self::once())->method('flush');
        $this->entityManager->expects(self::once())->method('refresh')->with($siteParameter);
        // The Doctrine SiteParameterCacheSubscriber invalidates every published locale on postFlush.
        $this->cacheInvalidator->expects(self::never())->method('invalidateCache');

        $payload = $this->invoke(['id' => 'member-title', 'translations' => [], 'isEnabled' => false]);

        self::assertSame($siteParameter, $payload['siteParameter']);
        self::assertFalse($siteParameter->getIsEnabled());
    }

    public function testRejectsASettingOfAnotherCategory(): void
    {
        $siteParameter = $this->createSiteParameter('events.jumbotron.title')->setCategory('pages.events');
        $this->repository->method('find')->willReturn($siteParameter);

        $this->entityManager->expects(self::never())->method('flush');

        $payload = $this->invoke(['id' => 'event-title', 'translations' => [], 'isEnabled' => true]);

        self::assertSame(['errorCode' => UpdateMemberSettingMutation::MEMBER_PARAMETER_NOT_FOUND], $payload);
    }

    /**
     * @param array<string, mixed> $input
     *
     * @return array{siteParameter?: SiteParameter, errorCode?: string}
     */
    private function invoke(array $input): array
    {
        $mutation = new UpdateMemberSettingMutation(
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
            ->setId('member-' . $keyname)
            ->setKeyname($keyname)
            ->setCategory('pages.members')
            ->setType((string) SiteParameter::TYPE_SIMPLE_TEXT)
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
