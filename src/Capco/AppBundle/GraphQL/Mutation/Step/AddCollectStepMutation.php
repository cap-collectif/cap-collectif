<?php

namespace Capco\AppBundle\GraphQL\Mutation\Step;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Enum\ProposalFormObjectType;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Service\AddStepService;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class AddCollectStepMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private readonly AddStepService $addStepService, private readonly TranslatorInterface $translator, private readonly EntityManagerInterface $em)
    {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
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
            ->setAllowAknowledge(true)
        ;

        /** * @var CollectStep $step */
        ['step' => $step] = $this->addStepService->addStep($input, $viewer, 'COLLECT');
        $step->setProposalForm($proposalForm);

        $this->em->persist($proposalForm);
        $this->em->flush();

        return ['step' => $step];
    }
}
