<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Project;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\DBAL\Driver\DriverException;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Form\FormFactoryInterface;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Form\ProjectAuthorTransformer;
use Capco\UserBundle\Form\Type\UpdateProjectFormType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\Repository\ProjectDistrictRepository;
use Capco\AppBundle\Form\Persister\ProjectDistrictsPersister;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Capco\AppBundle\Repository\ProjectDistrictPositionerRepository;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class UpdateProjectMutation implements MutationInterface
{
    private $entityManager;
    private $formFactory;
    private $logger;
    private $projectRepository;
    private $transformer;
    private $projectDistrictRepository;
    private $projectDistrictPositionerRepository;
    private $districtsPersister;

    public function __construct(
        EntityManagerInterface $entityManager,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        ProjectAuthorTransformer $transformer,
        ProjectRepository $projectRepository,
        ProjectDistrictRepository $projectDistrictRepository,
        ProjectDistrictsPersister $districtsPersister,
        ProjectDistrictPositionerRepository $projectDistrictPositionerRepository
    ) {
        $this->entityManager = $entityManager;
        $this->logger = $logger;
        $this->formFactory = $formFactory;
        $this->transformer = $transformer;
        $this->projectRepository = $projectRepository;
        $this->projectDistrictRepository = $projectDistrictRepository;
        $this->projectDistrictPositionerRepository = $projectDistrictPositionerRepository;
        $this->districtsPersister = $districtsPersister;
    }

    public function __invoke(Argument $input): array
    {
        $arguments = $input->getArrayCopy();
        $districts = $input->offsetGet('districts') ?? [];
        unset($arguments['districts']);
        if (!$input->offsetGet('id')) {
            throw new UserError('You must specify a project.');
        }
        $projectId = GlobalId::fromGlobalId($arguments['id'])['id'];

        $arguments['isExternal'] =
            isset($arguments['externalLink']) ||
            (isset($arguments['isExternal']) && $arguments['isExternal']);

        $project = $this->projectRepository->find(GlobalId::fromGlobalId($arguments['id'])['id']);

        if (!$project) {
            throw new BadRequestHttpException('Sorry, please retry.');
        }
        $this->transformer->setProject($project);

        if (
            (isset($arguments['authors']) && \count($arguments['authors']) <= 0) ||
            (0 === \count($project->getUserAuthors()) && !isset($arguments['authors']))
        ) {
            throw new UserError('You must specify at least one author.');
        }

        if (isset($arguments['authors'])) {
            $arguments['authors'] = $this->transformer->transformUsers($arguments['authors']);
        }

        unset($arguments['id']);

        $form = $this->formFactory->create(UpdateProjectFormType::class, $project);

        $form->submit($arguments, false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }
        if (\count($districts) > 0) {
            $this->districtsPersister->persist($districts, $project);
        }

        try {
            $this->entityManager->flush();
        } catch (DriverException $e) {
            $this->logger->error(
                __METHOD__ . ' => ' . $e->getErrorCode() . ' : ' . $e->getMessage()
            );

            throw new BadRequestHttpException('Sorry, please retry.');
        }

        $this->invalidateCache($project);

        return ['project' => $project];
    }

    public function invalidateCache(Project $project): void
    {
        $cacheDriver = $this->entityManager->getConfiguration()->getResultCacheImpl();
        $cacheDriver->delete(
            ProjectRepository::getOneWithoutVisibilityCacheKey($project->getSlug())
        );
    }
}
