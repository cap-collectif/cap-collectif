<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Form\ConsultationType;
use Capco\AppBundle\Form\OpinionTypeType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\OpinionTypeRepository;
use Capco\AppBundle\Resolver\SettableOwnerResolver;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\Error;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class CreateOrUpdateConsultationMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private readonly FormFactoryInterface $formFactory, private readonly EntityManagerInterface $em, private readonly LoggerInterface $logger, private readonly GlobalIdResolver $globalIdResolver, private readonly OpinionTypeRepository $opinionTypeRepository, private readonly AuthorizationCheckerInterface $authorizationChecker, private readonly SettableOwnerResolver $settableOwnerResolver)
    {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $consultationsInput = $input->offsetGet('consultations');
        $stepId = $input->offsetGet('stepId');
        $step = $this->globalIdResolver->resolve($stepId, $viewer);
        $owner = $viewer->getOrganization() ?? $viewer;

        $consultations = new ArrayCollection();
        foreach ($consultationsInput as $consultationInput) {
            $id = $consultationInput['id'] ?? null;
            if ($id) {
                unset($consultationInput['id']);
            }

            $consultation = $this->getConsultation($viewer, $id, $step);
            $consultation->setTitle($consultationInput['title']);
            $consultation->setOwner($owner);
            $this->em->flush();

            $this->removeSections($consultationInput['sections'], $consultation);
            $this->handleSections($consultationInput['sections'], $consultation);
            unset($consultationInput['sections']);

            $form = $this->formFactory->create(ConsultationType::class, $consultation);

            $form->submit($consultationInput);
            if (!$form->isValid()) {
                $this->logger->error(__METHOD__ . ' : ' . $form->getErrors(true, false));

                throw GraphQLException::fromFormErrors($form);
            }

            $consultation->setCreator($viewer);
            $consultation->setOwner(
                $this->settableOwnerResolver->__invoke($input->offsetGet('owner'), $viewer)
            );

            $consultations->add($consultation);
        }

        $this->em->flush();

        return ['consultations' => $consultations];
    }

    public function isGranted(string $stepId, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }

        $step = $this->getStep($stepId, $viewer);
        $project = $step->getProject();

        return $this->authorizationChecker->isGranted(
            ProjectVoter::EDIT,
            $project
        );
    }

    private function removeSections(array $sections, Consultation $consultation): void
    {
        $sectionsInputIds = $this->getAllSectionsIds($sections, []);

        $currentSections = $this->opinionTypeRepository->findBy(['consultation' => $consultation]);
        $currentSectionsIds = array_map(fn ($section) => $section->getId(), $currentSections);

        $idsToRemove = array_diff($currentSectionsIds, $sectionsInputIds);

        foreach ($idsToRemove as $id) {
            $section = $this->opinionTypeRepository->find($id);
            $this->em->remove($section);
        }

        $this->em->flush();
    }

    private function getAllSectionsIds(array $sections, array $ids): array
    {
        foreach ($sections as $section) {
            $id = $section['id'] ?? null;
            if (!$id) {
                continue;
            }

            $subSections = $section['sections'] ?? null;
            $ids[] = $section['id'];
            if ($subSections) {
                return $this->getAllSectionsIds($subSections, $ids);
            }
        }

        return $ids;
    }

    private function handleSections(array &$sections, Consultation $consultation, ?OpinionType $parent = null)
    {
        foreach ($sections as $section) {
            $id = $section['id'] ?? null;

            $sectionObject = $id ? $this->opinionTypeRepository->find($id) : new OpinionType();
            $sectionObject->setConsultation($consultation);

            if ($parent) {
                $sectionObject->setParent($parent);
            }

            $subSections = $section['sections'] ?? null;
            if (isset($section['defaultOrderBy'])) {
                $section['defaultFilter'] = $section['defaultOrderBy'];
                unset($section['defaultOrderBy']);
            }
            if (isset($section['contribuable'])) {
                $section['isEnabled'] = $section['contribuable'];
                unset($section['contribuable']);
            }

            $section['consultation'] = $consultation->getId();

            $form = $this->formFactory->create(OpinionTypeType::class, $sectionObject);
            $form->submit($section);
            $this->em->persist($sectionObject);
            $this->em->flush();

            if ($subSections) {
                $this->handleSections($subSections, $consultation, $sectionObject);
            }
        }
    }

    private function getConsultation(User $viewer, ?string $id = null, ?ConsultationStep $step = null): Consultation
    {
        if (!$id) {
            $consultation = new Consultation();
            $this->em->persist($consultation);

            return $consultation;
        }

        /** * @var Consultation $consultation  */
        $consultation = $this->globalIdResolver->resolve($id, $viewer);
        $title = $consultation->getTitle();

        if ($step && $step !== $consultation->getStep()) {
            $clonedConsultation = clone $consultation;
            $clonedConsultation->setTitle('copy ' . $title);
            $this->em->persist($clonedConsultation);

            return $clonedConsultation;
        }

        if (false === $consultation instanceof Consultation) {
            throw new \Exception("Object retreived with id : {$id} should be an instance of Consultation");
        }

        return $consultation;
    }

    private function getStep(string $stepId, User $viewer): ConsultationStep
    {
        $step = $this->globalIdResolver->resolve($stepId, $viewer);

        if (!$step instanceof ConsultationStep) {
            throw new Error("Given step with id: {$stepId} should be instance of ConsultationStep");
        }

        return $step;
    }
}
