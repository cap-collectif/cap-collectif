<?php

namespace Capco\AppBundle\GraphQL\Mutation\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\Organization\OrganizationRepository;
use Capco\AppBundle\Repository\Organization\PendingOrganizationInvitationRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class DeleteOrganizationMutation implements MutationInterface
{
    use MutationTrait;

    public const ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND';
    public const ORGANIZATION_ALREADY_ANONYMIZED = 'ORGANIZATION_ALREADY_ANONYMIZED';

    private EntityManagerInterface $em;
    private GlobalIdResolver $globalIdResolver;
    private ProjectRepository $projectRepository;
    private TranslatorInterface $translator;
    private SluggerInterface $slugger;
    private OrganizationRepository $organizationRepository;
    private PendingOrganizationInvitationRepository $pendingOrganizationInvitationRepository;
    private UserInviteRepository $userInviteRepository;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        ProjectRepository $projectRepository,
        TranslatorInterface $translator,
        SluggerInterface $slugger,
        OrganizationRepository $organizationRepository,
        PendingOrganizationInvitationRepository $pendingOrganizationInvitationRepository,
        UserInviteRepository $userInviteRepository
    ) {
        $this->em = $em;
        $this->globalIdResolver = $globalIdResolver;
        $this->projectRepository = $projectRepository;
        $this->translator = $translator;
        $this->slugger = $slugger;
        $this->organizationRepository = $organizationRepository;
        $this->pendingOrganizationInvitationRepository = $pendingOrganizationInvitationRepository;
        $this->userInviteRepository = $userInviteRepository;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $this->formatInput($input);
        $organizationId = $input->offsetGet('organizationId');
        $organization = $this->globalIdResolver->resolve($organizationId, $viewer);
        if (!$organization instanceof Organization) {
            return ['errorCode' => self::ORGANIZATION_NOT_FOUND];
        }
        if (null !== $organization->getDeletedAt()) {
            return ['errorCode' => self::ORGANIZATION_ALREADY_ANONYMIZED];
        }

        $organization->removeMembers();
        $this->anonymize($organization);
        $this->removePendingOrganizationsInvitations($organization);
        $this->handleProjectsAfterOrganizationAnonymization($organization);
        $this->em->flush();

        return ['deletedOrganization' => $organization];
    }

    public function removePendingOrganizationsInvitations(Organization $organization): void
    {
        $pendingOrganizationInvitations = $this->pendingOrganizationInvitationRepository->findBy(['organization' => $organization]);
        foreach ($pendingOrganizationInvitations as $pendingOrganizationInvitation) {
            $userInvite = $this->userInviteRepository->findOneBy(['token' => $pendingOrganizationInvitation->getToken()]);
            if ($userInvite) {
                $this->em->remove($userInvite);
            }
            $this->em->remove($pendingOrganizationInvitation);
        }
    }

    private function anonymize(Organization $organization): void
    {
        $deletedOrganizationsCount = $this->organizationRepository->countDeletedOrganization();
        $title = "{$this->translator->trans('deleted-organization')} {$deletedOrganizationsCount}";
        $slug = strtolower($this->slugger->slug($title)->toString());

        $organization
            ->setTitle($title)
            ->setBody('')
            ->setSlug($slug)
            ->setEmail('')
            ->setDeletedAt(new \DateTime())
            ->setLogo(null)
            ->setBanner(null)
            ->setOrganizationSocialNetworks(null)
        ;
    }

    private function handleProjectsAfterOrganizationAnonymization(Organization $organization): void
    {
        $projects = $this->projectRepository->findBy(['organizationOwner' => $organization]);

        foreach ($projects as $project) {
            $project->setArchived(true);
            $project->setVisibility(ProjectVisibilityMode::VISIBILITY_ADMIN);
        }
    }
}
