<?php

namespace Capco\AppBundle\Form\Persister;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Form\Step\OtherStepType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ProjectAbstractStepRepository;
use Capco\AppBundle\Utils\Diff;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;

class StepProjectAbstractStepPersister
{
    private $em;
    private $formFactory;
    private $logger;
    private $repository;
    private $pasRepository;

    public function __construct(
        LoggerInterface $logger,
        EntityManagerInterface $em,
        AbstractStepRepository $repository,
        ProjectAbstractStepRepository $pasRepository,
        FormFactoryInterface $formFactory
    )
    {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
        $this->repository = $repository;
        $this->pasRepository = $pasRepository;
    }

    public function persist(Project $project, array $steps): void
    {
        $dbSteps = new ArrayCollection($project->getRealSteps());
        $userSteps = new ArrayCollection($steps);
        foreach ($userSteps as $i => $step) {
            [$type, $entity] = $this->getFormEntity($step);
            $form = $this->formFactory->create($type, $entity);
            unset($step['id']);
            $form->submit($step);
            if (!$form->isValid()) {
                $this->logger->error(__METHOD__ . ' : ' . (string)$form->getErrors(true, false));

                throw GraphQLException::fromFormErrors($form);
            }
            $match = $this->pasRepository->findOneBy([
                'project' => $project,
                'step' => $form->getData()
            ]);
            if (!$match) {
                $pas = new ProjectAbstractStep();
                $pas
                    ->setPosition($i + 1)
                    ->setProject($project)
                    ->setStep($form->getData());
                $project->addStep($pas);
            } else {
                $match
                    ->setPosition($i + 1);
            }


        }

        $stepsToDelete = Diff::fromCollections($dbSteps, $userSteps);
        foreach ($stepsToDelete as $stepToDelete) {
            $projectAbstractStep = $this->pasRepository->findOneBy(['step' => $stepToDelete]);
            $project->removeStep($projectAbstractStep);
        }
        $this->em->flush();
    }

    /**
     * Given a step, returns it's corresponding form class and correct entity based on it's type
     * @param array $step
     * @return array A tuple containing [the form class name, the corresponding entity] based on the step type
     */
    private function getFormEntity(array $step): array
    {
        switch ($step['type']) {
            case OtherStep::TYPE:
                return [
                    OtherStepType::class,
                   isset($step['id']) ? $this->repository->find($step['id']) : new OtherStep()
                ];
            default:
                throw new \LogicException(
                    sprintf('Unknown step type given: "%s"', $step['type'])
                );
        }
    }
}
