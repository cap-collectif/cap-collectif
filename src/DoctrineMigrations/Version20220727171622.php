<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20220727171622 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'blog_post.creator';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE blog_post ADD creator_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE blog_post ADD CONSTRAINT FK_BA5AE01D61220EA6 FOREIGN KEY (creator_id) REFERENCES fos_user (id)');
        $this->addSql('CREATE INDEX IDX_BA5AE01D61220EA6 ON blog_post (creator_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE blog_post DROP FOREIGN KEY FK_BA5AE01D61220EA6');
        $this->addSql('DROP INDEX IDX_BA5AE01D61220EA6 ON blog_post');
        $this->addSql('ALTER TABLE blog_post DROP creator_id');
    }

    public function postUp(Schema $schema): void
    {
        $postIdData = $this->connection->fetchAllAssociative(
            'SELECT id from blog_post WHERE creator_id IS NULL'
        );
        foreach ($postIdData as $postsIdDatum) {
            $postId = $postsIdDatum['id'];
            $authorId = $this->connection->fetchOne(
                'SELECT user_id FROM blog_post_authors WHERE post_id=? AND user_id IS NOT NULL LIMIT 1',
                [$postId]
            );
            if ($authorId) {
                $this->connection->update(
                    'blog_post',
                    ['creator_id' => $authorId],
                    ['id' => $postId]
                );
            }
        }
    }
}
