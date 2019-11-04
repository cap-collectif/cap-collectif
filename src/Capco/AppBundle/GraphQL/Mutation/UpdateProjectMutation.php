<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\District\ProjectDistrictPositioner;
use Capco\AppBundle\Repository\ProjectDistrictPositionerRepository;
use Capco\AppBundle\Repository\ProjectDistrictRepository;
use Psr\Log\LoggerInterface;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\DBAL\Driver\DriverException;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\Form\FormFactoryInterface;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Form\ProjectAuthorTransformer;
use Capco\UserBundle\Form\Type\UpdateProjectFormType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class UpdateProjectMutation implements MutationInterface
{
    use ContainerAwareTrait;

    private $em;
    private $formFactory;
    private $logger;
    private $projectRepository;
    private $transformer;
    private $projectDistrictRepository;
    private $projectDistrictPositionerRepository;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        ProjectAuthorTransformer $transformer,
        ProjectRepository $projectRepository,
        ProjectDistrictRepository $projectDistrictRepository,
        ProjectDistrictPositionerRepository $projectDistrictPositionerRepository
    ) {
        $this->em = $em;
        $this->logger = $logger;
        $this->formFactory = $formFactory;
        $this->transformer = $transformer;
        $this->projectRepository = $projectRepository;
        $this->projectDistrictRepository = $projectDistrictRepository;
        $this->projectDistrictPositionerRepository = $projectDistrictPositionerRepository;
    }

    public function __invoke(Argument $input): array
    {
        $districtEntities = [];
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
            $districtEntities = $this->projectDistrictRepository->findByIds($districts);
        }
        $oldPositioners = $this->projectDistrictPositionerRepository->findBy([
            'project' => $projectId
        ]);
        foreach ($oldPositioners as $positioner) {
            $this->em->remove($positioner);
        }
        $this->em->flush();
        $this->em->refresh($project);

        if (\count($districtEntities) > 0) {
            foreach ($districtEntities as $district) {
                $positioner = new ProjectDistrictPositioner();
                $positioner
                    ->setProject($project)
                    ->setDistrict($district)
                    ->setPosition(array_search($district->getId(), $districts, true));
                $this->em->persist($positioner);
            }
        }

        try {
            $this->em->flush();
        } catch (DriverException $e) {
            $this->logger->error(
                __METHOD__ . ' => ' . $e->getErrorCode() . ' : ' . $e->getMessage()
            );

            throw new BadRequestHttpException('Sorry, please retry.');
        }

        return ['project' => $project];
    }
}
