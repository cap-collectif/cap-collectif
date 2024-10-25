<?php

namespace Capco\AppBundle\GraphQL\Mutation\Section;

use Capco\AppBundle\Entity\Section\Section;
use Capco\AppBundle\Entity\Section\SectionCarrouselElement;
use Capco\AppBundle\Form\SectionType;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\SectionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\PropertyAccess\PropertyAccess;
use Symfony\Component\PropertyAccess\PropertyAccessor;

class CreateOrUpdateCarrouselConfigurationMutation implements MutationInterface
{
    use MutationTrait;

    public const TOO_MANY_CARROUSEL_ITEMS = 'TOO_MANY_CARROUSEL_ITEMS';
    public const INVALID_FORM = 'INVALID_FORM';
    public const MAX_CARROUSEL_ITEMS = 8;

    private EntityManagerInterface $em;
    private SectionRepository $sectionRepository;
    private FormFactoryInterface $formFactory;
    private GlobalIdResolver $globalIdResolver;

    public function __construct(
        EntityManagerInterface $em,
        SectionRepository $sectionRepository,
        FormFactoryInterface $formFactory,
        GlobalIdResolver $globalIdResolver
    ) {
        $this->em = $em;
        $this->sectionRepository = $sectionRepository;
        $this->formFactory = $formFactory;
        $this->globalIdResolver = $globalIdResolver;
    }

    /**
     * @return array<string, null|Section|string>
     */
    public function __invoke(Argument $args): array
    {
        $this->formatInput($args);
        /**
         * @var Section $sectionCarrousel
         */
        $sectionCarrousel = $this->sectionRepository->findOneBy(['type' => 'carrousel']);
        $arguments = $args->getArrayCopy();

        $sectionCarrouselElementToCreate = $this->createOrUpdateHomePageCarrouselSectionConfiguration($arguments);
        if ($sectionCarrousel->getSectionCarrouselElements()->count() + \count($sectionCarrouselElementToCreate) > self::MAX_CARROUSEL_ITEMS) {
            return [
                'homePageCarrouselSectionConfiguration' => null,
                'errorCode' => self::TOO_MANY_CARROUSEL_ITEMS,
            ];
        }

        unset($arguments['carrouselElements']);

        $form = $this->formFactory->create(SectionType::class, $sectionCarrousel);
        $form->submit($arguments, false);

        if ($form->isSubmitted() && !$form->isValid()) {
            return ['errorCode' => self::INVALID_FORM];
        }

        foreach ($sectionCarrouselElementToCreate as $sectionCarrouselElement) {
            $sectionCarrousel->addSectionCarrouselElement($sectionCarrouselElement);
            $this->em->persist($sectionCarrouselElement);
        }

        $this->em->flush();

        return ['carrouselConfiguration' => $sectionCarrousel, 'errorCode' => null];
    }

    /**
     * @param array<string, array<int, array<string, bool|int|string>>|bool|int> $arguments
     *
     * @return array<SectionCarrouselElement>
     */
    private function createOrUpdateHomePageCarrouselSectionConfiguration(array $arguments): array
    {
        $propertyAccessor = PropertyAccess::createPropertyAccessor();
        $sectionCarrouselElementsToCreate = [];

        foreach ($arguments['carrouselElements'] as $carrouselElementData) {
            $carrouselElementId = $carrouselElementData['id'] ?? null;

            if (!$carrouselElementId) {
                $sectionCarrouselElementsToCreate[] = $this->createCarrouselElements($carrouselElementData, $propertyAccessor);

                continue;
            }

            $this->updateCarrouselElements($carrouselElementData, $propertyAccessor);
        }

        return $sectionCarrouselElementsToCreate;
    }

    /**
     * @param array<string, bool|int|string> $carrouselElementData
     */
    private function updateCarrouselElements(array $carrouselElementData, PropertyAccessor $propertyAccessor): void
    {
        $sectionCarrouselElementToUpdate = $this->globalIdResolver->resolve((string) $carrouselElementData['id']);
        unset($carrouselElementData['id']);

        if (!$sectionCarrouselElementToUpdate) {
            throw new \RuntimeException(sprintf('Carrousel element global ID: %s not found', $carrouselElementData['id']));
        }

        $this->assignImageToSectionCarrouselElement($carrouselElementData, $sectionCarrouselElementToUpdate);
        $this->setSectionCarrouselElementData($carrouselElementData, $sectionCarrouselElementToUpdate, $propertyAccessor);
    }

    /**
     * @param array<string, bool|int|string> $carrouselElementData
     */
    private function createCarrouselElements(array $carrouselElementData, PropertyAccessor $propertyAccessor): SectionCarrouselElement
    {
        $sectionCarrouselElementToCreate = new SectionCarrouselElement();
        $this->assignImageToSectionCarrouselElement($carrouselElementData, $sectionCarrouselElementToCreate);
        $this->setSectionCarrouselElementData($carrouselElementData, $sectionCarrouselElementToCreate, $propertyAccessor);

        return $sectionCarrouselElementToCreate;
    }

    /**
     * @param array<string, null|bool|int|string> $carrouselElementData
     */
    private function setSectionCarrouselElementData(
        array $carrouselElementData,
        SectionCarrouselElement $sectionCarrouselElement,
        PropertyAccessor $propertyAccessor
    ): void {
        foreach ($carrouselElementData as $property => $value) {
            if (null !== $value && $propertyAccessor->isWritable($sectionCarrouselElement, $property)) {
                $propertyAccessor->setValue($sectionCarrouselElement, $property, $value);
            }
        }
    }

    /**
     * @param array<string, bool|int|string> $carrouselElementData
     */
    private function assignImageToSectionCarrouselElement(
        array &$carrouselElementData,
        SectionCarrouselElement $sectionCarrouselElementToUpdate
    ): void {
        if (empty($carrouselElementData['image'])) {
            return;
        }

        $id = GlobalId::toGlobalId('Media', $carrouselElementData['image']);
        $image = $this->globalIdResolver->resolve($id);

        if (!$image) {
            throw new \RuntimeException(sprintf('Carrousel element image global ID: %s not found', $carrouselElementData['image']));
        }

        $sectionCarrouselElementToUpdate->setImage($image);
        unset($carrouselElementData['image']);
    }
}
