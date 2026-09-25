<?php

namespace CapcoTests\Mutation;

use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Entity\SiteParameterTranslation;
use Capco\AppBundle\GraphQL\Mutation\ProjectSettings\UpdateProjectSettingMutation;
use Capco\AppBundle\GraphQL\Mutation\UpdateSiteParameterMutation;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ObjectRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Validator\ConstraintViolationInterface;
use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * @internal
 * @coversNothing
 */
class UpdateProjectSettingMutationTest extends TestCase
{
    public function testValidatesTheEditedLocaleWhenTranslationsWerePartiallyLoaded(): void
    {
        $siteParameter = $this->createSiteParameter();
        $siteParameter->addTranslation($this->createTranslation($siteParameter, 'fr-FR', 'Description française'));

        $englishTranslation = $this->createTranslation($siteParameter, 'en-GB', 'Old English description');
        $translationRepository = $this->createMock(ObjectRepository::class);
        $translationRepository
            ->expects(self::once())
            ->method('findBy')
            ->with(['translatable' => $siteParameter])
            ->willReturn([$englishTranslation])
        ;

        $repository = $this->createMock(SiteParameterRepository::class);
        $repository->method('find')->with('project-meta-description')->willReturn($siteParameter);

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->method('getRepository')->with(SiteParameterTranslation::class)->willReturn($translationRepository);
        $entityManager->expects(self::never())->method('flush');

        $validator = $this->createMock(ValidatorInterface::class);
        $violation = $this->createStub(ConstraintViolationInterface::class);
        $validator
            ->expects(self::once())
            ->method('validate')
            ->with($siteParameter)
            ->willReturnCallback(static function (SiteParameter $parameter) use ($violation): ConstraintViolationList {
                self::assertSame(str_repeat('a', 161), $parameter->getValue());
                self::assertCount(2, $parameter->getTranslations());

                return new ConstraintViolationList([$violation]);
            })
        ;

        $cacheInvalidator = $this->createMock(UpdateSiteParameterMutation::class);
        $cacheInvalidator->expects(self::never())->method('invalidateCache');

        $mutation = new UpdateProjectSettingMutation($repository, $entityManager, $cacheInvalidator, $validator);
        $payload = $mutation(new Argument(['input' => [
            'id' => 'project-meta-description',
            'value' => str_repeat('a', 161),
            'locale' => 'en-GB',
            'isEnabled' => true,
        ]]));

        self::assertSame(['errorCode' => UpdateProjectSettingMutation::INVALID_VALUE], $payload);
    }

    public function testReturnsAllTranslationsAndInvalidatesTheEditedLocale(): void
    {
        $siteParameter = $this->createSiteParameter();
        $frenchTranslation = $this->createTranslation($siteParameter, 'fr-FR', 'Description française');
        $siteParameter->addTranslation($frenchTranslation);

        $englishTranslation = $this->createTranslation($siteParameter, 'en-GB', 'Old English description');
        $translationRepository = $this->createMock(ObjectRepository::class);
        $translationRepository->method('findBy')->willReturn([$frenchTranslation, $englishTranslation]);

        $repository = $this->createMock(SiteParameterRepository::class);
        $repository->method('find')->willReturn($siteParameter);

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->method('getRepository')->willReturn($translationRepository);
        $entityManager->expects(self::once())->method('flush');

        $validator = $this->createMock(ValidatorInterface::class);
        $validator->method('validate')->willReturn(new ConstraintViolationList());

        $cacheInvalidator = $this->createMock(UpdateSiteParameterMutation::class);
        $cacheInvalidator
            ->expects(self::once())
            ->method('invalidateCache')
            ->with($siteParameter, 'en-GB')
        ;

        $mutation = new UpdateProjectSettingMutation($repository, $entityManager, $cacheInvalidator, $validator);
        $payload = $mutation(new Argument(['input' => [
            'id' => 'project-meta-description',
            'value' => 'New English description',
            'locale' => 'en-GB',
            'isEnabled' => true,
        ]]));

        self::assertSame($siteParameter, $payload['siteParameter']);
        self::assertSame('New English description', $siteParameter->getValue());
        self::assertCount(2, $siteParameter->getTranslations());
    }

    private function createSiteParameter(): SiteParameter
    {
        return (new SiteParameter())
            ->setId('project-meta-description')
            ->setKeyname('projects.metadescription')
            ->setCategory('pages.projects')
            ->setType((string) SiteParameter::TYPE_SIMPLE_TEXT)
            ->setIsSocialNetworkDescription(true)
        ;
    }

    private function createTranslation(
        SiteParameter $siteParameter,
        string $locale,
        string $value
    ): SiteParameterTranslation {
        return (new SiteParameterTranslation())
            ->setTranslatable($siteParameter)
            ->setLocale($locale)
            ->setValue($value)
        ;
    }
}
