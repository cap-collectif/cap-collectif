<?php

namespace Capco\AppBundle\Form\Persister;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Form\Step\OtherStepType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Form\FormFactoryInterface;

class StepProjectAbstractStepPersister
{
    private $em;
    private $formFactory;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory
    )
    {
        $this->em = $em;
        $this->formFactory = $formFactory;
    }

    public function persist(Project $project, array $steps): void
    {
        foreach ($steps as $i => $step) {
            [$type, $entity] = $this->getFormEntity($step);
            $form = $this->formFactory->create($type, $entity);
            $form->submit($step);
            if (!$form->isValid()) {
                $this->logger->error(__METHOD__ . ' : ' . (string)$form->getErrors(true, false));

                throw GraphQLException::fromFormErrors($form);
            }
            $pas = new ProjectAbstractStep();
            $pas
                ->setPosition($i + 1)
                ->setProject($project)
                ->setStep($form->getData());
            $project->addStep($pas);
            $this->em->flush();
        }
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
                return [OtherStepType::class, new OtherStep()];
            default:
                throw new \LogicException(
                    sprintf('Unknown step type given: "%s"', $step['type'])
                );
        }
    }
}
