<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Psr\Log\LoggerInterface;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\DBAL\Driver\DriverException;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Form\FormFactoryInterface;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Form\ProjectAuthorTransformer;
use Capco\AppBundle\Repository\ProjectTypeRepository;
use Capco\UserBundle\Form\Type\UpdateProjectFormType;
use Capco\AppBundle\Repository\ProjectAuthorRepository;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class UpdateProjectMutation implements MutationInterface
{
    private $em;
    private $formFactory;
    private $logger;
    private $userRepository;
    private $projectTypeRepository;
    private $projectRepository;
    private $projectAuthorRepository;
    private $transformer;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        UserRepository $userRepository,
        ProjectTypeRepository $projectTypeRepository,
        ProjectAuthorRepository $projectAuthorRepository,
        ProjectAuthorTransformer $transformer,
        ProjectRepository $projectRepository
    ) {
        $this->em = $em;
        $this->logger = $logger;
        $this->formFactory = $formFactory;
        $this->transformer = $transformer;
        $this->userRepository = $userRepository;
        $this->projectRepository = $projectRepository;
        $this->projectTypeRepository = $projectTypeRepository;
        $this->projectAuthorRepository = $projectAuthorRepository;
    }

    public function __invoke(Argument $input): array
    {
        $arguments = $input->getRawArguments();

        if (\count($arguments['authors']) <= 0) {
            throw new UserError('You must specify at least one author.');
        }

        $project = $this->projectRepository->find(GlobalId::fromGlobalId($arguments['id'])['id']);
        if (!$project) {
            throw new BadRequestHttpException('Sorry, please retry.');
        }
        $this->transformer->setProject($project);

        $arguments['authors'] = $this->transformer->transformUsers($arguments['authors']);

        unset($arguments['id']);

        $form = $this->formFactory->create(UpdateProjectFormType::class, $project);

        $form->submit($arguments, false);
        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));

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
