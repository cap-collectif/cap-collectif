<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Resolver\SettableOwnerResolver;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Util\ClassUtils;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Project;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\DBAL\Driver\DriverException;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\UserBundle\Form\Type\ProjectFormType;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\Form\FormFactoryInterface;
use Capco\AppBundle\Form\ProjectAuthorTransformer;
use Capco\UserBundle\Form\Type\ProjectAuthorsFormType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class CreateProjectMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private LoggerInterface $logger;
    private ProjectAuthorTransformer $transformer;
    private FormFactoryInterface $formFactory;
    private SettableOwnerResolver $settableOwnerResolver;
    private AuthorizationCheckerInterface $authorizationChecker;
    private Indexer $indexer;

    public function __construct(
        EntityManagerInterface $em,
        LoggerInterface $logger,
        FormFactoryInterface $formFactory,
        SettableOwnerResolver $settableOwnerResolver,
        ProjectAuthorTransformer $transformer,
        AuthorizationCheckerInterface $authorizationChecker,
        Indexer $indexer
    ) {
        $this->em = $em;
        $this->logger = $logger;
        $this->transformer = $transformer;
        $this->formFactory = $formFactory;
        $this->settableOwnerResolver = $settableOwnerResolver;
        $this->authorizationChecker = $authorizationChecker;
        $this->indexer = $indexer;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $arguments = $input->getArrayCopy();

        if ($viewer->isOnlyProjectAdmin()) {
            $arguments['authors'] = [GlobalId::toGlobalId('User', $viewer->getId())];
        } elseif (\count($arguments['authors']) <= 0) {
            throw new UserError('You must specify at least one author.');
        }

        $project = (new Project())->setCreator($viewer);
        $project->setOwner(
            $this->settableOwnerResolver->__invoke($input->offsetGet('owner'), $viewer)
        );

        if (isset($arguments['owner'])) {
            unset($arguments['owner']);
        }
        $owner = $project->getOwner();
        if ($viewer->isOnlyProjectAdmin() || $owner instanceof Organization) {
            $project->setVisibility(ProjectVisibilityMode::VISIBILITY_ME);
        }

        $form = $this->formFactory->create(ProjectFormType::class, $project);

        $dataAuthors = $arguments['authors'];
        unset($arguments['authors']);

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

        $this->indexer->index(ClassUtils::getClass($project), $project->getId());
        $this->indexer->finishBulk();

        return ['project' => $project];
    }

    public function isGranted(): bool
    {
        return $this->authorizationChecker->isGranted(ProjectVoter::CREATE, new Project());
    }
}
