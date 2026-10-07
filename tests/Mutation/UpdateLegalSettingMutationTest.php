<?php

namespace CapcoTests\Mutation;

use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Entity\SiteParameterTranslation;
use Capco\AppBundle\GraphQL\Mutation\LegalSettings\UpdateLegalSettingMutation;
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
class UpdateLegalSettingMutationTest extends TestCase
{
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
        $this->localeRepository->method('getDefaultCode')->willReturn('fr-FR');
        $this->translationRepository = $this->createMock(ObjectRepository::class);
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->entityManager->method('getRepository')->with(SiteParameterTranslation::class)->willReturn($this->translationRepository);
        $this->cacheInvalidator = $this->createMock(UpdateSiteParameterMutation::class);
        $this->toggleManager = $this->createMock(Manager::class);
    }

    public function testSavesEachEditedLocaleAndInvalidatesItsCache(): void
    {
        $parameter = $this->legalParameter();
        $french = (new SiteParameterTranslation())->setTranslatable($parameter)->setLocale('fr-FR')->setValue('Ancien texte');
        $this->repository->method('find')->with('legal-id')->willReturn($parameter);
        $this->toggleManager->method('isActive')->with(Manager::multilangue)->willReturn(true);
        $this->translationRepository->method('findOneBy')->willReturnCallback(
            static fn (array $criteria) => 'fr-FR' === $criteria['locale'] ? $french : null
        );
        $this->entityManager->expects(self::once())->method('persist');
        $this->entityManager->expects(self::once())->method('flush');
        $this->entityManager->expects(self::once())->method('refresh')->with($parameter);
        $this->cacheInvalidator
            ->expects(self::exactly(2))
            ->method('invalidateCache')
            ->withConsecutive([$parameter, 'fr-FR'], [$parameter, 'en-GB'])
        ;

        $payload = $this->invoke([
            'id' => 'legal-id',
            'isEnabled' => true,
            'translations' => [
                ['locale' => 'fr-FR', 'value' => 'Nouveau texte'],
                ['locale' => 'en-GB', 'value' => 'New text'],
            ],
        ]);

        self::assertSame($parameter, $payload['siteParameter']);
        self::assertSame('Nouveau texte', $french->getValue());
    }

    public function testRejectsAParameterOutsideTheLegalCategory(): void
    {
        $parameter = $this->legalParameter()->setCategory('pages.login');
        $this->repository->method('find')->willReturn($parameter);
        $this->entityManager->expects(self::never())->method('flush');

        self::assertSame(
            ['errorCode' => UpdateLegalSettingMutation::LEGAL_PARAMETER_NOT_FOUND],
            $this->invoke(['id' => 'wrong-id', 'isEnabled' => true, 'translations' => []])
        );
    }

    /**
     * @param array<string, mixed> $input
     *
     * @return array{siteParameter?: SiteParameter, errorCode?: string}
     */
    private function invoke(array $input): array
    {
        return (new UpdateLegalSettingMutation(
            $this->repository,
            $this->localeRepository,
            $this->entityManager,
            $this->cacheInvalidator,
            $this->toggleManager
        ))(new Argument(['input' => $input]));
    }

    private function legalParameter(): SiteParameter
    {
        return (new SiteParameter())
            ->setId('legal-id')
            ->setKeyname('legal-mentions')
            ->setCategory('pages.legal')
            ->setType((string) SiteParameter::TYPE_RICH_TEXT)
        ;
    }
}
