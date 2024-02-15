<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProposalForm;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\CategoryImage;
use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\Entity\ProposalCategory;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Enum\ViewConfiguration;
use Capco\AppBundle\Exception\ViewConfigurationException;
use Capco\AppBundle\Form\ProposalDistrictType;
use Capco\AppBundle\Form\ProposalFormUpdateType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Query\QueryCategoryImagesResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\GraphQL\Traits\QuestionPersisterTrait;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\CategoryImageRepository;
use Capco\AppBundle\Repository\MultipleChoiceQuestionRepository;
use Capco\AppBundle\Repository\ProposalDistrictRepository;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\QuestionnaireAbstractQuestionRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\MediaBundle\Repository\MediaRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateProposalFormMutation extends AbstractProposalFormMutation
{
    use MutationTrait;
    use QuestionPersisterTrait;

    private FormFactoryInterface $formFactory;
    private ProposalFormRepository $proposalFormRepo;
    private LoggerInterface $logger;
    private QuestionnaireAbstractQuestionRepository $questionRepo;
    private AbstractQuestionRepository $abstractQuestionRepo;
    private MediaRepository $mediaRepository;
    private QueryCategoryImagesResolver $categoryImagesResolver;
    private CategoryImageRepository $categoryImageRepository;
    private MultipleChoiceQuestionRepository $choiceQuestionRepository;
    private ProposalDistrictRepository $proposalDistrictRepository;
    private Indexer $indexer;
    private ValidatorInterface $colorValidator;
    private Manager $toggleManager;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        FormFactoryInterface $formFactory,
        ProposalFormRepository $proposalFormRepo,
        LoggerInterface $logger,
        QuestionnaireAbstractQuestionRepository $questionRepo,
        AbstractQuestionRepository $abstractQuestionRepo,
        MediaRepository $mediaRepository,
        QueryCategoryImagesResolver $categoryImagesResolver,
        CategoryImageRepository $categoryImageRepository,
        MultipleChoiceQuestionRepository $choiceQuestionRepository,
        Indexer $indexer,
        ValidatorInterface $colorValidator,
        Manager $toggleManager,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        parent::__construct($em, $globalIdResolver, $authorizationChecker);
        $this->formFactory = $formFactory;
        $this->proposalFormRepo = $proposalFormRepo;
        $this->logger = $logger;
        $this->questionRepo = $questionRepo;
        $this->abstractQuestionRepo = $abstractQuestionRepo;
        $this->mediaRepository = $mediaRepository;
        $this->categoryImagesResolver = $categoryImagesResolver;
        $this->categoryImageRepository = $categoryImageRepository;
        $this->choiceQuestionRepository = $choiceQuestionRepository;
        $this->indexer = $indexer;
        $this->colorValidator = $colorValidator;
        $this->toggleManager = $toggleManager;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $arguments = $input->getArrayCopy();
        $id = $arguments['proposalFormId'];
        $oldChoices = null;

        $proposalForm = $this->getProposalFormFromUUID($id);

        unset($arguments['proposalFormId']);
        $form = $this->formFactory->create(ProposalFormUpdateType::class, $proposalForm);
        $arguments = $this->districtsProcess($proposalForm, $arguments);
        $arguments = $this->categoriesProcess($proposalForm, $arguments);

        $hasViewConfigurationChanged = $this->getViewConfigurationChanged(
            $arguments,
            $proposalForm
        );

        if (isset($arguments['questions'])) {
            $oldChoices = $this->getQuestionChoicesValues($proposalForm->getId());
            $this->handleQuestions($form, $proposalForm, $arguments, 'proposal');
        } else {
            $form->submit($arguments, false);
        }

        if ($form->isSubmitted() && !$form->isValid()) {
            $this->logger->error(__METHOD__ . $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        try {
            ViewConfiguration::checkProposalForm($proposalForm);
        } catch (ViewConfigurationException $exception) {
            throw new UserError($exception->getMessage());
        }

        if ($hasViewConfigurationChanged) {
            ViewConfiguration::updateStepsFromProposal($proposalForm);
        }

        // Associate the new categoryImage from uploaded image to proposalCategory
        $arguments = $this->associateNewCategoryImageToProposalCategory($proposalForm, $arguments);

        $this->em->flush();

        $this->reIndexChoices($oldChoices, $proposalForm);

        return ['proposalForm' => $proposalForm];
    }

    private function getViewConfigurationChanged(array $arguments, ProposalForm $proposalForm): bool
    {
        return (\array_key_exists('isGridViewEnabled', $arguments)
            && $arguments['isGridViewEnabled'] !== $proposalForm->isGridViewEnabled())
            || (\array_key_exists('isListViewEnabled', $arguments)
                && $arguments['isListViewEnabled'] !== $proposalForm->isListViewEnabled())
            || (\array_key_exists('isMapViewEnabled', $arguments)
                && $arguments['isMapViewEnabled'] !== $proposalForm->isMapViewEnabled());
    }

    private function getProposalFormFromUUID(string $uuid): ProposalForm
    {
        $proposalForm = $this->proposalFormRepo->find($uuid);
        if (!$proposalForm) {
            throw new UserError(sprintf('Unknown proposal form with id "%s"', $uuid));
        }

        return $proposalForm;
    }

    private function reIndexChoices(?array $oldChoices, ProposalForm $proposalForm)
    {
        if (isset($oldChoices)) {
            // We index all the question choices synchronously to avoid a
            // difference between datas saved in db and in elasticsearch.
            $newChoices = $this->getQuestionChoicesValues($proposalForm->getId());
            $mergedChoices = array_unique(array_merge($oldChoices, $newChoices));
            if (\count($mergedChoices) < 1500) {
                $this->indexQuestionChoicesValues($mergedChoices);
            }
        }
    }

    private function associateNewCategoryImageToProposalCategory(
        ProposalForm $proposalForm,
        array $arguments
    ): array {
        if (isset($arguments['categories'])) {
            $proposalCategories = $proposalForm->getCategories();
            /** @var ProposalCategory $proposalCategory */
            foreach ($proposalCategories as $proposalCategory) {
                foreach ($arguments['categories'] as &$category) {
                    if (
                        isset($category['newCategoryImage'])
                        && null !== $category['newCategoryImage']
                        && !$this->categoryImageRepository->findByImage(
                            $category['newCategoryImage']
                        )
                        && $category['name'] === $proposalCategory->getName()
                    ) {
                        $image = $this->mediaRepository->find($category['newCategoryImage']);
                        if (null !== $image) {
                            $categoryImage = (new CategoryImage())->setImage(
                                $this->mediaRepository->find($image)
                            );
                            $proposalCategory->setCategoryImage($categoryImage);
                        }
                    }
                    unset($category);
                }
            }
        }

        return $arguments;
    }

    private function districtsProcess(ProposalForm $proposalForm, array $arguments): array
    {
        if (isset($arguments['districts'])) {
            $updateDistricts = [];
            $newDistricts = [];
            foreach ($arguments['districts'] as $district) {
                if (isset($district['id'])) {
                    $id = GlobalId::fromGlobalId($district['id'])['id'];
                    $updateDistricts[$id] = $district;
                } else {
                    $newDistricts[] = $district;
                }
            }

            foreach ($proposalForm->getDistricts() as $district) {
                if (isset($updateDistricts[$district->getId()])) {
                    $districtData = $updateDistricts[$district->getId()];
                    unset($districtData['id']);
                    LocaleUtils::indexTranslations($districtData);
                    $form = $this->formFactory->create(ProposalDistrictType::class, $district);
                    $form->submit($districtData, false);
                    if (!$form->isValid()) {
                        $this->logger->error(__METHOD__ . $form->getErrors(true, false));

                        throw GraphQLException::fromFormErrors($form);
                    }
                } else {
                    $this->em->remove($district);
                }
            }

            foreach ($newDistricts as $districtData) {
                $district = new ProposalDistrict();
                $proposalForm->addDistrict($district);
                $form = $this->formFactory->create(ProposalDistrictType::class, $district);
                LocaleUtils::indexTranslations($districtData);
                $form->submit($districtData, false);
                if (!$form->isValid()) {
                    $this->logger->error(__METHOD__ . $form->getErrors(true, false));

                    throw GraphQLException::fromFormErrors($form);
                }

                $this->em->persist($district);
            }

            $this->em->flush();
        }

        unset($arguments['districts']);

        return $arguments;
    }

    private function categoriesProcess(ProposalForm $proposalForm, array $arguments): array
    {
        if (isset($arguments['categories'])) {
            $categoriesIds = [];
            foreach ($arguments['categories'] as $dataCategory) {
                if (isset($dataCategory['id'])) {
                    $categoriesIds[] = $dataCategory['id'];
                }
            }

            foreach ($proposalForm->getCategories() as $position => $category) {
                if (!\in_array($category->getId(), $categoriesIds, true)) {
                    $deletedCategory = [
                        'id' => $category->getId(),
                        'name' => 'NULL',
                    ];
                    // Add deleted category.
                    array_splice($arguments['categories'], $position, 0, [$deletedCategory]);
                }
            }
        }

        return $arguments;
    }

    private function defaultBorderIfEnabled(array $dataDistrict): array
    {
        if (
            !isset($dataDistrict['border'])
            || !isset($dataDistrict['border']['enabled'])
            || !$dataDistrict['border']['enabled']
        ) {
            return $dataDistrict;
        }

        if (!isset($dataDistrict['border']['opacity']) || !$dataDistrict['border']['opacity']) {
            $dataDistrict['border']['opacity'] = 1;
        }
        if (!isset($dataDistrict['border']['size']) || !$dataDistrict['border']['size']) {
            $dataDistrict['border']['size'] = 1;
        }
        if (!isset($dataDistrict['border']['color']) || !$dataDistrict['border']['color']) {
            $dataDistrict['border']['color'] = '#000000';
        }

        return $dataDistrict;
    }

    private function defaultBackgroundIfEnabled(array $dataDistrict): array
    {
        if (
            !isset($dataDistrict['background'])
            || !isset($dataDistrict['background']['enabled'])
            || !$dataDistrict['background']['enabled']
        ) {
            return $dataDistrict;
        }

        if (
            !isset($dataDistrict['background']['opacity'])
            || !$dataDistrict['background']['opacity']
        ) {
            $dataDistrict['background']['opacity'] = 0.2;
        }
        if (!isset($dataDistrict['background']['color']) || !$dataDistrict['background']['color']) {
            $dataDistrict['background']['color'] = '#FFFFFF';
        }

        return $dataDistrict;
    }
}
