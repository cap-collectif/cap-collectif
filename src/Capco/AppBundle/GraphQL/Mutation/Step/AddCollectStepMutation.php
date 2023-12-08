<?php

namespace Capco\AppBundle\GraphQL\Mutation\Step;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Enum\ProposalFormObjectType;
use Capco\AppBundle\Service\AddStepService;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class AddCollectStepMutation implements MutationInterface
{
    private AddStepService $addStepService;
    private TranslatorInterface $translator;
    private EntityManagerInterface $em;

    public function __construct(AddStepService $addStepService, TranslatorInterface $translator, EntityManagerInterface $em)
    {
        $this->addStepService = $addStepService;
        $this->translator = $translator;
        $this->em = $em;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $projectId = $input->offsetGet('projectId');
        $project = $this->addStepService->getProject($projectId, $viewer);

        $organization = $viewer->getOrganization();
        $owner = $organization ?? $viewer;

        $proposalForm = (new ProposalForm())
            ->setTitle("{$project->getTitle()} - {$this->translator->trans('proposal-form')}")
            ->setUsingCategories(true)
            ->setUsingAddress(true)
            ->setUsingDescription(true)
            ->setIsGridViewEnabled(true)
            ->setObjectType(ProposalFormObjectType::PROPOSAL)
            ->setUsingFacebook(false)
            ->setUsingWebPage(false)
            ->setUsingTwitter(false)
            ->setUsingInstagram(false)
            ->setUsingYoutube(false)
            ->setUsingLinkedIn(false)
            ->setUsingIllustration(false)
            ->setCreator($viewer)
            ->setOwner($owner)
        ;

        /** * @var CollectStep $step */
        list('step' => $step) = $this->addStepService->addStep($input, $viewer, 'COLLECT');
        $step->setProposalForm($proposalForm);

        $this->em->persist($proposalForm);
        $this->em->flush();

        return ['step' => $step];
    }
}
