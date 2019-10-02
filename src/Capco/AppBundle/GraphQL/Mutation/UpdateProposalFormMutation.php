<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\CategoryImage;
use Capco\AppBundle\Entity\ProposalCategory;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Form\ProposalFormUpdateType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Traits\QuestionPersisterTrait;
use Capco\AppBundle\Repository\CategoryImageRepository;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\QuestionnaireAbstractQuestionRepository;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\MediaBundle\Repository\MediaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateProposalFormMutation implements MutationInterface
{
    use QuestionPersisterTrait;

    private $em;
    private $formFactory;
    private $proposalFormRepo;
    private $logger;
    private $questionRepo;
    private $abstractQuestionRepo;
    private $mediaRepository;
    private $categoryImageRepository;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        ProposalFormRepository $proposalFormRepo,
        LoggerInterface $logger,
        QuestionnaireAbstractQuestionRepository $questionRepo,
        AbstractQuestionRepository $abstractQuestionRepo,
        MediaRepository $mediaRepository,
        CategoryImageRepository $categoryImageRepository
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->proposalFormRepo = $proposalFormRepo;
        $this->logger = $logger;
        $this->questionRepo = $questionRepo;
        $this->abstractQuestionRepo = $abstractQuestionRepo;
        $this->mediaRepository = $mediaRepository;
        $this->categoryImageRepository = $categoryImageRepository;
    }

    public function __invoke(Argument $input): array
    {
        $arguments = $input->getArrayCopy();
        $id = $arguments['proposalFormId'];

        /** @var ProposalForm $proposalForm */
        $proposalForm = $this->proposalFormRepo->find($id);

        if (!$proposalForm) {
            throw new UserError(sprintf('Unknown proposal form with id "%s"', $id));
        }
        unset($arguments['proposalFormId']);

        $form = $this->formFactory->create(ProposalFormUpdateType::class, $proposalForm);

        if (isset($arguments['districts'])) {
            $districtsIds = [];
            foreach ($arguments['districts'] as $dataDistrict) {
                if (isset($dataDistrict['id'])) {
                    $districtsIds[] = $dataDistrict['id'];
                }
            }

            foreach ($proposalForm->getDistricts() as $position => $district) {
                if (!\in_array($district->getId(), $districtsIds)) {
                    $deletedDistrict = [
                        'id' => $district->getId(),
                        'name' => 'NULL'
                    ];
                    array_splice($arguments['districts'], $position, 0, [$deletedDistrict]);
                }
            }
        }

        if (isset($arguments['categories'])) {
            $categoriesIds = [];
            foreach ($arguments['categories'] as $dataCategory) {
                if (isset($dataCategory['id'])) {
                    $categoriesIds[] = $dataCategory['id'];
                }
            }

            foreach ($proposalForm->getCategories() as $position => $category) {
                if (!\in_array($category->getId(), $categoriesIds)) {
                    $deletedCategory = [
                        'id' => $category->getId(),
                        'name' => 'NULL'
                    ];
                    // Add deleted category.
                    array_splice($arguments['categories'], $position, 0, [$deletedCategory]);
                }
            }
        }

        if (isset($arguments['questions'])) {
            $this->handleQuestions($form, $proposalForm, $arguments, 'proposal');
        } else {
            $form->submit($arguments, false);
        }

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . (string) $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        // Associate the new categoryImage from uploaded image to proposalCategory
        if ($arguments['categories']) {
            $proposalCategories = $proposalForm->getCategories();
            /** @var ProposalCategory $proposalCategory */
            foreach ($proposalCategories as $proposalCategory) {
                foreach ($arguments['categories'] as &$category) {
                    $categoryImage = null;
                    if (
                        $category['id'] === $proposalCategory->getId() &&
                        $category['newCategoryImage'] &&
                        null !== $category['newCategoryImage']
                    ) {
                        $categoryImage = (new CategoryImage())->setImage(
                            $this->mediaRepository->find($category['newCategoryImage'])
                        );
                        $proposalCategory->setCategoryImage($categoryImage);
                        unset($category);
                    }
                }
            }
        }

        $this->em->flush();

        return ['proposalForm' => $proposalForm];
    }
}
