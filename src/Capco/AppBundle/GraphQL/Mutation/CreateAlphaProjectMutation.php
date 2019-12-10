<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Form\Persister\StepProjectAbstractStepPersister;
use Capco\AppBundle\Form\ProjectAuthorTransformer;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\Repository\ProjectTypeRepository;
use Capco\UserBundle\Form\Type\CreateAlphaProjectFormType;
use Capco\UserBundle\Form\Type\ProjectAuthorsFormType;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\DBAL\Driver\DriverException;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class CreateAlphaProjectMutation implements MutationInterface
{
    private $em;
    private $logger;
    private $transformer;
    private $formFactory;
    private $userRepository;
    private $projectTypeRepository;
    private $stepPersister;

    public function __construct(
        EntityManagerInterface $em,
        LoggerInterface $logger,
        UserRepository $userRepository,
        FormFactoryInterface $formFactory,
        ProjectAuthorTransformer $transformer,
        StepProjectAbstractStepPersister $stepPersister,
        ProjectTypeRepository $projectTypeRepository
    )
    {
        $this->em = $em;
        $this->logger = $logger;
        $this->transformer = $transformer;
        $this->formFactory = $formFactory;
        $this->userRepository = $userRepository;
        $this->projectTypeRepository = $projectTypeRepository;
        $this->stepPersister = $stepPersister;
    }

    public function __invoke(Argument $input): array
    {
        $arguments = $input->getArrayCopy();

        if (\count($arguments['authors']) <= 0) {
            throw new UserError('You must specify at least one author.');
        }

        $project = new Project();

        $form = $this->formFactory->create(CreateAlphaProjectFormType::class, $project);

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

        return ['project' => $project];
    }
}
