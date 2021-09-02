<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\Entity\Locale;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class Version20201203122444 extends AbstractMigration implements ContainerAwareInterface
{
    private ?ContainerInterface $container;
    private EntityManagerInterface $em;
    private UuidGenerator $generator;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->container = $container;
        $this->em = $this->container->get('doctrine')->getManager();
        $this->generator = new UuidGenerator();
    }

    public function getDescription(): string
    {
        return 'official response 2';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        //schema changes are made in Version20201130152444
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        //schema changes are made in Version20201130152444
    }

    /**
     * POST UP
     */
    public function postUp(Schema $schema): void
    {
        //create responses
        $officialResponsesDataInPosts = $this->getOfficialResponsesDataInPosts();

        //remove doublons
        $filtered = [];
        foreach ($officialResponsesDataInPosts as $datum) {
            if ($datum['proposal_id']) {
                $filtered[$datum['proposal_id']] = $datum;
            }
        }

        foreach ($filtered as $data) {
            $this->createOfficialResponseFromPostData($data);
        }

        //add constraints
        $this->connection->exec(
            'ALTER TABLE proposal_decision ADD CONSTRAINT FK_65F782602E3F174A FOREIGN KEY (official_response_id) REFERENCES official_response (id)'
        );
        $this->connection->exec(
            'CREATE UNIQUE INDEX UNIQ_65F782602E3F174A ON proposal_decision (official_response_id)'
        );

        //remove proposaldecision.post
        $this->connection->exec(
            'ALTER TABLE proposal_decision DROP FOREIGN KEY FK_65F782604B89032C'
        );
        $this->connection->exec('DROP INDEX UNIQ_65F782604B89032C ON proposal_decision');
        $this->connection->exec('ALTER TABLE proposal_decision DROP post_id');

        //remove posts that were official responses
        foreach ($officialResponsesDataInPosts as $data) {
            $this->removeDataFromPosts($data);
        }
    }

    private function getOfficialResponsesDataInPosts(): array
    {
        return $this->connection->fetchAll(
            "
            SELECT
                bp.id as post_id, bp.is_published, bp.published_at, bp.updated_at, bp.created_at,
                bpt.body,
                pp.proposal_id,
                pd.id as proposal_decision_id
            FROM
                blog_post bp
            JOIN
                blog_post_translation bpt ON bpt.translatable_id = bp.id
            JOIN
                proposal_post pp ON pp.post_id = bp.id
            LEFT JOIN
                proposal_decision pd ON pd.post_id = bp.id
            WHERE
                title REGEXP \"^[Rr][eé]ponse\"
                OR title REGEXP \"[Rr]ecevabilité\"
                OR title REGEXP \"[Vv]alidé\"
                OR title REGEXP \"[Cc]ommentaire\"
                OR title REGEXP \"[Cc]onformité\"
                OR title REGEXP \"[Aa]nalyse\"
                OR title LIKE \"Conclusion de l'analyse du projet\"
                OR title LIKE \"Projet non retenu\"            
            "
        );
    }

    private function createOfficialResponseFromPostData(array $data): void
    {
        $postId = $data['post_id'];
        unset($data['post_id']);
        $proposalDecisionId = $data['proposal_decision_id'];
        unset($data['proposal_decision_id']);
        $data['id'] = $this->generator->generate($this->em, null);
        $this->connection->insert('official_response', $data);
        $this->addAuthorsToOfficialResponses($postId, $data);
        if ($proposalDecisionId) {
            $this->addOfficialResponseInProposalDecision($proposalDecisionId, $data);
        }
    }

    private function addAuthorsToOfficialResponses(string $postId, array $data): void
    {
        $authorsData = $this->connection->fetchAll(
            'SELECT user_id FROM blog_post_authors WHERE post_id = ?',
            [$postId]
        );
        foreach ($authorsData as $authorsDatum) {
            $this->connection->insert('official_response_author', [
                'user_id' => $authorsDatum['user_id'],
                'official_response_id' => $data['id'],
            ]);
        }
    }

    private function addOfficialResponseInProposalDecision(
        string $proposalDecisionId,
        array $data
    ): void {
        $this->connection->update(
            'proposal_decision',
            ['official_response_id' => $data['id']],
            ['id' => $proposalDecisionId]
        );
    }

    private function removeDataFromPosts(array $data): void
    {
        $this->connection->delete('blog_post', ['id' => $data['post_id']]);
    }

    /**
     * POST DOWN
     */

    public function postDown(Schema $schema): void
    {
        //recreate posts that were official responses
        $officialResponsesData = $this->getOfficialResponsesData();
        foreach ($officialResponsesData as $key => $officialResponseData) {
            $officialResponsesData[$key]['id'] = $this->createPostFromOfficialResponseData(
                $officialResponseData
            );
        }

        //remove new tables
        $this->connection->exec('DROP TABLE official_response');
        $this->connection->exec('DROP TABLE official_response_author');
        $this->connection->exec(
            'ALTER TABLE proposal_decision CHANGE official_response_id post_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\''
        );

        //restore posts in official responses
        foreach ($officialResponsesData as $officialResponseData) {
            if ($officialResponseData['proposal_decision_id']) {
                $this->addPostInProposalDecision(
                    $officialResponseData['proposal_decision_id'],
                    $officialResponseData['id']
                );
            }
        }

        //restore constraints
        $this->connection->exec(
            'ALTER TABLE proposal_decision ADD CONSTRAINT FK_65F782604B89032C FOREIGN KEY (post_id) REFERENCES blog_post (id)'
        );
        $this->connection->exec(
            'CREATE UNIQUE INDEX UNIQ_65F782604B89032C ON proposal_decision (post_id)'
        );
    }

    private function getOfficialResponsesData(): array
    {
        return $this->connection->fetchAll(
            "
            SELECT
                resp.id as official_response_id,
                resp.body,
                resp.proposal_id,
                resp.is_published, resp.updated_at, resp.created_at,
                pd.id as proposal_decision_id
            FROM
                official_response resp
            LEFT JOIN
                proposal_decision pd on pd.official_response_id = resp.id 
            "
        );
    }

    private function createPostFromOfficialResponseData(array $officialResponseData): string
    {
        $blogPostData = [
            'id' => $this->generator->generate($this->em, null),
            'dislayed_on_blog' => 0,
            'comments_count' => 0,
            'is_commentable' => 0,
            'is_published' => $officialResponseData['is_published'],
            'published_at' => $officialResponseData['is_published']
                ? $officialResponseData['created_at']
                : null,
            'updated_at' => $officialResponseData['updated_at'],
            'created_at' => $officialResponseData['created_at'],
        ];
        $this->connection->insert('blog_post', $blogPostData);

        $this->translatePost($blogPostData['id'], $officialResponseData);

        $this->addAuthorsToPosts(
            $officialResponseData['official_response_id'],
            $blogPostData['id']
        );

        return $blogPostData['id'];
    }

    private function addAuthorsToPosts(string $officialResponseId, string $blogPostId): void
    {
        $authorsData = $this->connection->fetchAll(
            'SELECT user_id FROM official_response_author WHERE official_response_id = ?',
            [$officialResponseId]
        );
        foreach ($authorsData as $authorsDatum) {
            $this->connection->insert('blog_post_authors', [
                'user_id' => $authorsDatum['user_id'],
                'post_id' => $blogPostId,
            ]);
        }
    }

    private function addPostInProposalDecision(string $proposalDecisionId, string $blogPostId): void
    {
        $this->connection->update(
            'proposal_decision',
            ['post_id' => $blogPostId],
            ['id' => $proposalDecisionId]
        );
    }

    private function translatePost(string $blogPostId, array $data): void
    {
        $id = $this->generator->generate($this->em, null);
        $blogPostTranslationData = [
            'id' => $id,
            'translatable_id' => $blogPostId,
            'slug' => "Réponse officielle $id",
            'title' => 'Réponse officielle',
            'body' => $data['body'],
            'locale' => $this->em->getRepository(Locale::class)->findDefaultLocale(),
        ];
        $this->connection->insert('blog_post_translation', $blogPostTranslationData);
    }
}
