<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Form\Type\CreateAlphaProjectFormType;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Project;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\DBAL\Driver\DriverException;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\UserBundle\Form\Type\ProjectFormType;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\Form\FormFactoryInterface;
use Capco\AppBundle\Form\ProjectAuthorTransformer;
use Capco\AppBundle\Repository\ProjectTypeRepository;
use Capco\UserBundle\Form\Type\ProjectAuthorsFormType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class CreateAlphaProjectMutation implements MutationInterface
{
    private $em;
    private $logger;
    private $transformer;
    private $formFactory;
    private $userRepository;
    private $projectTypeRepository;

    public function __construct(
        EntityManagerInterface $em,
        LoggerInterface $logger,
        UserRepository $userRepository,
        FormFactoryInterface $formFactory,
        ProjectAuthorTransformer $transformer,
        ProjectTypeRepository $projectTypeRepository
    ) {
        $this->em = $em;
        $this->logger = $logger;
        $this->transformer = $transformer;
        $this->formFactory = $formFactory;
        $this->userRepository = $userRepository;
        $this->projectTypeRepository = $projectTypeRepository;
    }

    public function __invoke(Argument $input): array
    {
        $arguments = $input->getArrayCopy();

        if (\count($arguments['authors']) <= 0) {
            throw new UserError('You must specify at least one author.');
        }

        $project = new Project();

        $form = $this->formFactory->create(CreateAlphaProjectFormType::class, $project);

        $dataAuthors = $arguments['authors'];
        unset($arguments['authors']);
        $form->submit($arguments);
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

        $this->transformer->setProject($project);

        $form = $this->formFactory->create(ProjectAuthorsFormType::class, $project);

        $form->submit(['authors' => $this->transformer->transformUsers($dataAuthors)], false);

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
