<?php

namespace Capco\AppBundle\Form\Persister;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Form\ProjectAuthorTransformer;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\UserBundle\Form\Type\AlphaProjectFormType;
use Capco\UserBundle\Form\Type\ProjectAuthorsFormType;
use Doctrine\DBAL\Driver\DriverException;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class ProjectPersister
{
    private $em;
    private $logger;
    private $transformer;
    private $formFactory;
    private $stepPersister;
    private $repository;

    public function __construct(
        EntityManagerInterface $em,
        LoggerInterface $logger,
        FormFactoryInterface $formFactory,
        ProjectAuthorTransformer $transformer,
        StepProjectAbstractStepPersister $stepPersister,
        ProjectRepository $repository
    )
    {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
        $this->stepPersister = $stepPersister;
        $this->transformer = $transformer;
        $this->repository = $repository;
    }

    public function persist(Argument $input, ?bool $editMode = false): Project
    {
        $arguments = $input->getArrayCopy();

        if (\count($arguments['authors']) <= 0) {
            throw new UserError('You must specify at least one author.');
        }

        $project = new Project();

        if ($editMode) {
            $projectId = GlobalId::fromGlobalId($input->offsetGet('projectId'))['id'];
            $project = $this->repository->find($projectId);
            if (!$project) {
                throw new UserError(sprintf('Unknown project "%d"', $projectId));
            }
            unset($arguments['projectId']);
        }

        $form = $this->formFactory->create(AlphaProjectFormType::class, $project);

        [$dataAuthors, $steps] = [$arguments['authors'], $arguments['steps']];
        unset($arguments['authors'], $arguments['steps']);
        $form->submit($arguments);
        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . (string)$form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        try {
            $this->em->persist($project);
            $this->em->flush();
            $this->stepPersister->persist($project, $steps);
        } catch (DriverException $e) {
            $this->logger->error(
                __METHOD__ . ' => ' . $e->getErrorCode() . ' : ' . $e->getMessage()
            );

            throw new BadRequestHttpException('Sorry, please retry.');
        }

        $this->transformer->setProject($project);

        $form = $this->formFactory->create(ProjectAuthorsFormType::class, $project);

        $form->submit(['authors' => $this->transformer->transformUsers($dataAuthors)], false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . (string)$form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        try {
            $this->em->flush();
        } catch (DriverException $e) {
            $this->logger->error(
                __METHOD__ . ' => ' . $e->getErrorCode() . ' : ' . $e->getMessage()
            );

            throw new BadRequestHttpException('Sorry, please retry.');
        }

        return $project;
    }

}
