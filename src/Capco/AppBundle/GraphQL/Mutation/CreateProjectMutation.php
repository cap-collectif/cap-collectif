<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Project;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\DBAL\Driver\DriverException;
use Capco\UserBundle\Form\Type\ProjectFormType;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\Form\FormFactoryInterface;
use Capco\AppBundle\Repository\ProjectTypeRepository;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class CreateProjectMutation implements MutationInterface
{
    private $em;
    private $formFactory;
    private $logger;
    private $userRepository;
    private $projectTypeRepository;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        UserRepository $userRepository,
        ProjectTypeRepository $projectTypeRepository
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
        $this->userRepository = $userRepository;
        $this->projectTypeRepository = $projectTypeRepository;
    }

    public function __invoke(Argument $input): array
    {
        $arguments = $input->getRawArguments();

        $project = new Project();

        $projectType = $this->projectTypeRepository->find($arguments['projectType']);

        if (null !== $projectType) {
            $project->setProjectType($projectType);
        }

        $users = $this->userRepository->hydrateFromIds($arguments['authors']);
        foreach ($users as $user) {
            $project->addAuthor($user);
        }

        unset($arguments['authors'], $arguments['projectType']);

        $form = $this->formFactory->create(ProjectFormType::class, $project);

        $form->submit($arguments, false);
        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        try {
            $this->em->persist($project);
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
