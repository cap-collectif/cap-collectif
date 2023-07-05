<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Repository\EmailingCampaignRepository;
use Capco\AppBundle\Repository\MailingListRepository;
use Capco\AppBundle\Repository\PostRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class MigrateOrganizationToPlatformCommand extends Command
{
    private EntityManagerInterface $em;
    private ProjectRepository $projectRepository;
    private QuestionnaireRepository $questionnaireRepository;
    private ProposalFormRepository $proposalFormRepository;
    private PostRepository $postRepository;
    private EmailingCampaignRepository $emailingCampaignRepository;
    private MailingListRepository $mailingListRepository;
    private UserRepository $userRepository;

    public function __construct(
        EntityManagerInterface $em,
        ProjectRepository $projectRepository,
        QuestionnaireRepository $questionnaireRepository,
        ProposalFormRepository $proposalFormRepository,
        PostRepository $postRepository,
        EmailingCampaignRepository $emailingCampaignRepository,
        MailingListRepository $mailingListRepository,
        UserRepository $userRepository
    ) {
        parent::__construct();

        $this->em = $em;
        $this->projectRepository = $projectRepository;
        $this->questionnaireRepository = $questionnaireRepository;
        $this->proposalFormRepository = $proposalFormRepository;
        $this->postRepository = $postRepository;
        $this->emailingCampaignRepository = $emailingCampaignRepository;
        $this->mailingListRepository = $mailingListRepository;
        $this->userRepository = $userRepository;
    }

    public function deleteProjects(string $orgaId): void
    {
        $ids = $this->getTableIdsExcludingOrganization('project', $orgaId);
        foreach ($ids as $id) {
            $project = $this->projectRepository->find($id);
            $this->em->remove($project);
        }
        $this->em->flush();
    }

    public function deleteQuestionnaires(string $orgaId)
    {
        $ids = $this->getTableIdsExcludingOrganization('questionnaire', $orgaId);
        foreach ($ids as $id) {
            $questionnaire = $this->questionnaireRepository->find($id);
            $this->em->remove($questionnaire);
        }
        $this->em->flush();
    }

    public function deleteProposalForms(string $orgaId)
    {
        $ids = $this->getTableIdsExcludingOrganization('proposal_form', $orgaId);
        foreach ($ids as $id) {
            $proposalForm = $this->proposalFormRepository->find($id);
            $this->em->remove($proposalForm);
        }
        $this->em->flush();
    }

    public function deleteEvents(string $orgaId)
    {
        $ids = $this->getTableIdsExcludingOrganization('event', $orgaId);
        $idsJoined = sprintf("'%s'", implode("','", $ids));

        // I don't know why passing as params does not work
        $sql = "DELETE FROM event WHERE id IN ({$idsJoined})";
        $this->executeStatement($sql);
    }

    public function deletePosts(string $orgaId)
    {
        $ids = $this->getTableIdsExcludingOrganization('blog_post', $orgaId);
        foreach ($ids as $id) {
            $posts = $this->postRepository->find($id);
            $this->em->remove($posts);
        }
        $this->em->flush();
    }

    public function deleteEmailingCampaign(string $orgaId)
    {
        $ids = $this->getTableIdsExcludingOrganization('emailing_campaign', $orgaId);
        foreach ($ids as $id) {
            $emailingCampaign = $this->emailingCampaignRepository->find($id);
            $this->em->remove($emailingCampaign);
        }
        $this->em->flush();
    }

    public function deleteMailingList(string $orgaId)
    {
        $ids = $this->getTableIdsExcludingOrganization('mailing_list', $orgaId);
        foreach ($ids as $id) {
            $mailingList = $this->mailingListRepository->find($id);
            $this->em->remove($mailingList);
        }
        $this->em->flush();
    }

    public function migrateOrganizationToUser(string $organizationId, string $ownerId): void
    {
        $tablesWithOrganizationOwner = ['project', 'questionnaire', 'proposal_form', 'blog_post', 'event', 'mailing_list', 'emailing_campaign'];

        foreach ($tablesWithOrganizationOwner as $table) {
            $sql = "UPDATE {$table} SET owner_id = :ownerId, creator_id = :ownerId, organizationOwner_id = null WHERE organizationOwner_id = :organizationId";
            $this->executeStatement($sql, [
                'ownerId' => $ownerId,
                'organizationId' => $organizationId,
            ]);
        }
    }

    public function setForeignKeyChecks(bool $value)
    {
        $value = $value ? 1 : 0;
        $sql = "SET FOREIGN_KEY_CHECKS = {$value}";
        $this->executeStatement($sql, ['value' => $value]);
    }

    public function dropUnUsedTable()
    {
        $this->setForeignKeyChecks(false);
        $tables = [
            'user_type',
            'user_type_translation',
            'video',
            'video_translation',
            'user_archive',
            'user_connection',
            'user_evaluatin_proposal',
            'user_favorite_proposal',
            'user_following',
            'user_in_group',
            'user_group',
            'user_identification_code',
            'user_identification_code_list',
            'user_invite',
            'user_invite_email_message',
            'user_invite_groups',
            'user_phone_verification_sms',
            'user_requirement',
            'style',
            'source',
            'source_category',
            'source_category_translation',
            'section_project',
            'section',
            'section_translation',
            'selection',
            'sender_email',
            'sender_email_domain',
            'site_color',
            'site_parameter',
            'site_parameter_translation',
            'site_settings',
            'sms_credit',
            'sms_order',
            'sms_remaining_credit_email_alert',
            'restricted_viewer_groups',
            'registration_form',
            'registration_form_translation',
            'public_api_token',
            'phone_token',
            'pending_organization_invitation',
            'menu_item',
            'menu_item_translation',
            'page',
            'page_translation',
            'newsletter_subscription',
            'ext_log_entries',
            'external_service_configuration',
            'footer_social_network',
            'contact_form',
            'contact_form_translation',
            'classification__category',
            'classification__collection',
            'classification__context',
            'classification__tag',
            'font',
            'locale',
            'map_token',
            'organization',
            'organization_member',
            'organization_social_networks',
            'organization_translation',
            'reporting',
            'sso_configuration',
        ];
        foreach ($tables as $table) {
            $sql = "DROP TABLE {$table}";
            $this->executeStatement($sql);
        }
        $this->setForeignKeyChecks(true);
    }

    public function emptyUnusedTable()
    {
        $this->setForeignKeyChecks(false);
        $tables = [
            'user_type',
            'user_type_translation',
            'video',
            'video_translation',
            'user_archive',
            'user_connection',
            'user_evaluatin_proposal',
            'user_favorite_proposal',
            'user_following',
            'user_in_group',
            'user_group',
            'user_identification_code',
            'user_identification_code_list',
            'user_invite',
            'user_invite_email_message',
            'user_invite_groups',
            'user_phone_verification_sms',
            'user_requirement',
            'style',
            'source',
            'source_category',
            'source_category_translation',
            'section_project',
            'section',
            'section_translation',
            'selection',
            'sender_email',
            'sender_email_domain',
            'site_color',
            'site_parameter',
            'site_parameter_translation',
            'site_settings',
            'sms_credit',
            'sms_order',
            'sms_remaining_credit_email_alert',
            'restricted_viewer_groups',
            'registration_form',
            'registration_form_translation',
            'public_api_token',
            'phone_token',
            'pending_organization_invitation',
            'menu_item',
            'menu_item_translation',
            'page',
            'page_translation',
            'newsletter_subscription',
            'highlighted_content',
            'ext_log_entries',
            'external_service_configuration',
            'footer_social_network',
            'contact_form',
            'contact_form_translation',
            'classification__category',
            'classification__collection',
            'classification__context',
            'classification__tag',
            'font',
            'locale',
            'map_token',
            'organization',
            'organization_member',
            'organization_social_networks',
            'organization_translation',
            'reporting',
            'sso_configuration',
        ];
        foreach ($tables as $table) {
            $sql = "DELETE FROM {$table}";
            $this->executeStatement($sql);
        }
        $this->setForeignKeyChecks(true);
    }

    public function deleteOrphanMedia()
    {
        $defaultMedias = ['Media Urbanisme', 'Media Santé', 'Media Sport', 'Media Scolarité', 'Media Securité', 'MediaSolidarite', 'Media Qualité De Vie', 'Media Propreté', 'Media Mobilité', 'Media Jeunesse', 'Media Environnement', 'Media Culture', 'Media PMR', 'Media Attractivité', 'Media Agriculture', 'Titre du média', 'Titre du média', 'Titre du média', 'Image de la barre de votes', 'Instagram', 'Capco', 'Youtube', 'Twitter', 'RSS', 'LinkedIn', 'Google', 'Facebook', 'Flickr', 'Picto', 'Header', 'Logo'];
        $defaultMediasJoined = sprintf("'%s'", implode("','", $defaultMedias));

        $sql = "
            SELECT m.id, m.provider_reference
            FROM media__media m
            LEFT JOIN blog_post on m.id = blog_post.media_id
            LEFT JOIN category_image on m.id = category_image.image_id
            LEFT JOIN consultation on m.id = consultation.illustration_id
            LEFT JOIN district on m.id = district.cover_id
            LEFT JOIN event on m.id = event.media_id
            LEFT JOIN font on m.id = font.file_id
            LEFT JOIN fos_user on m.id = fos_user.media_id
            LEFT JOIN organization on m.id = organization.banner_id
            LEFT JOIN organization o2 on m.id = o2.logo_id
            LEFT JOIN page on m.id = page.cover_id
            LEFT JOIN project on m.id = project.cover_id
            LEFT JOIN proposal on m.id = proposal.media_id
            LEFT JOIN question_choice on m.id = question_choice.image_id
            LEFT JOIN responses_medias on m.id = responses_medias.media_id
            LEFT JOIN site_image on m.id = site_image.Media_id
            LEFT JOIN social_network on m.id = social_network.media_id
            LEFT JOIN source on m.id = source.media_id
            LEFT JOIN theme on m.id = theme.media_id
            LEFT JOIN video on m.id = video.media_id
            WHERE (blog_post.media_id IS NOT NULL OR  category_image.image_id IS NOT NULL OR  consultation.illustration_id IS NOT NULL OR  district.cover_id IS NOT NULL OR  event.media_id IS NOT NULL OR  font.file_id IS NOT NULL
                   OR  fos_user.media_id IS NOT NULL OR  organization.banner_id IS NOT NULL OR  o2.logo_id IS NOT NULL OR  page.cover_id IS NOT NULL OR  project.cover_id IS NOT NULL OR  proposal.media_id IS NOT NULL
                   OR  question_choice.image_id IS NOT NULL OR  responses_medias.media_id IS NOT NULL OR  site_image.Media_id IS NOT NULL OR  social_network.media_id IS NOT NULL OR  source.media_id IS NOT NULL OR  theme.media_id IS NOT NULL
                    OR  video.media_id IS NOT NULL OR  m.name IN ({$defaultMediasJoined}))
        ";

        $connection = $this->em->getConnection();
        $statement = $connection->prepare($sql);
        $query = $statement->executeQuery();
        $rows = $query->fetchAllAssociative();

        $ids = array_map(function ($row) {
            return $row['id'];
        }, $rows);

        $ids = sprintf("'%s'", implode("','", $ids));

        $sql = "DELETE FROM media__media WHERE id NOT IN ({$ids})";
        $this->executeStatement($sql);

        $filesToKeep = array_map(function ($row) {
            return $row['provider_reference'];
        }, $rows);

        $allFiles = scandir('public/media/default/0001/01');
        unset($allFiles[0], $allFiles[1]);

        $filesToRemove = array_diff($allFiles, $filesToKeep);
        foreach ($filesToRemove as $filename) {
            $path = "public/media/default/0001/01/{$filename}";
            unlink($path);
        }
    }

    public function deleteDistrict()
    {
        $sql = 'SELECT d.id
                FROM district d
                LEFT JOIN project_district_positioner pdp ON d.id = pdp.district_id
                LEFT JOIN proposal p ON d.id = p.district_id
                WHERE pdp.district_id IS NOT NULL OR p.district_id IS NOT NULL';

        $connection = $this->em->getConnection();
        $statement = $connection->prepare($sql);
        $query = $statement->executeQuery();
        $rows = $query->fetchAllAssociative();

        $ids = array_map(function ($row) {
            return $row['id'];
        }, $rows);

        $ids = sprintf("'%s'", implode("','", $ids));

        $this->executeStatement("DELETE FROM district_translation WHERE translatable_id NOT IN ({$ids})");
        $this->executeStatement("DELETE FROM district WHERE id NOT IN ({$ids})");
    }

    protected function configure()
    {
        $this->setName('capco:migrate:orga-to-platform')
            ->setDescription('A command to migrate project data from an organization to a standalone platform.')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $orgaId = ''; // fill with the orga id from where you are moving the projects
        $owner = $this->userRepository->findOneBy(['email' => '']); // fill with the owner that will own the projets
        $ownerId = $owner->getId();

        $this->deleteProjects($orgaId);
        $this->em->clear();
        $output->writeln('<info>DELETE PROJECTS</info>');

        $this->deleteProposalForms($orgaId);
        $this->em->clear();
        $output->writeln('<info>DELETE PROPOSALFORMS</info>');

        $this->deleteQuestionnaires($orgaId);
        $this->em->clear();
        $output->writeln('<info>DELETE QUESTIONNAIRES</info>');

        $this->deleteEvents($orgaId);
        $this->em->clear();
        $output->writeln('<info>DELETE EVENTS</info>');

        $this->deletePosts($orgaId);
        $this->em->clear();
        $output->writeln('<info>DELETE POSTS</info>');

        $this->deleteMailingList($orgaId);
        $this->em->clear();
        $output->writeln('<info>DELETE MAILING_LIST</info>');

        $this->deleteEmailingCampaign($orgaId);
        $this->em->clear();
        $output->writeln('<info>DELETE EMAILING_CAMPAIGN</info>');

        $this->deleteDistrict();
        $output->writeln('<info>DELETE DISTRICT</info>');

        $this->migrateOrganizationToUser($orgaId, $ownerId);
        $output->writeln('<info>MIGRATING ORGA TO USER</info>');

        $this->migrateAuthor($orgaId, $ownerId);
        $output->writeln('<info>MIGRATING ORGA AUTHOR TO USER</info>');

        $this->emptyUnusedTable();
        $output->writeln('<info>EMPTY UNUSED TABLE</info>');

        $this->deleteUsers();
        $output->writeln('<info>DELETE USERS</info>');

        $this->deleteOrphanMedia();
        $output->writeln('<info>DELETE MEDIAS</info>');

        $this->dropUnUsedTable();
        $output->writeln('<info>DROPPING UNUSED TABLE</info>');

        $output->writeln('DONE');

        return 0;
    }

    private function migrateAuthor(string $organizationId, string $userId)
    {
        $tablesWithOrganizationOwner = ['blog_post_authors', 'project_author'];

        foreach ($tablesWithOrganizationOwner as $table) {
            $sql = "UPDATE {$table} SET user_id = :userId, organization_id = null WHERE organization_id = :organizationId";
            $this->executeStatement($sql, [
                'userId' => $userId,
                'organizationId' => $organizationId,
            ]);
        }
    }

    private function getTableIdsExcludingOrganization(string $table, string $orgaId): array
    {
        $sql = "SELECT id FROM {$table} WHERE organizationOwner_id != :orgaId OR organizationOwner_id IS NULL";

        if ('event' === $table) {
            $sql = 'SELECT id FROM event WHERE (organizationOwner_id != :orgaId OR organization_id != :orgaId) OR (organizationOwner_id IS NULL AND organization_id IS NULL)';
        }

        $connection = $this->em->getConnection();
        $statement = $connection->prepare($sql);
        $query = $statement->executeQuery([
            'orgaId' => $orgaId,
        ]);
        $row = $query->fetchAllAssociative();

        return array_map(function ($row) {
            return $row['id'];
        }, $row);
    }

    private function deleteUsers()
    {
        $users = $this->userRepository->findAll();

        $usersIdThatHasContributed = [];

        foreach ($users as $user) {
            if (0 === \count($user->getContributions())) {
                continue;
            }
            $usersIdThatHasContributed[] = $user->getId();
        }

        // was originally used for annecy who needed to keep a list of users given a csv file, I let it like it is if we need to reuse the same logic someday
        $emailsFromCSV = [];

        $csvUsersId = array_map(function ($email) {
            $user = $this->userRepository->findOneBy(['email' => $email]);
            if (!$user) {
                return null;
            }

            return $user->getId();
        }, $emailsFromCSV);

        $usersToKeepEmail = array_unique(array_merge($usersIdThatHasContributed, $csvUsersId));

        $capcoAdminUser = $this->userRepository->findOneBy(['email' => 'admin@cap-collectif.com']);
        $usersToKeepEmail[] = $capcoAdminUser->getId();
        $usersToKeepEmail = sprintf("'%s'", implode("','", $usersToKeepEmail));

        $this->executeStatement("DELETE FROM action_token WHERE user_id NOT IN ({$usersToKeepEmail})");
        $this->executeStatement("DELETE FROM fos_user WHERE id NOT IN ({$usersToKeepEmail}) OR email IS NULL");
    }

    private function executeStatement(string $sql, array $params = []): int
    {
        $connection = $this->em->getConnection();
        $statement = $connection->prepare($sql);

        return $statement->executeStatement($params);
    }
}
