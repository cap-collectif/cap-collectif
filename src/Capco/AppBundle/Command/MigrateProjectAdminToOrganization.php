<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Entity\Organization\OrganizationSocialNetworks;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\GraphQL\Mutation\Organization\AddOrganizationMutation;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class MigrateProjectAdminToOrganization extends Command
{
    private UserRepository $userRepository;
    private AddOrganizationMutation $addOrganizationMutation;
    private EntityManagerInterface $em;
    private Connection $connection;
    private LoggerInterface $logger;

    public function __construct(
        EntityManagerInterface $em,
        AddOrganizationMutation $addOrganizationMutation,
        UserRepository $userRepository,
        LoggerInterface $logger
    ) {
        parent::__construct();

        $this->userRepository = $userRepository;
        $this->addOrganizationMutation = $addOrganizationMutation;
        $this->em = $em;
        $this->connection = $this->em->getConnection();

        $this->logger = $logger;
    }

    protected function configure()
    {
        $this->setName('capco:migrate_project_admin_to_organization')
            ->setDescription('A command to migrate existing user with ROLE_PROJECT_ADMIN to an organization.')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $users = $this->userRepository->findByRole(UserRole::ROLE_PROJECT_ADMIN);
        $countUsers = \count($users);

        /** * @var User $user */
        foreach ($users as $index => $user) {
            $countIndex = $index + 1;
            $output->writeln("migrating user => {$user->getUsername()} ({$countIndex}/{$countUsers})");

            $user->removeRole(UserRole::ROLE_PROJECT_ADMIN);
            $organization = $this->createOrganization($user);
            $this->migrateUserInfos($user, $organization);
            $this->addOrganizationMember($organization, $user);

            try {
                $this->updateProjects($user->getId(), $organization->getId());
                $this->updateQuestionnaires($user->getId(), $organization->getId());
                $this->updateEvents($user->getId(), $organization->getId());
                $this->updateMailingList($user->getId(), $organization->getId());
                $this->updateEmailingCampaign($user->getId(), $organization->getId());
                $this->updateProposalForms($user->getId(), $organization->getId());
                $this->updatePosts($user->getId(), $organization->getId());
            } catch (\Exception $exception) {
                $this->logger->error($exception->getMessage());

                return 1;
            }
        }

        $output->writeln("Successfully migrated {$countUsers} users");

        return 0;
    }

    private function migrateUserInfos(User $user, Organization $organization)
    {
        $biography = $user->getBiography();
        $twitterUrl = $user->getTwitterUrl();
        $facebookUrl = $user->getFacebookUrl();

        $organizationSocialNetworks = (new OrganizationSocialNetworks())->setFacebookUrl($facebookUrl)->setTwitterUrl($twitterUrl)->setOrganization($organization);
        $organization->setOrganizationSocialNetworks($organizationSocialNetworks);
        $organization->setBody($biography);
    }

    private function createOrganization(User $user): Organization
    {
        $translations = [
            [
                'title' => $user->getUsername(),
                'body' => '',
                'locale' => 'fr-FR',
            ],
        ];

        $input = new Arg(['translations' => $translations]);
        $organization = $this->addOrganizationMutation->__invoke($input)['organization'];
        $userProfilePicture = $user->getMedia();
        $organization->setLogo($userProfilePicture);

        return $organization;
    }

    private function addOrganizationMember(Organization $organization, User $user)
    {
        $organizationMember = (new OrganizationMember())->setOrganization($organization)->setUser($user)->setRole('admin');
        $organization->addMember($organizationMember);
        $this->em->persist($organizationMember);
        $this->em->flush();
    }

    private function updateProjects(string $ownerId, string $organizationId): void
    {
        $this->updateOwnerToOrga('project', $ownerId, $organizationId);
        $this->updateAuthorToOrga('project_author', $ownerId, $organizationId);
    }

    private function updateQuestionnaires(string $ownerId, string $organizationId): void
    {
        $this->updateOwnerToOrga('questionnaire', $ownerId, $organizationId);
    }

    private function updateProposalForms(string $ownerId, string $organizationId): void
    {
        $this->updateOwnerToOrga('proposal_form', $ownerId, $organizationId);
    }

    private function updateEvents(string $ownerId, string $organizationId): void
    {
        $this->updateOwnerToOrga('event', $ownerId, $organizationId);
    }

    private function updateMailingList(string $ownerId, string $organizationId): void
    {
        $this->updateOwnerToOrga('mailing_list', $ownerId, $organizationId);
    }

    private function updateEmailingCampaign(string $ownerId, string $organizationId): void
    {
        $this->updateOwnerToOrga('emailing_campaign', $ownerId, $organizationId);
    }

    private function updatePosts(string $ownerId, string $organizationId): void
    {
        $this->updateOwnerToOrga('blog_post', $ownerId, $organizationId);
        $this->updateAuthorToOrga('blog_post_authors', $ownerId, $organizationId);
    }

    private function updateOwnerToOrga(string $table, string $ownerId, string $organizationId): void
    {
        $authorizedTables = ['project', 'questionnaire', 'proposal_form', 'blog_post', 'event', 'mailing_list', 'emailing_campaign'];

        if (!\in_array($table, $authorizedTables)) {
            $authorizedTablesString = implode('/', $authorizedTables);

            throw new \Exception("table {$table} does not belong to authorized tables {$authorizedTablesString}");
        }

        $sql = "UPDATE {$table} SET owner_id = null, organizationOwner_id = :organizationId WHERE owner_id = :ownerId";
        $stmt = $this->connection->prepare($sql);
        $stmt->executeStatement([
            'ownerId' => $ownerId,
            'organizationId' => $organizationId,
        ]);
    }

    private function updateAuthorToOrga(string $table, string $userId, string $organizationId)
    {
        $authorizedTables = ['blog_post_authors', 'project_author'];

        if (!\in_array($table, $authorizedTables)) {
            $authorizedTablesString = implode('/', $authorizedTables);

            throw new \Exception("table {$table} does not belong to authorized tables {$authorizedTablesString}");
        }

        $sql = "UPDATE {$table} SET user_id = null, organization_id = :organizationId WHERE user_id = :userId";
        $stmt1 = $this->connection->prepare($sql);
        $stmt1->executeStatement([
            'userId' => $userId,
            'organizationId' => $organizationId,
        ]);
    }
}
